const mailboxService = require('../../src/services/mailboxService');

describe('mailboxService', () => {
  beforeEach(() => {
    mailboxService.clear();
  });

  test('send adds a message retrievable via list', () => {
    mailboxService.send({
      to: 'user@example.com',
      subject: 'Reset your TaskFlow password',
      body: 'Reset link expires in 30 minutes.',
      resetUrl: 'http://localhost:3000/auth/reset-password/abc123',
    });

    const messages = mailboxService.list();
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({
      to: 'user@example.com',
      subject: 'Reset your TaskFlow password',
      body: 'Reset link expires in 30 minutes.',
      resetUrl: 'http://localhost:3000/auth/reset-password/abc123',
    });
    expect(messages[0].id).toBeTruthy();
    expect(messages[0].sentAt).toBeInstanceOf(Date);
  });

  test('list returns newest first', () => {
    mailboxService.send({
      to: 'first@example.com',
      subject: 'First',
      body: 'First message',
      resetUrl: 'http://localhost:3000/auth/reset-password/first',
    });
    mailboxService.send({
      to: 'second@example.com',
      subject: 'Second',
      body: 'Second message',
      resetUrl: 'http://localhost:3000/auth/reset-password/second',
    });

    const messages = mailboxService.list();
    expect(messages).toHaveLength(2);
    expect(messages[0].to).toBe('second@example.com');
    expect(messages[1].to).toBe('first@example.com');
  });

  test('clear empties the store', () => {
    mailboxService.send({
      to: 'user@example.com',
      subject: 'Reset',
      body: 'Body',
      resetUrl: 'http://localhost:3000/auth/reset-password/token',
    });

    mailboxService.clear();
    expect(mailboxService.list()).toEqual([]);
  });
});
