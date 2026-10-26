import { describe, it, expect } from 'vitest';

/**
 * Input Validation Tests
 *
 * These test the validation rules that SHOULD be enforced
 * by the capture workflow before data is stored.
 */

function validateIdeaInput(title: string, content: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  }
  if (title && title.trim().length > 200) {
    errors.push('Title must be 200 characters or fewer');
  }
  if (!content || content.trim().length === 0) {
    errors.push('Content is required');
  }
  if (content && content.length > 50000) {
    errors.push('Content must be 50,000 characters or fewer');
  }

  return { valid: errors.length === 0, errors };
}

describe('Idea Input Validation', () => {
  it('accepts valid title and content', () => {
    const result = validateIdeaInput('Raft Consensus', 'Leader leases prevent stale reads.');
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects empty title', () => {
    const result = validateIdeaInput('', 'Some content');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Title is required');
  });

  it('rejects whitespace-only title', () => {
    const result = validateIdeaInput('   ', 'Some content');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Title is required');
  });

  it('rejects empty content', () => {
    const result = validateIdeaInput('Valid Title', '');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Content is required');
  });

  it('rejects title exceeding 200 characters', () => {
    const longTitle = 'A'.repeat(201);
    const result = validateIdeaInput(longTitle, 'Content');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Title must be 200 characters or fewer');
  });

  it('rejects content exceeding 50000 characters', () => {
    const longContent = 'X'.repeat(50001);
    const result = validateIdeaInput('Title', longContent);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Content must be 50,000 characters or fewer');
  });

  it('collects multiple errors when both fields are invalid', () => {
    const result = validateIdeaInput('', '');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(2);
  });

  it('accepts a title with exactly 200 characters', () => {
    const result = validateIdeaInput('A'.repeat(200), 'Valid content');
    expect(result.valid).toBe(true);
  });
});
