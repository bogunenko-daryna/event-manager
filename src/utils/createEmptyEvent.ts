import type { EventItem } from "../types/event";

export function createEmptyEvent(): EventItem {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    start: new Date().toISOString(),
    end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    categoryId: "",
    tagIds: [],
    organiserId: "",
    attendeeIds: [],
  };
}
