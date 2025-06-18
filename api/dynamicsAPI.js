async function getAccessToken() {
  const response = await fetch('https://login.microsoftonline.com/91f02292-94e0-42fb-8c83-9f1ab8820630/oauth2/v2.0/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: '70a7167d-8125-4e50-95af-8bdf55ebaa27',
      client_secret: '1TR8Q~WYw2SVZYeC7aS1VADPYhKvORgUWKCLpavQ',
      scope: 'https://fliprecast.api.crm4.dynamics.com/.default ',
      grant_type: 'client_credentials',
    }),
  });

  const data = await response.json();
  return data.access_token;
}
