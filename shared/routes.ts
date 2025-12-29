
import { z } from 'zod';
import { insertScriptSchema, scripts } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  scripts: {
    list: {
      method: 'GET' as const,
      path: '/api/scripts',
      responses: {
        200: z.array(z.custom<typeof scripts.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/scripts/:id',
      responses: {
        200: z.custom<typeof scripts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/scripts/generate',
      input: z.object({
        prompt: z.string().min(1, "Prompt is required"),
        version: z.enum(["v1", "v2"]).default("v2"),
        apiKey: z.string().optional(),
      }),
      responses: {
        201: z.custom<typeof scripts.$inferSelect>(), // Returns the generated and saved script
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/scripts/:id',
      input: insertScriptSchema.partial(),
      responses: {
        200: z.custom<typeof scripts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/scripts/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    downloadHelper: {
      method: 'GET' as const,
      path: '/api/helpers/:name', // e.g., 'recorder', 'ocr'
      responses: {
        200: z.string(), // Returns raw AHK code content
        404: errorSchemas.notFound,
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
