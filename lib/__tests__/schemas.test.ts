import { describe, it, expect } from 'vitest';
import {
  BlogFrontmatterSchema,
  ProjectFrontmatterSchema,
  validateFrontmatter,
} from '../schemas';

describe('BlogFrontmatterSchema', () => {
  it('should validate valid blog frontmatter', () => {
    const validData = {
      title: 'Test Blog Post',
      date: '2025-01-01',
      description: 'A test description',
      tags: ['tag1', 'tag2'],
    };

    const result = BlogFrontmatterSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should accept optional description', () => {
    const validData = {
      title: 'Test Blog Post',
      date: '2025-01-01',
    };

    const result = BlogFrontmatterSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should default tags to empty array if not provided', () => {
    const validData = {
      title: 'Test Blog Post',
      date: '2025-01-01',
    };

    const result = BlogFrontmatterSchema.parse(validData);
    expect(result.tags).toEqual([]);
  });

  it('should reject missing title', () => {
    const invalidData = {
      date: '2025-01-01',
      description: 'A test description',
    };

    const result = BlogFrontmatterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject empty title', () => {
    const invalidData = {
      title: '',
      date: '2025-01-01',
    };

    const result = BlogFrontmatterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid date format', () => {
    const invalidData = {
      title: 'Test Post',
      date: '01-01-2025', // Wrong format
    };

    const result = BlogFrontmatterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid date value', () => {
    const invalidData = {
      title: 'Test Post',
      date: '2025-13-45', // Invalid month and day
    };

    const result = BlogFrontmatterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('ProjectFrontmatterSchema', () => {
  it('should validate valid project frontmatter', () => {
    const validData = {
      title: 'Test Project',
      description: 'A test project description',
      date: '2025-01-01',
      tags: ['react', 'typescript'],
      link: 'https://example.com',
      github: 'https://github.com/user/repo',
    };

    const result = ProjectFrontmatterSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should accept project without optional fields', () => {
    const validData = {
      title: 'Test Project',
      description: 'A test project description',
      date: '2025-01-01',
    };

    const result = ProjectFrontmatterSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject missing description', () => {
    const invalidData = {
      title: 'Test Project',
      date: '2025-01-01',
    };

    const result = ProjectFrontmatterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid URL for link', () => {
    const invalidData = {
      title: 'Test Project',
      description: 'A test project description',
      date: '2025-01-01',
      link: 'not-a-url',
    };

    const result = ProjectFrontmatterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid URL for github', () => {
    const invalidData = {
      title: 'Test Project',
      description: 'A test project description',
      date: '2025-01-01',
      github: 'invalid-github-url',
    };

    const result = ProjectFrontmatterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('validateFrontmatter', () => {
  it('should return success for valid data', () => {
    const data = {
      title: 'Test Post',
      date: '2025-01-01',
    };

    const result = validateFrontmatter(BlogFrontmatterSchema, data, 'test.md');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Test Post');
    }
  });

  it('should return error for invalid data', () => {
    const data = {
      date: '2025-01-01', // Missing title
    };

    const result = validateFrontmatter(BlogFrontmatterSchema, data, 'test.md');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('test.md');
    }
  });

  it('should include filename in error message', () => {
    const data = {
      title: '', // Empty title
      date: 'invalid-date',
    };

    const result = validateFrontmatter(BlogFrontmatterSchema, data, 'broken-post.md');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('broken-post.md');
    }
  });
});
