import { mockCategories } from "../data/mockCategories";
import { mockEvents } from "../data/mockEvents";
import { mockUsers } from "../data/mockUsers";
import { mockTags } from "../data/mockTags";
import type { EventItem } from "../types/event";
import { randomDelay } from "../utils/delay";
import { readStorage, writeStorage } from "./storage";

const EVENTS_KEY = "event-manager-events";

export const mockApi = {
  async getEvents(): Promise<EventItem[]> {
    await randomDelay();
    return readStorage<EventItem[]>(EVENTS_KEY, mockEvents);
  },

  async createEvent(event: EventItem): Promise<EventItem> {
    await randomDelay();

    const events = readStorage<EventItem[]>(EVENTS_KEY, mockEvents);
    const updatedEvents = [...events, event];

    writeStorage(EVENTS_KEY, updatedEvents);

    return event;
  },

  async updateEvent(event: EventItem): Promise<EventItem> {
    await randomDelay();

    const events = readStorage<EventItem[]>(EVENTS_KEY, mockEvents);
    const updatedEvents = events.map((item) =>
      item.id === event.id ? event : item
    );

    writeStorage(EVENTS_KEY, updatedEvents);

    return event;
  },

  async deleteEvent(eventId: string): Promise<void> {
    await randomDelay();

    const events = readStorage<EventItem[]>(EVENTS_KEY, mockEvents);
    const updatedEvents = events.filter((event) => event.id !== eventId);

    writeStorage(EVENTS_KEY, updatedEvents);
  },

  async getCategories() {
    await randomDelay();
    return mockCategories;
  },

  async getTags() {
    await randomDelay();
    return mockTags;
  },

  async getUsers() {
    await randomDelay();
    return mockUsers;
  },
};
