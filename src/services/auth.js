import { z } from 'zod';
    import { getAuthUrl, getTokensFromCode, SCOPES } from '../config/auth.js';

    export const authTools = [
      {
        name: "generate_auth_url",
        description: "Generate an OAuth2 authorization URL for Google Workspace APIs",
        schema: {
          services: z.array(z.enum(['gmail', 'drive', 'calendar', 'docs', 'sheets', 'slides']))
            .describe("Array of Google services to request access to")
        },
        handler: async ({ services }) => {
          try {
            const requestedScopes = [];
            services.forEach(service => {
              const serviceScopes = SCOPES[service.toUpperCase()];
              if (serviceScopes) {
                requestedScopes.push(...serviceScopes);
              }
            });

            const authUrl = getAuthUrl(requestedScopes);
            return {
              content: [{ 
                type: "text", 
                text: `Authorization URL: ${authUrl}\n\nOpen this URL in a browser to authorize the application.` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error generating auth URL: ${error.message}` }],
              isError: true
            };
          }
        }
      },
      {
        name: "exchange_code_for_tokens",
        description: "Exchange an authorization code for OAuth2 tokens",
        schema: {
          code: z.string().describe("The authorization code received from Google")
        },
        handler: async ({ code }) => {
          try {
            const tokens = await getTokensFromCode(code);
            return {
              content: [{ 
                type: "text", 
                text: `Tokens received successfully.\n\nAccess Token: ${tokens.access_token}\nRefresh Token: ${tokens.refresh_token}\n\nAdd the refresh token to your .env file as REFRESH_TOKEN=` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error exchanging code for tokens: ${error.message}` }],
              isError: true
            };
          }
        }
      }
    ];
