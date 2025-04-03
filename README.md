# Google Workspace MCP Server

    A Model Context Protocol (MCP) server for interacting with Google Workspace APIs including Gmail, Drive, Calendar, Docs, Sheets, and Slides.

    ## Features

    - **Gmail API**: Send emails, list messages, manage labels, and more
    - **Drive API**: List files, create folders, and upload files
    - **Docs API**: Create and edit Google Docs
    - **Sheets API**: Read and write spreadsheet data
    - **Slides API**: Create presentations and slides
    - **Calendar API**: List and create calendar events
    - **Authentication**: OAuth2 authentication flow helpers

    ## Prerequisites

    - Node.js 16+
    - Google Cloud project with the necessary APIs enabled
    - OAuth 2.0 client credentials

    ## Installation

    ```bash
    npm install
    ```

    ## Configuration

    1. Copy the `.env.example` file to `.env`:
       ```bash
       cp .env.example .env
       ```

    2. Edit the `.env` file with your Google API credentials:
       ```
       CLIENT_ID=your_client_id
       CLIENT_SECRET=your_client_secret
       REDIRECT_URI=http://localhost:3000/oauth2callback
       REFRESH_TOKEN=your_refresh_token
       ```

    3. If you don't have a refresh token yet, you can use the authentication tools provided by the server to get one.

    ## Usage

    ### Starting the Server

    ```bash
    npm run dev
    ```

    ### Using with MCP Inspector

    To test the server with the MCP Inspector:

    ```bash
    npm run inspect
    ```

    This will open the MCP Inspector in your browser, allowing you to test all tools and resources.

    ### Authentication

    If you don't have a refresh token, use these tools:

    1. Use the `generate_auth_url` tool to get an authorization URL
    2. Open the URL in a browser and authorize the application
    3. Copy the authorization code from the redirect URL
    4. Use the `exchange_code_for_tokens` tool with the code to get a refresh token
    5. Add the refresh token to your `.env` file

    ## Available Tools

    ### Gmail

    - `gmail_list_messages`: List Gmail messages with optional filters
    - `gmail_get_message`: Get a specific Gmail message by ID
    - `gmail_send_message`: Send a new email message
    - `gmail_list_labels`: List all Gmail labels
    - `gmail_modify_message`: Modify a message's labels
    - `gmail_trash_message`: Move a message to trash
    - `gmail_untrash_message`: Remove a message from trash
    - `gmail_create_draft`: Create a draft email

    ### Drive

    - `drive_list_files`: List files in Google Drive
    - `drive_get_file`: Get metadata for a specific file
    - `drive_create_folder`: Create a new folder in Google Drive
    - `drive_upload_file`: Upload a file to Google Drive

    ### Docs

    - `docs_get_document`: Get the content of a Google Doc
    - `docs_create_document`: Create a new Google Doc
    - `docs_append_text`: Append text to a Google Doc

    ### Sheets

    - `sheets_get_values`: Get values from a Google Sheet
    - `sheets_update_values`: Update values in a Google Sheet
    - `sheets_create_spreadsheet`: Create a new Google Sheet

    ### Slides

    - `slides_create_presentation`: Create a new Google Slides presentation
    - `slides_get_presentation`: Get information about a Google Slides presentation
    - `slides_create_slide`: Create a new slide in a presentation

    ### Calendar

    - `calendar_list_events`: List events from Google Calendar
    - `calendar_create_event`: Create a new event in Google Calendar

    ### Authentication

    - `generate_auth_url`: Generate an OAuth2 authorization URL
    - `exchange_code_for_tokens`: Exchange an authorization code for OAuth2 tokens

    ## Available Resources

    - `gmail://message/{messageId}`: Get a specific Gmail message
    - `gmail://thread/{threadId}`: Get a Gmail thread with all messages
    - `gmail://labels`: List all Gmail labels
    - `workspace://docs/{service}`: Documentation for a specific Google Workspace API
    - `workspace://auth/guide`: Authentication guide for Google Workspace APIs

    ## License

    MIT
