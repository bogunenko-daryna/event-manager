import { mockCategories } from "../data/mockCategories";
import { mockEvents } from "../data/mockEvents";
import { mockUsers } from "../data/mockUsers";
import { mockTags } from "../data/mockTags";
import type { EventItem } from "../types/event";
import { randomDelay } from "../utils/delay";
import { readStorage, writeStorage } from "./storage";

const EVENTS_KEY = "event-manager-events";
const EVENTS_SEED_VERSION_KEY = "event-manager-events-seed-version";
const EVENTS_SEED_VERSION = "10-events";

function getSeededEvents() {
  const storedEvents = readStorage<EventItem[]>(EVENTS_KEY, mockEvents);
  const seedVersion = localStorage.getItem(EVENTS_SEED_VERSION_KEY);

  if (seedVersion === EVENTS_SEED_VERSION) {
    return storedEvents;
  }

  const storedEventIds = new Set(storedEvents.map((event) => event.id));
  const missingSeedEvents = mockEvents.filter(
    (event) => !storedEventIds.has(event.id)
  );
  const seededEvents = [...storedEvents, ...missingSeedEvents];

  writeStorage(EVENTS_KEY, seededEvents);
  localStorage.setItem(EVENTS_SEED_VERSION_KEY, EVENTS_SEED_VERSION);

  return seededEvents;
}

export const mockApi = {
  async getEvents(): Promise<EventItem[]> {
    await randomDelay();
    return getSeededEvents();
  },

  async createEvent(event: EventItem): Promise<EventItem> {
    await randomDelay();

    const events = getSeededEvents();
    const updatedEvents = [...events, event];

    writeStorage(EVENTS_KEY, updatedEvents);

    return event;
  },

  async updateEvent(event: EventItem): Promise<EventItem> {
    await randomDelay();

    const events = getSeededEvents();
    const updatedEvents = events.map((item) =>
      item.id === event.id ? event : item
    );

    writeStorage(EVENTS_KEY, updatedEvents);

    return event;
  },

  async deleteEvent(eventId: string): Promise<void> {
    await randomDelay();

    const events = getSeededEvents();
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
