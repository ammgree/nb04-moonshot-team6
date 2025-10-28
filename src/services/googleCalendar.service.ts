import { google } from "googleapis";
import prisma from "../configs/prisma.js";

export class GoogleCalendarService {
  private static async getOAuthClient(userId: number) {
    const token = await prisma.googleToken.findUnique({
      where: { userId },
    });

    if (!token) return null;

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
    });

    return oauth2Client;
  }

  static async createEvent(userId: number, task: any): Promise<string | null> {
    const oauth2Client = await this.getOAuthClient(userId);
    if (!oauth2Client) return null;

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const oneDayInMillis = 24 * 60 * 60 * 1000;
    const startDate = getKSTDateString(task.startAt);
    const endDate = getKSTDateString(
      new Date(task.endAt.getTime() + oneDayInMillis)
    );

    const event = {
      summary: task.title,
      start: { date: startDate },
      end: { date: endDate },
    };

    const result = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
    });

    return result.data.id ?? null;
  }

  static async updateEvent(
    userId: number,
    googleEventId: string,
    task: any
  ): Promise<void> {
    const oauth2Client = await this.getOAuthClient(userId);
    if (!oauth2Client) return;

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const oneDayInMillis = 24 * 60 * 60 * 1000;
    const startDate = getKSTDateString(task.startAt);
    const endDate = getKSTDateString(
      new Date(task.endAt.getTime() + oneDayInMillis)
    );

    await calendar.events.update({
      calendarId: "primary",
      eventId: googleEventId,
      requestBody: {
        summary: task.title,
        description: task.content,
        start: { date: startDate },
        end: { date: endDate },
      },
    });
  }

  static async deleteEvent(
    userId: number,
    googleEventId: string
  ): Promise<void> {
    const oauth2Client = await this.getOAuthClient(userId);
    if (!oauth2Client) return;

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    await calendar.events.delete({
      calendarId: "primary",
      eventId: googleEventId,
    });
  }
}

function getKSTDateString(date: Date): string {
  const kstOffset = 9 * 60; // +9시간
  const kstTime = new Date(date.getTime() + kstOffset * 60 * 1000);
  return kstTime.toISOString().substring(0, 10);
}
