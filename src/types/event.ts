export type EventItem = {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
  categoryId: string;
  tagIds: string[];
  organiserId: string;
  attendeeIds: string[];
};
