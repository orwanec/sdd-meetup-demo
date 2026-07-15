const crypto = require('crypto');
const { initDatabase, closeDatabase, getDb } = require('../../src/db');
const { register } = require('../../src/services/authService');
const mailboxService = require('../../src/services/mailboxService');
const passwordResetService = require('../../src/services/passwordResetService');

function dbRun(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function extractTokenFromUrl(resetUrl) {
  return resetUrl.split('/').pop();
}

describe('passwordResetService', () => {
  beforeEach(async () => {
    await initDatabase();
    mailboxService.clear();
  });

  afterEach(async () => {
    await closeDatabase();
  });

  test('requestReset with unknown email does not insert token or enqueue message', async () => {
    await passwordResetService.requestReset('unknown@example.com');

    const db = getDb();
    const row = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) AS count FROM password_reset_tokens', [], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    expect(row.count).toBe(0);
    expect(mailboxService.list()).toEqual([]);
  });

  test('requestReset with known email creates token, invalidates previous tokens, enqueues message', async () => {
    await register('reset@example.com', 'password123');

    await passwordResetService.requestReset('reset@example.com');
    const firstMessages = mailboxService.list();
    expect(firstMessages).toHaveLength(1);
    const firstToken = extractTokenFromUrl(firstMessages[0].resetUrl);

    await passwordResetService.requestReset('reset@example.com');
    const secondMessages = mailboxService.list();
    expect(secondMessages).toHaveLength(2);
    const secondToken = extractTokenFromUrl(secondMessages[0].resetUrl);

    expect(firstToken).not.toBe(secondToken);
    expect(await passwordResetService.findValidToken(firstToken)).toBeNull();
    expect(await passwordResetService.findValidToken(secondToken)).toMatchObject({
      email: 'reset@example.com',
    });
  });

  test('findValidToken rejects expired and used tokens', async () => {
    await register('expired@example.com', 'password123');
    await passwordResetService.requestReset('expired@example.com');

    const token = extractTokenFromUrl(mailboxService.list()[0].resetUrl);
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const db = getDb();
    await dbRun(
      db,
      'UPDATE password_reset_tokens SET expires_at = ? WHERE token_hash = ?',
      ['2000-01-01T00:00:00.000Z', tokenHash]
    );

    expect(await passwordResetService.findValidToken(token)).toBeNull();

    await dbRun(
      db,
      'UPDATE password_reset_tokens SET expires_at = ? WHERE token_hash = ?',
      [new Date(Date.now() + 30 * 60 * 1000).toISOString(), tokenHash]
    );

    await passwordResetService.resetPassword(token, 'newpassword123');
    expect(await passwordResetService.findValidToken(token)).toBeNull();
  });

  test('resetPassword updates hash and sets used_at', async () => {
    await register('update@example.com', 'password123');
    await passwordResetService.requestReset('update@example.com');

    const token = extractTokenFromUrl(mailboxService.list()[0].resetUrl);
    await passwordResetService.resetPassword(token, 'newpassword456');

    const { login } = require('../../src/services/authService');
    await expect(login('update@example.com', 'password123')).rejects.toMatchObject({
      status: 401,
    });
    const user = await login('update@example.com', 'newpassword456');
    expect(user.email).toBe('update@example.com');

    const db = getDb();
    const row = await new Promise((resolve, reject) => {
      db.get(
        'SELECT used_at FROM password_reset_tokens WHERE token_hash = ?',
        [crypto.createHash('sha256').update(token).digest('hex')],
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    expect(row.used_at).toBeTruthy();
  });
});
