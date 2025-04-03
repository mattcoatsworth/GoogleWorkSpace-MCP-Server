import { google } from 'googleapis';
    import dotenv from 'dotenv';

    dotenv.config();

    // OAuth2 client setup
    export const getOAuth2Client = () => {
      const oauth2Client = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URI
      );

      // Set credentials if refresh token is available
      if (process.env.REFRESH_TOKEN) {
        oauth2Client.setCredentials({
          refresh_token: process.env.REFRESH_TOKEN
        });
      }

      return oauth2Client;
    };

    // Generate authentication URL
    export const getAuthUrl = (scopes) => {
      const oauth2Client = getOAuth2Client();
      return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
      });
    };

    // Get tokens from code
    export const getTokensFromCode = async (code) => {
      const oauth2Client = getOAuth2Client();
      const { tokens } = await oauth2Client.getToken(code);
      return tokens;
    };

    // Common scopes
    export const SCOPES = {
      GMAIL: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.compose',
        'https://www.googleapis.com/auth/gmail.modify'
      ],
      DRIVE: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file'
      ],
      CALENDAR: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ],
      DOCS: ['https://www.googleapis.com/auth/documents'],
      SHEETS: ['https://www.googleapis.com/auth/spreadsheets'],
      SLIDES: ['https://www.googleapis.com/auth/presentations']
    };
