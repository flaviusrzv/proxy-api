// api/proxy.js - Proxy pentru userscript
export default async function handler(req, res) {
  // Configurare CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { url, method = 'GET', headers = {}, body } = req.body || req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL este obligatoriu' });
    }

    // Validare URL pentru securitate
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return res.status(400).json({ error: 'URL invalid' });
    }

    // Configurare request
    const fetchOptions = {
      method: method.toUpperCase(),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...headers
      }
    };

    // Adaugă body pentru POST/PUT
    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    // Fă request-ul
    const response = await fetch(url, fetchOptions);
    const data = await response.text();
    
    // Returnează răspunsul
    res.status(response.status).json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: data,
      responseURL: response.url
    });

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Eroare la procesarea request-ului',
      message: error.message 
    });
  }
}