import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';

    export const workspaceResources = [
      {
        name: "workspace_api_docs",
        template: new ResourceTemplate("workspace://docs/{service}", { list: undefined }),
        handler: async (uri, { service }) => {
          const serviceMap = {
            'gmail': {
              title: 'Gmail API Documentation',
              description: 'The Gmail API lets you view and manage Gmail mailbox data like threads, messages, and labels.',
              url: 'https://developers.google.com/gmail/api/guides',
              endpoints: [
                { name: 'users.messages.list', description: 'Lists the messages in the user\'s mailbox.' },
                { name: 'users.messages.get', description: 'Gets the specified message.' },
                { name: 'users.messages.send', description: 'Sends the specified message to recipients.' },
                { name: 'users.labels.list', description: 'Lists all labels in the user\'s mailbox.' },
                { name: 'users.threads.list', description: 'Lists the threads in the user\'s mailbox.' }
              ]
            },
            'drive': {
              title: 'Google Drive API Documentation',
              description: 'The Drive API allows you to create, share, and manage files stored in Google Drive.',
              url: 'https://developers.google.com/drive/api/guides/about-sdk',
              endpoints: [
                { name: 'files.list', description: 'Lists or searches files.' },
                { name: 'files.get', description: 'Gets a file\'s metadata or content by ID.' },
                { name: 'files.create', description: 'Creates a new file.' },
                { name: 'files.update', description: 'Updates a file\'s metadata and/or content.' },
                { name: 'files.delete', description: 'Permanently deletes a file.' }
              ]
            },
            'docs': {
              title: 'Google Docs API Documentation',
              description: 'The Docs API allows you to create, read, and edit Google Docs.',
              url: 'https://developers.google.com/docs/api/guides/concepts',
              endpoints: [
                { name: 'documents.get', description: 'Gets the latest version of the specified document.' },
                { name: 'documents.create', description: 'Creates a new document.' },
                { name: 'documents.batchUpdate', description: 'Applies one or more updates to the document.' }
              ]
            },
            'sheets': {
              title: 'Google Sheets API Documentation',
              description: 'The Sheets API allows you to read, write, and format data in Sheets.',
              url: 'https://developers.google.com/sheets/api/guides/concepts',
              endpoints: [
                { name: 'spreadsheets.get', description: 'Returns the spreadsheet at the given ID.' },
                { name: 'spreadsheets.create', description: 'Creates a spreadsheet.' },
                { name: 'spreadsheets.values.get', description: 'Returns a range of values from a spreadsheet.' },
                { name: 'spreadsheets.values.update', description: 'Sets values in a range of a spreadsheet.' }
              ]
            },
            'slides': {
              title: 'Google Slides API Documentation',
              description: 'The Slides API allows you to create and edit Google Slides presentations.',
              url: 'https://developers.google.com/slides/api/guides/concepts',
              endpoints: [
                { name: 'presentations.get', description: 'Gets the latest version of the specified presentation.' },
                { name: 'presentations.create', description: 'Creates a new presentation.' },
                { name: 'presentations.batchUpdate', description: 'Applies one or more updates to the presentation.' }
              ]
            },
            'calendar': {
              title: 'Google Calendar API Documentation',
              description: 'The Calendar API allows you to display, create and modify calendar events.',
              url: 'https://developers.google.com/calendar/api/guides/overview',
              endpoints: [
                { name: 'events.list', description: 'Returns events on the specified calendar.' },
                { name: 'events.get', description: 'Returns an event.' },
                { name: 'events.insert', description: 'Creates an event.' },
                { name: 'events.update', description: 'Updates an event.' },
                { name: 'events.delete', description: 'Deletes an event.' }
              ]
            }
          };

          const serviceInfo = serviceMap[service.toLowerCase()];
          
          if (!serviceInfo) {
            return {
              contents: [{
                uri: uri.href,
                text: `Documentation not found for service: ${service}\n\nAvailable services: ${Object.keys(serviceMap).join(', ')}`
              }]
            };
          }
          
          let content = `# ${serviceInfo.title}\n\n`;
          content += `${serviceInfo.description}\n\n`;
          content += `Official Documentation: ${serviceInfo.url}\n\n`;
          content += `## Key Endpoints\n\n`;
          
          serviceInfo.endpoints.forEach(endpoint => {
            content += `- ${endpoint.name}: ${endpoint.description}\n`;
          });
          
          content += `\n## MCP Tools for ${service}\n\n`;
          
          // Add MCP tool references based on service
          switch (service.toLowerCase()) {
            case 'gmail':
              content += `- gmail_list_messages: List Gmail messages with optional filters\n`;
              content += `- gmail_get_message: Get a specific Gmail message by ID\n`;
              content += `- gmail_send_message: Send a new email message\n`;
              content += `- gmail_list_labels: List all Gmail labels\n`;
              content += `- gmail_modify_message: Modify a message's labels\n`;
              break;
            case 'drive':
              content += `- drive_list_files: List files in Google Drive\n`;
              content += `- drive_create_folder: Create a new folder in Google Drive\n`;
              content += `- drive_upload_file: Upload a file to Google Drive\n`;
              break;
            case 'docs':
              content += `- docs_get_document: Get the content of a Google Doc\n`;
              content += `- docs_create_document: Create a new Google Doc\n`;
              content += `- docs_append_text: Append text to a Google Doc\n`;
              break;
            case 'sheets':
              content += `- sheets_get_values: Get values from a Google Sheet\n`;
              content += `- sheets_update_values: Update values in a Google Sheet\n`;
              content += `- sheets_create_spreadsheet: Create a new Google Sheet\n`;
              break;
            case 'slides':
              content += `- slides_create_presentation: Create a new Google Slides presentation\n`;
              content += `- slides_get_presentation: Get information about a Google Slides presentation\n`;
              content += `- slides_create_slide: Create a new slide in a presentation\n`;
              break;
            case 'calendar':
              content += `- calendar_list_events: List events from Google Calendar\n`;
              content += `- calendar_create_event: Create a new event in Google Calendar\n`;
              break;
          }
          
          return {
            contents: [{
              uri: uri.href,
              text: content
            }]
          };
        }
      },
      {
        name: "workspace_auth_guide",
        template: new ResourceTemplate("workspace://auth/guide", { list: undefined }),
        handler: async (uri) => {
          const content = `# Google Workspace API Authentication Guide

## Overview

To use the Google Workspace MCP server, you need to set up OAuth 2.0 authentication with Google. This guide explains how to:

1. Create a Google Cloud project
2. Configure OAuth consent screen
3. Create OAuth client credentials
4. Obtain a refresh token
5. Configure the MCP server with your credentials

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project"
3. Enter a project name and click "Create"

## Step 2: Enable APIs

For each Google Workspace API you want to use, you need to enable it in your project:

1. In the Cloud Console, go to "APIs & Services" > "Library"
2. Search for the APIs you need (Gmail, Drive, Docs, Sheets, etc.)
3. Select each API and click "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type (unless you have a Google Workspace organization)
3. Fill in the required information:
   - App name
   - User support email
   - Developer contact information
4. Add the scopes you need for your application
5. Add test users (your Google account email)

## Step 4: Create OAuth Client ID

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application" as the application type
4. Add a name for your client
5. Add authorized redirect URIs (e.g., http://localhost:3000/oauth2callback)
6. Click "Create"
7. Note your Client ID and Client Secret

## Step 5: Get a Refresh Token

Use the MCP server's auth tools to get a refresh token:

1. Use the \`generate_auth_url\` tool with the services you need
2. Open the URL in a browser and authorize the application
3. Copy the authorization code from the redirect URL
4. Use the \`exchange_code_for_tokens\` tool with the code to get a refresh token

## Step 6: Configure the MCP Server

1. Create a \`.env\` file based on the \`.env.example\` template
2. Add your Client ID, Client Secret, and Refresh Token
3. Restart the MCP server

## Using the MCP Server

Once configured, you can use all the tools and resources provided by the MCP server to interact with Google Workspace APIs.`;

          return {
            contents: [{
              uri: uri.href,
              text: content
            }]
          };
        }
      }
    ];
