import { z } from 'zod';
    import { google } from 'googleapis';
    import { getOAuth2Client } from '../config/auth.js';

    // Initialize Drive API client
    const getDriveClient = () => {
      const auth = getOAuth2Client();
      return google.drive({ version: 'v3', auth });
    };

    export const driveTools = [
      {
        name: "drive_list_files",
        description: "List files in Google Drive",
        schema: {
          maxResults: z.number().optional().default(10).describe("Maximum number of files to return"),
          query: z.string().optional().describe("Search query for files"),
          folderId: z.string().optional().describe("ID of folder to list files from")
        },
        handler: async ({ maxResults, query, folderId }) => {
          try {
            const drive = getDriveClient();
            
            let q = query || '';
            if (folderId) {
              q = q ? `${q} and '${folderId}' in parents` : `'${folderId}' in parents`;
            }
            
            const response = await drive.files.list({
              pageSize: maxResults,
              q,
              fields: 'files(id, name, mimeType, webViewLink, createdTime, modifiedTime, size)'
            });
            
            const files = response.data.files;
            
            if (!files || files.length === 0) {
              return {
                content: [{ type: "text", text: "No files found matching the criteria." }]
              };
            }
            
            return {
              content: [{ 
                type: "text", 
                text: `Found ${files.length} files:\n\n${files.map(file => 
                  `ID: ${file.id}\nName: ${file.name}\nType: ${file.mimeType}\nCreated: ${file.createdTime}\nModified: ${file.modifiedTime}\nSize: ${file.size || 'N/A'}\nLink: ${file.webViewLink || 'N/A'}\n`
                ).join('\n')}` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error listing files: ${error.message}` }],
              isError: true
            };
          }
        }
      },
      {
        name: "drive_create_folder",
        description: "Create a new folder in Google Drive",
        schema: {
          name: z.string().describe("Name of the folder to create"),
          parentId: z.string().optional().describe("ID of the parent folder")
        },
        handler: async ({ name, parentId }) => {
          try {
            const drive = getDriveClient();
            
            const fileMetadata = {
              name,
              mimeType: 'application/vnd.google-apps.folder'
            };
            
            if (parentId) {
              fileMetadata.parents = [parentId];
            }
            
            const response = await drive.files.create({
              requestBody: fileMetadata,
              fields: 'id, name, webViewLink'
            });
            
            const folder = response.data;
            
            return {
              content: [{ 
                type: "text", 
                text: `Folder created successfully!\n\nID: ${folder.id}\nName: ${folder.name}\nLink: ${folder.webViewLink}` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error creating folder: ${error.message}` }],
              isError: true
            };
          }
        }
      },
      {
        name: "drive_upload_file",
        description: "Upload a file to Google Drive (note: actual file upload not possible in this MCP implementation)",
        schema: {
          name: z.string().describe("Name for the file"),
          mimeType: z.string().describe("MIME type of the file"),
          parentId: z.string().optional().describe("ID of the parent folder"),
          content: z.string().describe("Text content for the file (for demonstration purposes)")
        },
        handler: async ({ name, mimeType, parentId, content }) => {
          try {
            const drive = getDriveClient();
            
            const fileMetadata = {
              name,
              mimeType
            };
            
            if (parentId) {
              fileMetadata.parents = [parentId];
            }
            
            // Note: In a real implementation, we would use a media upload
            // This is a simplified version that creates an empty file
            const response = await drive.files.create({
              requestBody: fileMetadata,
              fields: 'id, name, webViewLink'
            });
            
            return {
              content: [{ 
                type: "text", 
                text: `File created successfully! (Note: This is a demonstration - in a real implementation, the file would contain the provided content)\n\nID: ${response.data.id}\nName: ${response.data.name}\nLink: ${response.data.webViewLink}` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error uploading file: ${error.message}` }],
              isError: true
            };
          }
        }
      }
    ];
