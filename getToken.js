// Generate a token (acces_token, refresh_token, type, expiration) for Google OAuth2
// Run with "bun getToken.js"

const { google } = require('googleapis');
const readline = require('readline');

// Can't import from meta.env? Why?

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const url = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

console.log('Autorizare - click:', url);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Copy-paste la cod: ', (code) => {
  rl.close();
  oAuth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error retrieving access token', err);
    console.log('Token:', token);
  });
});
