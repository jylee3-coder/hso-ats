const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

export const config = {
  api: { bodyParser: true },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!AIRTABLE_TOKEN || !BASE_ID) {
    return res.status(500).json({ error: 'Missing AIRTABLE_TOKEN or AIRTABLE_BASE_ID' });
  }

  const table    = req.query.table || 'Applicants';
  const recordId = req.query.id;
  const baseUrl  = `https://api.airtable.com/v0/${BASE_ID}`;
  const headers  = {
    'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
    'Content-Type': 'application/json',
  };

  try {
    if (req.method === 'GET') {
      let url = `${baseUrl}/${encodeURIComponent(table)}`;
      if (recordId) url += `/${recordId}`;
      const r    = await fetch(url, { headers });
      const data = await r.json();
      return res.status(r.status).json(data);
    }

    // ✅ body 파싱: Next.js bodyParser가 켜져 있으면 req.body 그대로 사용
    // 아니면 raw stream에서 직접 파싱
    let body = req.body;
    if (!body || typeof body === 'string') {
      body = await new Promise((resolve) => {
        let raw = '';
        req.on('data', chunk => raw += chunk);
        req.on('end', () => {
          try { resolve(JSON.parse(raw)); } catch { resolve({}); }
        });
      });
    }

    if (req.method === 'POST') {
      const r = await fetch(`${baseUrl}/${encodeURIComponent(table)}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ fields: body }),
      });
      const data = await r.json();
      return res.status(r.status).json(data);
    }

    if (req.method === 'PATCH') {
      if (!recordId) return res.status(400).json({ error: 'Missing record id' });
      const r = await fetch(`${baseUrl}/${encodeURIComponent(table)}/${recordId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ fields: body }),
      });
      const data = await r.json();
      return res.status(r.status).json(data);
    }

    if (req.method === 'DELETE') {
      if (!recordId) return res.status(400).json({ error: 'Missing record id' });
      const r    = await fetch(`${baseUrl}/${encodeURIComponent(table)}/${recordId}`, {
        method: 'DELETE',
        headers,
      });
      const data = await r.json();
      return res.status(r.status).json(data);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
