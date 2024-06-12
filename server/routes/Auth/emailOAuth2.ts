import type { Middleware } from "../../router";
import { google } from "googleapis";

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);

//
//
// Used ONLY by getToken.js
//
//

// Middleware for handling OAuth2 callback
export const emailOAuth2Middleware: Middleware = async (req, res) => {
    const reqUrl = new URL(req.url || '', `http://${req.headers.host}`);
    const code = reqUrl.searchParams.get('code');
    console.log(code);
    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing code parameter');
      return;
    }
    try {
      const { tokens } = await oAuth2Client.getToken(code);
      console.log("here");
      oAuth2Client.setCredentials(tokens);
      console.log('Token:', tokens);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Authentication successful! You can close this tab.');
    } catch (err) {
      console.error('Error retrieving access token', err);
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Error retrieving access token');
    }
  };