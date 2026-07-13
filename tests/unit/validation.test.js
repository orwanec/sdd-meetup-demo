const {
  isValidEmail,
  normalizeEmail,
  sanitizeString,
  sanitizeText,
} = require('../../src/utils/validation');

describe('validation utilities (Milestone 6)', () => {
  describe('sanitizeString', () => {
    test('trims whitespace and removes null bytes', () => {
      expect(sanitizeString('  hello\0world  ')).toBe('helloworld');
    });

    test('returns empty string for non-string input', () => {
      expect(sanitizeString(null)).toBe('');
      expect(sanitizeString(undefined)).toBe('');
      expect(sanitizeString(123)).toBe('');
    });

    test('enforces max length', () => {
      expect(sanitizeString('a'.repeat(300), 200)).toHaveLength(200);
    });
  });

  describe('sanitizeText', () => {
    test('preserves internal newlines after trim', () => {
      expect(sanitizeText('  line one\nline two  ')).toBe('line one\nline two');
    });

    test('removes null bytes from multiline text', () => {
      expect(sanitizeText('safe\0unsafe')).toBe('safeunsafe');
    });
  });

  describe('email helpers', () => {
    test('normalizeEmail lowercases and trims', () => {
      expect(normalizeEmail('  User@Example.COM  ')).toBe('user@example.com');
    });

    test('isValidEmail rejects malformed addresses', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('user@example.com')).toBe(true);
    });
  });
});
