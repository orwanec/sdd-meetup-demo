const { initDatabase, closeDatabase } = require('../../src/db');
const {
  register,
  login,
  validateEmail,
  validatePassword,
} = require('../../src/services/authService');

describe('authService (Milestone 7)', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  afterEach(async () => {
    await closeDatabase();
  });

  describe('validatePassword', () => {
    test('rejects empty password', () => {
      expect(validatePassword('')).toEqual({
        ok: false,
        message: 'Password is required.',
      });
    });

    test('rejects password shorter than 8 characters', () => {
      expect(validatePassword('short')).toEqual({
        ok: false,
        message: 'Password must be at least 8 characters.',
      });
    });

    test('accepts valid password', () => {
      expect(validatePassword('password123')).toEqual({ ok: true });
    });
  });

  describe('validateEmail', () => {
    test('rejects malformed email', async () => {
      const result = await validateEmail('not-an-email');
      expect(result.ok).toBe(false);
      expect(result.message).toBe('Email must be a valid email address.');
    });

    test('rejects duplicate email', async () => {
      await register('dup@example.com', 'password123');
      const result = await validateEmail('dup@example.com');
      expect(result.ok).toBe(false);
      expect(result.status).toBe(409);
      expect(result.message).toBe('Email is already registered.');
    });

    test('accepts new valid email', async () => {
      const result = await validateEmail('new@example.com');
      expect(result).toEqual({ ok: true, email: 'new@example.com' });
    });
  });

  describe('register', () => {
    test('creates user with hashed password', async () => {
      const user = await register('user@example.com', 'password123');
      expect(user).toEqual({ id: expect.any(Number), email: 'user@example.com' });
    });

    test('rejects invalid email', async () => {
      await expect(register('bad-email', 'password123')).rejects.toMatchObject({
        status: 400,
        message: 'Email must be a valid email address.',
      });
    });

    test('rejects short password', async () => {
      await expect(register('user@example.com', 'short')).rejects.toMatchObject({
        status: 400,
        message: 'Password must be at least 8 characters.',
      });
    });

    test('rejects duplicate email', async () => {
      await register('dup@example.com', 'password123');
      await expect(register('dup@example.com', 'password123')).rejects.toMatchObject({
        status: 409,
        message: 'Email is already registered.',
      });
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await register('login@example.com', 'password123');
    });

    test('returns user for valid credentials', async () => {
      const user = await login('login@example.com', 'password123');
      expect(user).toEqual({ id: expect.any(Number), email: 'login@example.com' });
    });

    test('rejects unknown email', async () => {
      await expect(login('missing@example.com', 'password123')).rejects.toMatchObject({
        status: 401,
        message: 'Invalid credentials.',
      });
    });

    test('rejects wrong password', async () => {
      await expect(login('login@example.com', 'wrong-password')).rejects.toMatchObject({
        status: 401,
        message: 'Invalid credentials.',
      });
    });

    test('rejects malformed email without revealing account existence', async () => {
      await expect(login('not-an-email', 'password123')).rejects.toMatchObject({
        status: 401,
        message: 'Invalid credentials.',
      });
    });
  });
});
