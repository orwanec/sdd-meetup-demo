const { hashPassword, comparePassword } = require('../../src/services/passwordService');

describe('passwordService (Milestone 6)', () => {
  test('hashPassword returns a bcrypt hash, not plaintext', async () => {
    const plain = 'password123';
    const hash = await hashPassword(plain);

    expect(hash).not.toBe(plain);
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  test('comparePassword validates correct and incorrect passwords', async () => {
    const plain = 'password123';
    const hash = await hashPassword(plain);

    expect(await comparePassword(plain, hash)).toBe(true);
    expect(await comparePassword('wrong-password', hash)).toBe(false);
  });
});
