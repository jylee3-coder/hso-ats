const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.AIRTABLE_BASE_ID;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const table = req.query.table || 'Applicants';
  const recordId = req.query.id;
  const baseUrl = `https://api.airtable.com/v0/${BASE_ID}`;
  const headers = {
    'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
    'Content-Type': 'application/json',
  };

  try {
    if (req.method === 'GET') {
      let url = `${baseUrl}/${encodeURIComponent(table)}`;
      if (recordId) url += `/${recordId}`;
      const r = await fetch(url, { headers });
      const data = await r.json();
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const r = await fetch(`${baseUrl}/${encodeURIComponent(table)}`, {
        method: 'POST', headers,
        body: JSON.stringify({ fields: req.body }),
      });
      const data = await r.json();
      return res.status(200).json(data);
    }

    if (req.method === 'PATCH') {
      const r = await fetch(`${baseUrl}/${encodeURIComponent(table)}/${recordId}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ fields: req.body }),
      });
      const data = await r.json();
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const r = await fetch(`${baseUrl}/${encodeURIComponent(table)}/${recordId}`, {
        method: 'DELETE', headers,
      });
      const data = await r.json();
      return res.status(200).json(data);
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
