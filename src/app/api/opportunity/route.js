export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const projectNumber = searchParams.get('projectNumber');

  if (!projectNumber) {
    return new Response(JSON.stringify({ error: 'Missing projectNumber' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
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
      return new Response(JSON.stringify({ error: 'Token fetch failed', detail: errText }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { access_token } = await tokenRes.json();

    // Step 2: Fetch opportunity from Dynamics
    const url = `${DYNAMICS_API_BASE}/opportunities?$filter=startswith(ergo_projectnumber, '${projectNumber.trim()}')`;

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
      return new Response(JSON.stringify({ error: 'Dynamics fetch failed', detail: errText }), {
        status: oppRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await oppRes.json();
    return new Response(JSON.stringify(data.value[0] || null), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Unexpected error in opportunity API:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
