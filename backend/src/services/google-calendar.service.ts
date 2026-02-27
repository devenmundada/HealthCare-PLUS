import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;
  private calendar: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // If we have a refresh token, use it
    if (process.env.GOOGLE_REFRESH_TOKEN) {
      this.oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN
      });
    }

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Get authentication URL for first-time setup
   */
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];
    
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent' // Force to get refresh token
    });
  }

  /**
   * Exchange code for tokens (first-time setup)
   */
  async getTokensFromCode(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    
    // Save refresh token to .env (you'd do this manually)
    console.log('Refresh Token:', tokens.refresh_token);
    console.log('Add this to your .env file as GOOGLE_REFRESH_TOKEN');
    
    return tokens;
  }

  /**
   * Create a Google Meet event
   */
  async createMeetingEvent(
    patientName: string,
    doctorName: string,
    startTime: Date,
    endTime: Date,
    patientEmail?: string,
    doctorEmail?: string
  ) {
    try {
      const start = startTime instanceof Date ? startTime : new Date(startTime);
      const end = endTime instanceof Date ? endTime : new Date(endTime);

      const event = {
        summary: `Medical Consultation: Dr. ${doctorName} & ${patientName}`,
        description: `Online medical consultation between Dr. ${doctorName} and ${patientName}`,
        start: {
          dateTime: start.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        end: {
          dateTime: end.toISOString(),
          timeZone: 'Asia/Kolkata',
        },
        conferenceData: {
          createRequest: {
            requestId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        attendees: [
          ...(patientEmail ? [{ email: patientEmail }] : []),
          ...(doctorEmail ? [{ email: doctorEmail }] : []),
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all', // Send emails to attendees
      });

      // Extract Meet link: hangoutLink may be deprecated, use conferenceData.entryPoints as fallback
      const meetLink =
        response.data.hangoutLink ||
        response.data.conferenceData?.entryPoints?.find(
          (ep: { entryPointType?: string }) => ep.entryPointType === 'video'
        )?.uri ||
        null;

      return {
        success: true,
        meetLink,
        eventId: response.data.id,
        calendarLink: response.data.htmlLink,
      };
    } catch (error) {
      console.error('❌ Failed to create Google Meet:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(eventId: string, updates: any) {
    try {
      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: updates,
        sendUpdates: 'all',
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Failed to update event:', error);
      return { success: false, error };
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
        sendUpdates: 'all',
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete event:', error);
      return { success: false, error };
    }
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(maxResults: number = 10) {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return { success: true, events: response.data.items };
    } catch (error) {
      console.error('❌ Failed to get events:', error);
      return { success: false, error };
    }
  }
}
