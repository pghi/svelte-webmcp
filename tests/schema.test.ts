import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { zodToJsonSchema } from '../src/lib/schema.js'

describe('zodToJsonSchema', () => {
  it('converts string fields', () => {
    const result = zodToJsonSchema({ name: z.string() })
    expect(result).toEqual({
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
    })
  })

  it('converts number fields', () => {
    const result = zodToJsonSchema({ count: z.number() })
    expect(result).toEqual({
      type: 'object',
      properties: { count: { type: 'number' } },
      required: ['count'],
    })
  })

  it('converts boolean fields', () => {
    const result = zodToJsonSchema({ active: z.boolean() })
    expect(result).toEqual({
      type: 'object',
      properties: { active: { type: 'boolean' } },
      required: ['active'],
    })
  })

  it('handles optional fields', () => {
    const result = zodToJsonSchema({
      name: z.string(),
      age: z.number().optional(),
    })
    expect(result).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
      required: ['name'],
    })
  })

  it('preserves descriptions', () => {
    const result = zodToJsonSchema({
      query: z.string().describe('Search term'),
    })
    expect(result).toEqual({
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term' },
      },
      required: ['query'],
    })
  })

  it('converts enum fields', () => {
    const result = zodToJsonSchema({
      color: z.enum(['red', 'green', 'blue']),
    })
    expect(result).toEqual({
      type: 'object',
      properties: {
        color: { type: 'string', enum: ['red', 'green', 'blue'] },
      },
      required: ['color'],
    })
  })

  it('converts array fields', () => {
    const result = zodToJsonSchema({
      tags: z.array(z.string()),
    })
    expect(result).toEqual({
      type: 'object',
      properties: {
        tags: { type: 'array', items: { type: 'string' } },
      },
      required: ['tags'],
    })
  })

  it('converts nested objects', () => {
    const result = zodToJsonSchema({
      address: z.object({
        street: z.string(),
        zip: z.string().optional(),
      }),
    })
    expect(result).toEqual({
      type: 'object',
      properties: {
        address: {
          type: 'object',
          properties: {
            street: { type: 'string' },
            zip: { type: 'string' },
          },
          required: ['street'],
        },
      },
      required: ['address'],
    })
  })

  it('handles empty schema', () => {
    const result = zodToJsonSchema({})
    expect(result).toEqual({
      type: 'object',
      properties: {},
    })
  })

  it('handles mixed required and optional', () => {
    const result = zodToJsonSchema({
      name: z.string(),
      email: z.string().describe('Email address'),
      phone: z.string().optional(),
    })
    expect(result).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string' },
      },
      required: ['name', 'email'],
    })
  })
})
