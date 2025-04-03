import { z } from 'zod';
    import { google } from 'googleapis';
    import { getOAuth2Client } from '../config/auth.js';

    // Initialize Sheets API client
    const getSheetsClient = () => {
      const auth = getOAuth2Client();
      return google.sheets({ version: 'v4', auth });
    };

    export const sheetsTools = [
      {
        name: "sheets_get_values",
        description: "Get values from a Google Sheet",
        schema: {
          spreadsheetId: z.string().describe("ID of the spreadsheet"),
          range: z.string().describe("A1 notation range to retrieve")
        },
        handler: async ({ spreadsheetId, range }) => {
          try {
            const sheets = getSheetsClient();
            const response = await sheets.spreadsheets.values.get({
              spreadsheetId,
              range
            });
            
            const values = response.data.values;
            
            if (!values || values.length === 0) {
              return {
                content: [{ type: "text", text: "No data found in the specified range." }]
              };
            }
            
            // Format the values as a table
            const formattedValues = values.map(row => row.join('\t')).join('\n');
            
            return {
              content: [{ 
                type: "text", 
                text: `Values from ${range}:\n\n${formattedValues}` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error retrieving sheet values: ${error.message}` }],
              isError: true
            };
          }
        }
      },
      {
        name: "sheets_update_values",
        description: "Update values in a Google Sheet",
        schema: {
          spreadsheetId: z.string().describe("ID of the spreadsheet"),
          range: z.string().describe("A1 notation range to update"),
          values: z.array(z.array(z.string())).describe("2D array of values to update")
        },
        handler: async ({ spreadsheetId, range, values }) => {
          try {
            const sheets = getSheetsClient();
            const response = await sheets.spreadsheets.values.update({
              spreadsheetId,
              range,
              valueInputOption: 'USER_ENTERED',
              requestBody: {
                values
              }
            });
            
            return {
              content: [{ 
                type: "text", 
                text: `Values updated successfully!\n\nRange: ${response.data.updatedRange}\nCells updated: ${response.data.updatedCells}` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error updating sheet values: ${error.message}` }],
              isError: true
            };
          }
        }
      },
      {
        name: "sheets_create_spreadsheet",
        description: "Create a new Google Sheet",
        schema: {
          title: z.string().describe("Title of the spreadsheet"),
          sheets: z.array(z.string()).optional().describe("Names of sheets to create")
        },
        handler: async ({ title, sheets }) => {
          try {
            const sheetsClient = getSheetsClient();
            
            const requestBody = {
              properties: {
                title
              }
            };
            
            if (sheets && sheets.length > 0) {
              requestBody.sheets = sheets.map(sheetTitle => ({
                properties: {
                  title: sheetTitle
                }
              }));
            }
            
            const response = await sheetsClient.spreadsheets.create({
              requestBody
            });
            
            const spreadsheet = response.data;
            
            return {
              content: [{ 
                type: "text", 
                text: `Spreadsheet created successfully!\n\nTitle: ${spreadsheet.properties.title}\nSpreadsheet ID: ${spreadsheet.spreadsheetId}\nURL: https://docs.google.com/spreadsheets/d/${spreadsheet.spreadsheetId}/edit` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error creating spreadsheet: ${error.message}` }],
              isError: true
            };
          }
        }
      }
    ];
