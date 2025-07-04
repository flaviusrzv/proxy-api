export default async function handler(req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).send("Missing 'url' parameter");

  try {
    const r = await fetch(url);
    const contentType = r.headers.get('content-type') || 'text/plain';
    const data = await r.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Content-Type", contentType);
    res.status(r.status).send(data);
  } catch (err) {
    res.status(500).send("Proxy error: " + err.message);
  }
}
