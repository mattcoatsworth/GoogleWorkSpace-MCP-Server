import { z } from 'zod';
    import { google } from 'googleapis';
    import { getOAuth2Client } from '../config/auth.js';

    // Initialize Calendar API client
    const getCalendarClient = () => {
      const auth = getOAuth2Client();
      return google.calendar({ version: 'v3', auth });
    };

    export const calendarTools = [
      {
        name: "calendar_list_events",
        description: "List events from Google Calendar",
        schema: {
          calendarId: z.string().optional().default('primary').describe("Calendar ID (default is primary)"),
          maxResults: z.number().optional().default(10).describe("Maximum number of events to return"),
          timeMin: z.string().optional().describe("Start time in ISO format (default is now)"),
          timeMax: z.string().optional().describe("End time in ISO format")
        },
        handler: async ({ calendarId, maxResults, timeMin, timeMax }) => {
          try {
            const calendar = getCalendarClient();
            
            const response = await calendar.events.list({
              calendarId,
              maxResults,
              timeMin: timeMin || new Date().toISOString(),
              timeMax: timeMax,
              singleEvents: true,
              orderBy: 'startTime'
            });
            
            const events = response.data.items;
            
            if (!events || events.length === 0) {
              return {
                content: [{ type: "text", text: "No upcoming events found." }]
              };
            }
            
            return {
              content: [{ 
                type: "text", 
                text: `Found ${events.length} events:\n\n${events.map(event => {
                  const start = event.start.dateTime || event.start.date;
                  const end = event.end.dateTime || event.end.date;
                  return `ID: ${event.id}\nSummary: ${event.summary}\nStart: ${start}\nEnd: ${end}\nLocation: ${event.location || 'N/A'}\nDescription: ${event.description || 'N/A'}\n`;
                }).join('\n')}` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error listing events: ${error.message}` }],
              isError: true
            };
          }
        }
      },
      {
        name: "calendar_create_event",
        description: "Create a new event in Google Calendar",
        schema: {
          calendarId: z.string().optional().default('primary').describe("Calendar ID (default is primary)"),
          summary: z.string().describe("Event title/summary"),
          start: z.string().describe("Start time in ISO format"),
          end: z.string().describe("End time in ISO format"),
          description: z.string().optional().describe("Event description"),
          location: z.string().optional().describe("Event location"),
          attendees: z.array(z.string()).optional().describe("Email addresses of attendees")
        },
        handler: async ({ calendarId, summary, start, end, description, location, attendees }) => {
          try {
            const calendar = getCalendarClient();
            
            const event = {
              summary,
              description,
              location,
              start: {
                dateTime: start,
                timeZone: 'UTC'
              },
              end: {
                dateTime: end,
                timeZone: 'UTC'
              }
            };
            
            if (attendees && attendees.length > 0) {
              event.attendees = attendees.map(email => ({ email }));
            }
            
            const response = await calendar.events.insert({
              calendarId,
              requestBody: event
            });
            
            return {
              content: [{ 
                type: "text", 
                text: `Event created successfully!\n\nID: ${response.data.id}\nSummary: ${response.data.summary}\nStart: ${response.data.start.dateTime}\nEnd: ${response.data.end.dateTime}\nLink: ${response.data.htmlLink}` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error creating event: ${error.message}` }],
              isError: true
            };
          }
        }
      }
    ];
