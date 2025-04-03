import { z } from 'zod';
    import { google } from 'googleapis';
    import { getOAuth2Client } from '../config/auth.js';

    // Initialize Slides API client
    const getSlidesClient = () => {
      const auth = getOAuth2Client();
      return google.slides({ version: 'v1', auth });
    };

    export const slidesTools = [
      {
        name: "slides_create_presentation",
        description: "Create a new Google Slides presentation",
        schema: {
          title: z.string().describe("Title of the presentation")
        },
        handler: async ({ title }) => {
          try {
            const slides = getSlidesClient();
            const response = await slides.presentations.create({
              requestBody: {
                title
              }
            });
            
            const presentation = response.data;
            
            return {
              content: [{ 
                type: "text", 
                text: `Presentation created successfully!\n\nTitle: ${presentation.title}\nPresentation ID: ${presentation.presentationId}\nURL: https://docs.google.com/presentation/d/${presentation.presentationId}/edit` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error creating presentation: ${error.message}` }],
              isError: true
            };
          }
        }
      },
      {
        name: "slides_get_presentation",
        description: "Get information about a Google Slides presentation",
        schema: {
          presentationId: z.string().describe("ID of the presentation to retrieve")
        },
        handler: async ({ presentationId }) => {
          try {
            const slides = getSlidesClient();
            const response = await slides.presentations.get({
              presentationId
            });
            
            const presentation = response.data;
            
            return {
              content: [{ 
                type: "text", 
                text: `Presentation Information:\n\nTitle: ${presentation.title}\nPresentation ID: ${presentation.presentationId}\nSlides: ${presentation.slides?.length || 0}\nRevision ID: ${presentation.revisionId}` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error retrieving presentation: ${error.message}` }],
              isError: true
            };
          }
        }
      },
      {
        name: "slides_create_slide",
        description: "Create a new slide in a presentation",
        schema: {
          presentationId: z.string().describe("ID of the presentation"),
          layoutId: z.string().optional().describe("ID of the layout to use (optional)")
        },
        handler: async ({ presentationId, layoutId }) => {
          try {
            const slides = getSlidesClient();
            
            const requests = [{
              createSlide: {}
            }];
            
            if (layoutId) {
              requests[0].createSlide.slideLayoutReference = {
                layoutId
              };
            }
            
            const response = await slides.presentations.batchUpdate({
              presentationId,
              requestBody: {
                requests
              }
            });
            
            const createSlideResponse = response.data.replies[0].createSlide;
            
            return {
              content: [{ 
                type: "text", 
                text: `Slide created successfully!\n\nSlide ID: ${createSlideResponse.objectId}` 
              }]
            };
          } catch (error) {
            return {
              content: [{ type: "text", text: `Error creating slide: ${error.message}` }],
              isError: true
            };
          }
        }
      }
    ];
