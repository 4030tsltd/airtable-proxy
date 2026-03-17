export default async function handler(req, res) {
    // Set comprehensive CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for now
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { table } = req.query;
    
    if (!table) {
        return res.status(400).json({ error: 'Table parameter required' });
    }

    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

    if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
        return res.status(500).json({ error: 'Airtable credentials not configured' });
    }

    try {
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${table}`;
        
        const fetchOptions = {
            method: req.method,
            headers: {
                'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        if (req.method === 'POST' && req.body) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        const response = await fetch(url, fetchOptions);
        const data = await response.json();
        
        // Forward the response with proper status
        res.status(response.status).json(data);
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: error.message });
    }
}
