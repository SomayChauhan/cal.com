import ical from "node-ical";

import { symmetricDecrypt } from "@calcom/lib/crypto";
import logger from "@calcom/lib/logger";
import type { Calendar, CalendarEvent, EventBusyDate, IntegrationCalendar } from "@calcom/types/Calendar";
import type { CredentialPayload } from "@calcom/types/Credential";

const CALENDSO_ENCRYPTION_KEY = process.env.CALENDSO_ENCRYPTION_KEY || "";

export default class IcsCalendarService implements Calendar {
  private integrationName = "";
  private log: typeof logger;
  private calendar_url: string;

  constructor(credential: CredentialPayload) {
    this.integrationName = "ics_links_other_calendar";
    this.log = logger.getSubLogger({ prefix: [`[[lib] ${this.integrationName}`] });

    const decrypted_url = symmetricDecrypt(credential.key?.toString() || "", CALENDSO_ENCRYPTION_KEY);
    if (decrypted_url.endsWith(".ics")) {
      this.calendar_url = decrypted_url;
    } else {
      throw Error(`invalid link`);
    }
    // this.calendarData = this.getCalendarData(url)
    //   .then((r) => r)
    //   .catch((_e) => {
    //     throw Error(`invalid link`);
    //   });
    // console.log("thiscalendarData: ", this.calendarData);
  }

  async getCalendarData() {
    try {
      const data = await ical.async.fromURL(this.calendar_url);
      if (Object.keys(data).length == 0) {
        throw Error();
      } else {
        return data;
      }
    } catch (error) {
      throw Error(
        "Unable to fetch events. Please check if the calendar URL is valid and if the calendar is public."
      );
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createEvent(_event: CalendarEvent): Promise<any> {
    // ics links are only read-only, cannot create events
    return Promise.resolve();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateEvent(_uid: string, _event: CalendarEvent): Promise<any> {
    // ics links are only read-only, cannot update events
    return Promise.resolve();
  }

  async deleteEvent(_uid: string): Promise<void> {
    // ics links are only read-only, cannot delete events
    return Promise.resolve();
  }

  async getAvailability(
    _dateFrom: string,
    _dateTo: string,
    _selectedCalendars: IntegrationCalendar[]
  ): Promise<EventBusyDate[]> {
    return Promise.resolve([]);
  }

  async listCalendars(_event?: CalendarEvent): Promise<IntegrationCalendar[]> {
    return Promise.resolve([]);
  }
}
