module.exports = async function handler(req, res) {
  const backendBase = (process.env.VITE_API_URL || process.env.BACKEND_URL || '').trim();

  if (!backendBase) {
    res.status(500).json({
      message: 'Backend URL is not configured. Set VITE_API_URL or BACKEND_URL in Vercel.',
    });
    return;
  }

  const incomingPath = req.url || '/';
  const [pathOnly] = incomingPath.split('?');
  const pathSuffix = pathOnly.startsWith('/api') ? pathOnly.slice('/api'.length) || '/' : pathOnly;
  const targetBase = backendBase.replace(/\/$/, '');
  const normalizedBase = targetBase.endsWith('/api') ? targetBase : `${targetBase}/api`;
  const targetUrl = new URL(`${normalizedBase}${pathSuffix}${incomingPath.includes('?') ? incomingPath.slice(incomingPath.indexOf('?')) : ''}`);

  const headers = {};
  for (const [key, value] of Object.entries(req.headers || {})) {
    if (!value) continue;
    if (key === 'host') continue;
    headers[key] = Array.isArray(value) ? value[0] : value;
  }

  const body = await new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: body ? body : undefined,
  });

  const responseText = await response.text();

  res.status(response.status);
  res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (responseText) {
    res.send(responseText);
  } else {
    res.end();
  }
};
