import type { EventItem } from "../types/event";

export const mockEvents: EventItem[] = [
  {
    id: "event-1",
    title: "Team Planning",
    start: "2026-06-09T09:00:00.000Z",
    end: "2026-06-09T10:30:00.000Z",
    description: "<p>Discuss sprint goals and priorities.</p>",
    categoryId: "meeting",
    tagIds: ["internal", "planning"],
    organiserId: "user-1",
    attendeeIds: ["user-2", "user-3", "user-4"],
  },
  {
    id: "event-2",
    title: "Design Review",
    start: "2026-06-10T13:00:00.000Z",
    end: "2026-06-10T14:00:00.000Z",
    description: "<p>Review new dashboard mockups.</p>",
    categoryId: "design",
    tagIds: ["client"],
    organiserId: "user-5",
    attendeeIds: ["user-6", "user-7"],
  },
];
