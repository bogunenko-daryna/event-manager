# Event Manager

A frontend-only React + TypeScript event manager built with MUI, MUI X Scheduler, MUI Charts, mock API calls, and localStorage persistence.

## What Is Implemented

- Calendar view using `@mui/x-scheduler` `EventCalendar`
- Timeline view grouped by category, similar to a Gantt chart
- Dashboard with MUI Charts pie/bar charts and upcoming events
- Event dialog that opens in read-only mode and switches to edit mode
- Debounced auto-save while editing existing events
- Explicit create flow for new events
- Add and delete event actions
- Category and tag filters in calendar and timeline
- Timeline drag-and-drop between categories
- Timeline resize by dragging the event handle
- Calendar drag/resize persistence through controlled scheduler events
- Rich-text event description stored as sanitized HTML
- Dedicated MUI Autocomplete user pickers for organiser and attendees
- Mock API layer with random network delay and localStorage persistence
- 10 predefined categories, 10 seeded events, 300 users, and matching avatar URLs
- Empty states for filtered/no-event views

## Main Data Model

Each event is stored as an `EventItem`:

```ts
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
```

The event stores only IDs for category, tags, organiser, and attendees. The UI resolves those IDs to full objects when rendering.

## Project Structure

- `src/pages/Calendar.tsx`: calendar list, filters, scheduler calendar, scheduler drag/resize sync
- `src/pages/Timeline.tsx`: category-grouped Gantt-style timeline with drag/drop and resize
- `src/pages/Dashboard.tsx`: charts and upcoming events
- `src/components/EventDialog.tsx`: read-only/edit dialog, create/delete, debounced updates
- `src/components/RichTextEditor.tsx`: small MUI-based rich-text editor
- `src/components/UserPicker.tsx`: organiser picker
- `src/components/MultiUserPicker.tsx`: attendees picker
- `src/components/TagPicker.tsx`: tag selector
- `src/api/mockApi.ts`: fake async API with localStorage
- `src/data/*`: predefined categories, events, tags, and users
- `src/components/common/theme.tsx`: shared MUI theme and global baseline overrides

## Important Implementation Notes

The mock API simulates a backend by delaying every call and writing event data to localStorage. The first run loads predefined events; existing browsers are upgraded to the latest seed version so the 10 demo events appear even if older localStorage data exists.

The timeline is custom-built with MUI `Box`, `Paper`, `Chip`, and `Popover` so category grouping, event positioning, drag/drop, and resize behavior are easy to control and explain.

The calendar uses MUI X Scheduler for the main calendar surface. Events are passed in a scheduler-specific shape, then mapped back to the app’s `EventItem` shape when the scheduler reports changes.

The rich-text editor stores sanitized HTML. It allows simple formatting while avoiding unsafe tags/attributes before displaying stored HTML.

## Commands

```bash
npm run dev
npm run lint
npm run build
```

## Known Tradeoffs

MUI X Scheduler is still beta and has its own built-in dialog behavior. This app keeps a custom detailed event dialog for the event list and timeline, while the scheduler is used for calendar visualization and drag/resize persistence.

The production bundle is large because MUI Scheduler and MUI Charts are both included in the main app bundle. A future improvement would be lazy-loading the three pages.
