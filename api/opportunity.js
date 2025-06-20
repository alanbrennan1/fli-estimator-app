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

const sectorMap = {
  100000000: 'Water',
  100000001: 'Industrial',
  100000002: 'Transportation',
  100000003: 'Comms',
  100000004: 'Energy',
  100000005: 'Residential',
  100000006: 'Bespoke',
};

  const salesStageMap = {
  1: "Estimation",
  2: "Site Suspended",
  100000001: "Tender & Quotation",
  100000002: "Negotiation/Close",
  100000003: "Decision Due",
  100000004: "Design Order",
  100000005: "Awaiting Approval",
  100000006: "Approval Granted",
  100000007: "Production Order",
  100000022: "Information Required",
  100000023: "Design",
  100000024: "Engineering Input",
  100000025: "Pricing Review"
};

 
  const productTypeMap = {
  100000000: 'Baffle Walls',
  100000039: 'Bespoke',
  100000001: 'Bespoke Culverts',
  100000004: 'Bespoke Precast Plinths',
  100000005: 'Blast Walls',
  100000006: 'Bund',
  100000007: 'Cable Troughs',
  100000040: 'Chamber',
  100000008: 'Risers',
  100000010: 'Circular Settlement Tanks (Launder)',
  100000011: 'Communication Vaults',
  100000012: 'Spillways',
  100000013: 'Contact Tanks',
  100000014: 'Cover Slabs',
  100000019: 'Foundation Bases',
  100000041: 'ICF',
  100000025: 'LV Chambers',
  100000027: 'MV Chambers',
  100000038: 'Open Top Rectangular Tank',
  100000028: 'Precast Concrete Equipment Pads',
  100000029: 'Retaining Walls',
  100000030: 'Security Barriers',
  100000031: 'Service Reservoirs',
  100000033: 'Slot Drains',
  100000042: 'Storage Tank',
  100000034: 'Stormcast Attenuation Tank',
  100000035: 'Textured Decorative Walls',
  100000043: 'Water Ireland',
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

    const contactName = opportunity._parentcontactid_value
      ? await fetchName('contacts', opportunity._parentcontactid_value, 'fullname')
      : null;

    const salespersonName = opportunity._ownerid_value
      ? await fetchName('systemusers', opportunity._ownerid_value, 'fullname')
      : null;

    const currency = opportunity._transactioncurrencyid_value
      ? await fetchName('transactioncurrencies', opportunity._transactioncurrencyid_value, 'currencyname')
      : null;

    const endClientName = opportunity._ergo_endclient_value
      ? await fetchName('accounts', opportunity._ergo_endclient_value)
      : null;

    

    // Step 4: Return cleaned payload
return res.status(200).json({
  projectNumber: opportunity.ergo_projectnumber || '',
  projectName: opportunity.name || '',
  accountName: accountName || '',
  accountContact: contactName || '',
  endClient: endClientName || '',
  salesperson: salespersonName || '',
  sector: sectorMap[opportunity.ergo_sector] || '',
  closeDate: opportunity.actualclosedate || opportunity.estimatedclosedate || '',
  currency: currency || '',
  probability: opportunity.closeprobability || '',
  reqProducts: productTypeMap[opportunity.ergo_highlevelproductsrequired] || '',
  region: opportunity.ergo_projectcountry || '',
  returnDate: opportunity.ergo_requestedreturndate || '',
  salesStage: salesStageMap[opportunity.statuscode] || '',
  oppDescription: opportunity.description || '',
  address: opportunity.ergo_projectaddressline1 || '',
  projectCity: opportunity.ergo_projectcity || '',
  projectState: opportunity.ergo_projectstate || '',
  projectPostcode: opportunity.ergo_projectpostcode || '',
  projectCountry: opportunity.ergo_projectcountry || '',
  countryCode: opportunity.ergo_countrycode || ''
});



    
  } catch (err) {
    console.error('❌ Unexpected error in /api/opportunity:', err);
    return res.status(500).json({ error: err.message });
  }
}
