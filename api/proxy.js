// api/proxy.js - Versiunea fixată pentru encoding UTF-8
export default async function handler(req, res) {
  // Configurare CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Api-Key');
  
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

    // Configurare request cu encoding corect
    const fetchOptions = {
      method: method.toUpperCase(),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...headers
      }
    };

    // Adaugă body pentru POST/PUT cu encoding UTF-8 corect
    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      // Asigurăm că body-ul este un string valid UTF-8
      if (typeof body === 'string') {
        fetchOptions.body = body;
      } else {
        fetchOptions.body = JSON.stringify(body);
      }
    }

    console.log('Request details:', {
      url: url,
      method: method,
      headers: fetchOptions.headers,
      bodyLength: fetchOptions.body ? fetchOptions.body.length : 0
    });

    // Fă request-ul
    const response = await fetch(url, fetchOptions);
    
    // Citim răspunsul ca text pentru a evita probleme de encoding
    const responseText = await response.text();
    
    // Construim headers object din response
    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    
    // Returnează răspunsul
    res.status(200).json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      data: responseText,
      responseURL: response.url
    });

  } catch (error) {
    console.error('Proxy error:', error);
    
    // Logging detaliat pentru debugging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({ 
      error: 'Eroare la procesarea request-ului',
      message: error.message,
      type: error.name || 'UnknownError'
    });
  }
}
