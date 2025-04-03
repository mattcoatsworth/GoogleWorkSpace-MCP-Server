import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
    import { google } from 'googleapis';
    import { getOAuth2Client } from '../config/auth.js';

    // Initialize Gmail API client
    const getGmailClient = () => {
      const auth = getOAuth2Client();
      return google.gmail({ version: 'v1', auth });
    };

    export const gmailResources = [
      {
        name: "gmail_message",
        template: new ResourceTemplate("gmail://message/{messageId}", { list: undefined }),
        handler: async (uri, { messageId }) => {
          try {
            const gmail = getGmailClient();
            const response = await gmail.users.messages.get({
              userId: 'me',
              id: messageId,
              format: 'full'
            });

            const message = response.data;
            const headers = message.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value || '(No Subject)';
            const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
            const to = headers.find(h => h.name === 'To')?.value || 'Unknown';
            const date = headers.find(h => h.name === 'Date')?.value || '';

            // Extract message body
            let body = '';
            if (message.payload.body && message.payload.body.data) {
              body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
            } else if (message.payload.parts) {
              // Handle multipart messages
              const textParts = message.payload.parts.filter(part => 
                part.mimeType === 'text/plain' || part.mimeType === 'text/html'
              );
              
              if (textParts.length > 0 && textParts[0].body.data) {
                body = Buffer.from(textParts[0].body.data, 'base64').toString('utf-8');
              }
            }

            return {
              contents: [{
                uri: uri.href,
                text: `Message ID: ${message.id}
Thread ID: ${message.threadId}
Subject: ${subject}
From: ${from}
To: ${to}
Date: ${date}

Body:
${body}`
              }]
            };
          } catch (error) {
            return {
              contents: [{
                uri: uri.href,
                text: `Error retrieving message: ${error.message}`
              }]
            };
          }
        }
      },
      {
        name: "gmail_thread",
        template: new ResourceTemplate("gmail://thread/{threadId}", { list: undefined }),
        handler: async (uri, { threadId }) => {
          try {
            const gmail = getGmailClient();
            const response = await gmail.users.threads.get({
              userId: 'me',
              id: threadId
            });

            const thread = response.data;
            let threadContent = `Thread ID: ${thread.id}\nMessages: ${thread.messages.length}\n\n`;

            // Process each message in the thread
            thread.messages.forEach((message, index) => {
              const headers = message.payload.headers;
              const subject = headers.find(h => h.name === 'Subject')?.value || '(No Subject)';
              const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
              const date = headers.find(h => h.name === 'Date')?.value || '';

              // Extract message body
              let body = '';
              if (message.payload.body && message.payload.body.data) {
                body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
              } else if (message.payload.parts) {
                const textParts = message.payload.parts.filter(part => 
                  part.mimeType === 'text/plain' || part.mimeType === 'text/html'
                );
                
                if (textParts.length > 0 && textParts[0].body.data) {
                  body = Buffer.from(textParts[0].body.data, 'base64').toString('utf-8');
                }
              }

              threadContent += `--- Message ${index + 1} ---\n`;
              threadContent += `Message ID: ${message.id}\n`;
              threadContent += `Subject: ${subject}\n`;
              threadContent += `From: ${from}\n`;
              threadContent += `Date: ${date}\n\n`;
              threadContent += `${body}\n\n`;
            });

            return {
              contents: [{
                uri: uri.href,
                text: threadContent
              }]
            };
          } catch (error) {
            return {
              contents: [{
                uri: uri.href,
                text: `Error retrieving thread: ${error.message}`
              }]
            };
          }
        }
      },
      {
        name: "gmail_labels",
        template: new ResourceTemplate("gmail://labels", { list: undefined }),
        handler: async (uri) => {
          try {
            const gmail = getGmailClient();
            const response = await gmail.users.labels.list({
              userId: 'me'
            });
            
            const labels = response.data.labels;
            let labelsContent = "Gmail Labels:\n\n";
            
            labels.forEach(label => {
              labelsContent += `ID: ${label.id}\n`;
              labelsContent += `Name: ${label.name}\n`;
              labelsContent += `Type: ${label.type}\n`;
              labelsContent += `Messages: ${label.messagesTotal || 0}\n`;
              labelsContent += `Unread: ${label.messagesUnread || 0}\n\n`;
            });
            
            return {
              contents: [{
                uri: uri.href,
                text: labelsContent
              }]
            };
          } catch (error) {
            return {
              contents: [{
                uri: uri.href,
                text: `Error retrieving labels: ${error.message}`
              }]
            };
          }
        }
      }
    ];
