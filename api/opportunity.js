export default async function handler(req, res) {
  const { projectNumber } = req.query;

  if (!projectNumber) {
    return res.status(400).json({ error: 'Missing projectNumber' });
  }

  const TENANT_ID = '91f02292-94e0-42fb-8c83-9f1ab8820630';
  const CLIENT_ID = '70a7167d-8125-4e50-95af-8bdf55ebaa27';
  const CLIENT_SECRET = '1TR8Q~WYw2SVZYeC7aS1VADPYhKvORgUWKCLpavQ';
  const DYNAMICS_RESOURCE = 'https://fliprecast.api.crm4.dynamics.com';
  const DYNAMICS_API_BASE = `${DYNAMICS_RESOURCE}/api/data/v9.2`;

  try {
    // Step 1: Get access token
    const tokenRes = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        scope: `${DYNAMICS_RESOURCE}/.default`,
        grant_type: 'client_credentials',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return res.status(500).json({ error: 'Token fetch failed', detail: errText });
    }

    const { access_token } = await tokenRes.json();

    // Step 2: Fetch opportunity from Dynamics
    const url = `${DYNAMICS_API_BASE}/opportunities?$filter=startswith(ergo_projectnumber, '${projectNumber.trim()}')&$expand=parentaccountid($select=name)`;

    const oppRes = await fetch(url, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/json',
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
      },
    });

    if (!oppRes.ok) {
      const errText = await oppRes.text();
      return res.status(oppRes.status).json({ error: 'Dynamics fetch failed', detail: errText });
    }

    const data = await oppRes.json();
    return res.status(200).json(data.value[0] || null);
  } catch (err) {
    console.error('Unexpected error in opportunity API:', err);
    return res.status(500).json({ error: err.message });
  }
}
