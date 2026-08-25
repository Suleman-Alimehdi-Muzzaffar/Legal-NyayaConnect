import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn', () => {
  it('merges tailwind classes', () => {
    expect(cn('px-2', 'py-2')).toBe('px-2 py-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });
});

describe('auth flow', () => {
  it('validates email format', () => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect(re.test('support@nyayaconnect.in')).toBe(true);
    expect(re.test('bad-email')).toBe(false);
  });
});
