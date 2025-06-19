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

  const headers = {
    Authorization: '',
    Accept: 'application/json',
    'OData-MaxVersion': '4.0',
    'OData-Version': '4.0',
  };

  try {
    // Step 1: Access token
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
    headers.Authorization = `Bearer ${access_token}`;

    // Step 2: Fetch opportunity
    const oppUrl = `${DYNAMICS_API_BASE}/opportunities?$filter=startswith(ergo_projectnumber, '${projectNumber.trim()}')`;
    const oppRes = await fetch(oppUrl, { headers });

    if (!oppRes.ok) {
      const errText = await oppRes.text();
      return res.status(oppRes.status).json({ error: 'Opportunity fetch failed', detail: errText });
    }

    const oppData = await oppRes.json();
    const opportunity = oppData.value[0];

    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    // Step 3: Lookup helpers
    const fetchName = async (entity, guid, field = 'name') => {
      const url = `${DYNAMICS_API_BASE}/${entity}(${guid})?$select=${field}`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        const json = await res.json();
        return json[field];
      }
      return null;
    };

    const accountName = opportunity._parentaccountid_value
      ? await fetchName('accounts', opportunity._parentaccountid_value)
      : null;

    const contactName = opportunity._contactid_value
      ? await fetchName('contacts', opportunity._contactid_value, 'fullname')
      : null;

    const salespersonName = opportunity._ownerid_value
      ? await fetchName('systemusers', opportunity._ownerid_value, 'fullname')
      : null;

    const currency = opportunity._transactioncurrencyid_value
      ? await fetchName('transactioncurrencies', opportunity._transactioncurrencyid_value, 'currencyname')
      : null;

    // Step 4: Return cleaned payload
    return res.status(200).json({
      projectNumber: opportunity.ergo_projectnumber,
      projectName: opportunity.name,
      description: opportunity.description,
      address: opportunity.ergo_projectaddressline1 || '',
      closeDate: opportunity.actualclosedate || '',
      returnDate: opportunity.ergo_requestedreturndate || '',
      accountName,
      contactName,
      salespersonName,
      currency,
      // 👇 leaving raw sector code as-is for now
      sector: opportunity.ergo_sector,
    });
  } catch (err) {
    console.error('❌ Unexpected error in /api/opportunity:', err);
    return res.status(500).json({ error: err.message });
  }
}
