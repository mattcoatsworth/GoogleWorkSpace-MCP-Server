import { z } from 'zod';
    import { google } from 'googleapis';
    import { getOAuth2Client } from '../config/auth.js';

    // Initialize Gmail API client
    const getGmailClient = () => {
      const auth = getOAuth2Client();
      return google.gmail({ version: 'v1', auth });
    };

    export const gmailTools = [
      {
        name: "gmail_list_messages",
        description: "List Gmail messages with optional filters",
        schema: {
          maxResults: z.number().optional().default(10).describe("Maximum number of messages to return"),
          query: z.string().optional().describe("Search query (same format as Gmail search box)"),
          labelIds: z.array(z.string()).optional().describe("Only return messages with these labels")
        },
        handler: async ({ maxResults, query, labelIds }) => {
          try {
            const gmail = getGmailClient();
            const response = await gmail.users.messages.list({
              userId: 'me',
              maxResults,
              q: query,
              labelIds
            });

            if (!response.data.messages || response.data.messages.length === 0) {
              return {
                content: [{ type: "text", text: "No messages found matching the criteria." }]
              };
            }

            // Get details for each message
            const messagePromises = response.data.messages.map(async (message) => {
              const details = await gmail.users.messages.get({
                userId: 'me',
                id: message.id,
                format: 'metadata',
                metadataHeaders: ['Subject', 'From', 'Date']
              });
              
              const headers = details.data.payload.headers;
              const subject = headers.find(h => h.name === 'Subject')?.value || '(No Subject)';
              const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
              const date = headers.find(h => h.name === 'Date')?.value || '';
              
              return {
                id: message.id,
                threadId: message.threadId,
                subject,
                from,
                date,
                snippet: details.data.snippet
              };
            });

            const messages = await Promise.all(messagePromises);
            
            return {
              content: [{ 
                type: "text", 
                text: `Found ${messages.length} messages:\n\n${messages.map(msg => 
                  `ID: ${msg.id}\nSubject: ${msg.subject}\nFrom: ${msg.from}\nDate: ${msg.date}\nSnippet: ${msg.snippet}\n`
                ).join('\n')}` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error listing messages: ${error.message}` }],
              isError: true
            };
          }
        }
      },
      {
        name: "gmail_get_message",
        description: "Get a specific Gmail message by ID",
        schema: {
          messageId: z.string().describe("ID of the message to retrieve"),
          format: z.enum(['full', 'metadata', 'minimal']).optional().default('full').describe("Format of the message")
        },
        handler: async ({ messageId, format }) => {
          try {
            const gmail = getGmailClient();
            const response = await gmail.users.messages.get({
              userId: 'me',
              id: messageId,
              format
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
              content: [{ 
                type: "text", 
                text: `Message ID: ${message.id}\nThread ID: ${message.threadId}\nSubject: ${subject}\nFrom: ${from}\nTo: ${to}\nDate: ${date}\n\nBody:\n${body}` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error retrieving message: ${error.message}` }],
              isError: true
            };
          }
        }
      },
      {
        name: "gmail_send_message",
        description: "Send a new email message",
        schema: {
          to: z.string().describe("Recipient email address"),
          subject: z.string().describe("Email subject"),
          body: z.string().describe("Email body content"),
          cc: z.string().optional().describe("CC recipients"),
          bcc: z.string().optional().describe("BCC recipients")
        },
        handler: async ({ to, subject, body, cc, bcc }) => {
          try {
            const gmail = getGmailClient();
            
            // Construct email
            let email = [
              `To: ${to}`,
              `Subject: ${subject}`
            ];
            
            if (cc) email.push(`Cc: ${cc}`);
            if (bcc) email.push(`Bcc: ${bcc}`);
            
            email = email.concat(['', body]).join('\r\n');
            
            // Encode the email
            const encodedEmail = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            
            // Send the email
            const response = await gmail.users.messages.send({
              userId: 'me',
              requestBody: {
                raw: encodedEmail
              }
            });
            
            return {
              content: [{ 
                type: "text", 
                text: `Email sent successfully!\nMessage ID: ${response.data.id}` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error sending email: ${error.message}` }],
              isError: true
            };
          }
        }
      },
      {
        name: "gmail_list_labels",
        description: "List all Gmail labels",
        schema: {},
        handler: async () => {
          try {
            const gmail = getGmailClient();
            const response = await gmail.users.labels.list({
              userId: 'me'
            });
            
            const labels = response.data.labels;
            
            return {
              content: [{ 
                type: "text", 
                text: `Gmail Labels:\n\n${labels.map(label => 
                  `ID: ${label.id}\nName: ${label.name}\nType: ${label.type}\n`
                ).join('\n')}` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error listing labels: ${error.message}` }],
              isError: true
            };
          }
        }
      },
      {
        name: "gmail_modify_message",
        description: "Modify a message's labels",
        schema: {
          messageId: z.string().describe("ID of the message to modify"),
          addLabelIds: z.array(z.string()).optional().describe("Labels to add to the message"),
          removeLabelIds: z.array(z.string()).optional().describe("Labels to remove from the message")
        },
        handler: async ({ messageId, addLabelIds, removeLabelIds }) => {
          try {
            const gmail = getGmailClient();
            const response = await gmail.users.messages.modify({
              userId: 'me',
              id: messageId,
              requestBody: {
                addLabelIds,
                removeLabelIds
              }
            });
            
            return {
              content: [{ 
                type: "text", 
                text: `Message modified successfully!\nMessage ID: ${response.data.id}\nThread ID: ${response.data.threadId}\nLabels: ${response.data.labelIds.join(', ')}` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error modifying message: ${error.message}` }],
              isError: true
            };
          }
        }
      }
    ];
