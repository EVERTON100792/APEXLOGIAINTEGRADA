export default async function handler(req, res) {
    // Adicionando headers CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Ou especifique o domínio da Vercel
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

    // Respond to OPTIONS method for CORS preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    const { endpoint, apiKey, payload } = req.body;

    if (!endpoint || !apiKey || !payload) {
        res.status(400).json({ error: 'Missing endpoint, apiKey or payload.' });
        return;
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errText = await response.text();
            res.status(response.status).json({ error: `OpenCode API Error: ${errText}` });
            return;
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        console.error("Vercel Function Error:", error);
        res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
}
