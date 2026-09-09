export default async function handler(req, res) {
const { code } = req.query;
const clientId = process.env.OAUTH_CLIENT_ID;
const clientSecret = process.env.OAUTH_CLIENT_SECRET;

try {
const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });
const tokenData = await tokenRes.json();

if (tokenData.error) {
res.status(400).send('Error: ' + (tokenData.error_description || tokenData.error));
return;
}

const payload = JSON.stringify({ token: tokenData.access_token, provider: 'github' });

const html =
'<script>' +
'const receiveMessage = (message) => {' +
'window.opener.postMessage(' +
"'authorization:github:success:" + payload + "'," +
"'*'" +
');' +
'window.removeEventListener("message", receiveMessage, false);' +
'};' +
'window.addEventListener("message", receiveMessage, false);' +
'window.opener.postMessage("authorizing:github", "*");' +
'</script>';

res.setHeader('Content-Type', 'text/html');
res.status(200).send(html);
} catch (err) {
res.status(500).send('Authentication failed: ' + err.message);
}
}
