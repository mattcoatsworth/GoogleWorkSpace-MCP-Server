import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
    import { gmailTools } from './services/gmail.js';
    import { driveTools } from './services/drive.js';
    import { calendarTools } from './services/calendar.js';
    import { docsTools } from './services/docs.js';
    import { sheetsTools } from './services/sheets.js';
    import { slidesTools } from './services/slides.js';
    import { authTools } from './services/auth.js';
    import { gmailResources } from './resources/gmail.js';
    import { workspaceResources } from './resources/workspace.js';

    // Create an MCP server for Google Workspace APIs
    const server = new McpServer({
      name: "Google Workspace API",
      version: "1.0.0",
      description: "MCP Server for interacting with Google Workspace APIs including Gmail, Drive, Calendar, Docs, Sheets, and Slides"
    });

    // Register all tools
    const registerTools = (toolsArray) => {
      toolsArray.forEach(tool => {
        server.tool(
          tool.name,
          tool.schema,
          tool.handler,
          { description: tool.description }
        );
      });
    };

    // Register all resources
    const registerResources = (resourcesArray) => {
      resourcesArray.forEach(resource => {
        server.resource(
          resource.name,
          resource.template,
          resource.handler
        );
      });
    };

    // Register all tools
    registerTools(gmailTools);
    registerTools(driveTools);
    registerTools(calendarTools);
    registerTools(docsTools);
    registerTools(sheetsTools);
    registerTools(slidesTools);
    registerTools(authTools);

    // Register all resources
    registerResources(gmailResources);
    registerResources(workspaceResources);

    export { server };
