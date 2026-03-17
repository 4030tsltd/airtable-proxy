// api/proxy.js
export default async function handler(req, res) {
    // Enable CORS for your Nexudus domain
    res.setHeader('Access-Control-Allow-Origin', 'https://tradespace2360.spaces.nexudus.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Get table name from query (e.g., ?table=Members)
    const { table } = req.query;
    
    if (!table) {
        return res.status(400).json({ error: 'Table parameter required' });
    }

    // Your Airtable credentials - these will be set as environment variables
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

    if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID) {
        return res.status(500).json({ error: 'Airtable credentials not configured' });
    }

    try {
        // Build Airtable URL
        const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${table}`;
        
        // Prepare fetch options
        const fetchOptions = {
            method: req.method,
            headers: {
                'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        // Add body for POST requests
        if (req.method === 'POST' && req.body) {
            fetchOptions.body = JSON.stringify(req.body);
        }

        // Forward the request to Airtable
        const response = await fetch(url, fetchOptions);
        const data = await response.json();

        // Return the response
        res.status(response.status).json(data);
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: error.message });
    }
}