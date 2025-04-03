import { z } from 'zod';
    import { google } from 'googleapis';
    import { getOAuth2Client } from '../config/auth.js';

    // Initialize Docs API client
    const getDocsClient = () => {
      const auth = getOAuth2Client();
      return google.docs({ version: 'v1', auth });
    };

    export const docsTools = [
      {
        name: "docs_get_document",
        description: "Get the content of a Google Doc",
        schema: {
          documentId: z.string().describe("ID of the document to retrieve")
        },
        handler: async ({ documentId }) => {
          try {
            const docs = getDocsClient();
            const response = await docs.documents.get({
              documentId
            });
            
            const document = response.data;
            
            // Extract basic document info
            const info = {
              title: document.title,
              documentId: document.documentId,
              revisionId: document.revisionId,
              createdTime: document.createdTime
            };
            
            return {
              content: [{ 
                type: "text", 
                text: `Document Information:\n\nTitle: ${info.title}\nDocument ID: ${info.documentId}\nRevision ID: ${info.revisionId}\nCreated: ${info.createdTime}\n\nNote: Full document content extraction requires parsing the document structure.` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error retrieving document: ${error.message}` }],
              isError: true
            };
          }
        }
      },
      {
        name: "docs_create_document",
        description: "Create a new Google Doc",
        schema: {
          title: z.string().describe("Title of the document")
        },
        handler: async ({ title }) => {
          try {
            const docs = getDocsClient();
            const response = await docs.documents.create({
              requestBody: {
                title
              }
            });
            
            const document = response.data;
            
            return {
              content: [{ 
                type: "text", 
                text: `Document created successfully!\n\nTitle: ${document.title}\nDocument ID: ${document.documentId}\nURL: https://docs.google.com/document/d/${document.documentId}/edit` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error creating document: ${error.message}` }],
              isError: true
            };
          }
        }
      },
      {
        name: "docs_append_text",
        description: "Append text to a Google Doc",
        schema: {
          documentId: z.string().describe("ID of the document to update"),
          text: z.string().describe("Text to append to the document")
        },
        handler: async ({ documentId, text }) => {
          try {
            const docs = getDocsClient();
            
            // First, get the document to find the end index
            const document = await docs.documents.get({
              documentId
            });
            
            // Find the end index of the document
            const endIndex = document.data.body.content[document.data.body.content.length - 1].endIndex - 1;
            
            // Append text to the document
            const response = await docs.documents.batchUpdate({
              documentId,
              requestBody: {
                requests: [
                  {
                    insertText: {
                      location: {
                        index: endIndex
                      },
                      text
                    }
                  }
                ]
              }
            });
            
            return {
              content: [{ 
                type: "text", 
                text: `Text appended successfully to document ${documentId}!` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error appending text: ${error.message}` }],
              isError: true
            };
          }
        }
      }
    ];
