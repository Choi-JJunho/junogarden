import { z } from 'zod';

/**
 * Zod schemas for validating frontmatter in markdown files
 */

// Blog post frontmatter schema
export const BlogFrontmatterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, 'Invalid date'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
});

export type BlogFrontmatter = z.infer<typeof BlogFrontmatterSchema>;

// Project frontmatter schema
export const ProjectFrontmatterSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const parsed = new Date(date);
      return !isNaN(parsed.getTime());
    }, 'Invalid date'),
  tags: z.array(z.string()).optional().default([]),
  link: z.string().url().optional(),
  github: z.string().url().optional(),
});

export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatterSchema>;

/**
 * Validate and parse frontmatter with Zod
 * Returns parsed data or null with error details
 */
export function validateFrontmatter<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  fileName: string
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues
      ?.map((err) => `${err.path.join('.')}: ${err.message}`)
      .join(', ') || result.error.message;

    console.error(`❌ Invalid frontmatter in ${fileName}:`, errors);

    return {
      success: false,
      error: `Invalid frontmatter in ${fileName}: ${errors}`,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
