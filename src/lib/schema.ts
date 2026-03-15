import type { ZodType } from 'zod'

/**
 * Converts a record of Zod schemas to JSON Schema v7 compatible with WebMCP.
 */
export function zodToJsonSchema(schema: Record<string, ZodType>): object {
  const properties: Record<string, object> = {}
  const required: string[] = []

  for (const [key, zodSchema] of Object.entries(schema)) {
    properties[key] = zodSchemaToProperty(zodSchema)
    if (!isOptional(zodSchema)) {
      required.push(key)
    }
  }

  return {
    type: 'object',
    properties,
    ...(required.length > 0 ? { required } : {}),
  }
}

function isOptional(schema: ZodType): boolean {
  const def = (schema as any)._def
  return def?.typeName === 'ZodOptional' || def?.typeName === 'ZodDefault'
}

function zodSchemaToProperty(schema: ZodType): object {
  const def = (schema as any)._def
  const description = def?.description

  // Unwrap optional/default
  if (def?.typeName === 'ZodOptional' || def?.typeName === 'ZodDefault') {
    const inner = zodSchemaToProperty(def.innerType)
    return description ? { ...inner, description } : inner
  }

  const base = zodTypeToJsonSchema(def)
  return description ? { ...base, description } : base
}

function zodTypeToJsonSchema(def: any): object {
  switch (def?.typeName) {
    case 'ZodString':
      return { type: 'string' }
    case 'ZodNumber':
      return { type: 'number' }
    case 'ZodBoolean':
      return { type: 'boolean' }
    case 'ZodEnum':
      return { type: 'string', enum: def.values }
    case 'ZodArray': {
      const items = zodSchemaToProperty(def.type)
      return { type: 'array', items }
    }
    case 'ZodObject': {
      const shape = def.shape()
      const properties: Record<string, object> = {}
      const required: string[] = []
      for (const [key, value] of Object.entries(shape)) {
        properties[key] = zodSchemaToProperty(value as ZodType)
        if (!isOptional(value as ZodType)) {
          required.push(key)
        }
      }
      return {
        type: 'object',
        properties,
        ...(required.length > 0 ? { required } : {}),
      }
    }
    case 'ZodLiteral':
      return { type: typeof def.value, const: def.value }
    default:
      return {}
  }
}
