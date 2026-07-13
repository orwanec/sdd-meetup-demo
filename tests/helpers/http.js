function extractCsrfToken(html) {
  const match = html.match(/name="_csrf"\s+value="([^"]+)"/);
  if (!match) {
    throw new Error('CSRF token not found in response HTML');
  }
  return match[1];
}

async function getCsrfToken(agent, url) {
  const res = await agent.get(url);
  return extractCsrfToken(res.text);
}

async function postFormWithCsrf(agent, url, data, formUrl = url) {
  const token = await getCsrfToken(agent, formUrl);
  return agent.post(url).type('form').send({ ...data, _csrf: token });
}

async function registerAndLogin(agent, email = 'tasks@example.com', password = 'password123') {
  await postFormWithCsrf(agent, '/auth/register', { email, password }, '/auth/register');
  await postFormWithCsrf(agent, '/auth/login', { email, password }, '/auth/login');
}

module.exports = {
  extractCsrfToken,
  getCsrfToken,
  postFormWithCsrf,
  registerAndLogin,
};
