// /api/dynamicsAPI.js

const TENANT_ID = '91f02292-94e0-42fb-8c83-9f1ab8820630';
const CLIENT_ID = '70a7167d-8125-4e50-95af-8bdf55ebaa27';
const CLIENT_SECRET = '1TR8Q~WYw2SVZYeC7aS1VADPYhKvORgUWKCLpavQ';
const DYNAMICS_RESOURCE = ' https://fliprecast.api.crm4.dynamics.com';

const DYNAMICS_API_BASE = `https://${DYNAMICS_RESOURCE}/api/data/v9.2`;

// 🔐 Step 1: Get OAuth2 Access Token
export async function getAccessToken() {
  const response = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: `https://${DYNAMICS_RESOURCE}/.default`,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

// 🔎 Step 2: Fetch Opportunity by ID
export async function fetchOpportunityById(opportunityId) {
  const token = await getAccessToken();

  const url = `${DYNAMICS_API_BASE}/opportunities(${opportunityId})?$select=opportunityid,ergo_projectname,accountidname,contactidname,ergo_endclient,ergo_sector,actualclosedate,tranactioncurrencyid,ergo_marginpercentage,ergo_productname,salesstage`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Opportunity fetch failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}
