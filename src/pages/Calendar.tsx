import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  Button,
  MenuItem,
  TextField,
} from "@mui/material";
import { TagPicker } from "../components/TagPicker";
import { mockApi } from "../api/mockApi";
import { EventDialog } from "../components/EventDialog";
import type { Category } from "../types/category";
import type { EventItem } from "../types/event";
import type { Tag } from "../types/tag";
import type { User } from "../types/user";
import { v4 as uuid } from "uuid";

import { EventCalendar } from "@mui/x-scheduler/event-calendar";
import type { SchedulerEvent } from "@mui/x-scheduler/models";

export function CalendarPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreating, setIsCreating] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadPageData() {
      const [eventsData, categoriesData, tagsData, usersData] =
        await Promise.all([
          mockApi.getEvents(),
          mockApi.getCategories(),
          mockApi.getTags(),
          mockApi.getUsers(),
        ]);

      setEvents(eventsData);
      setCategories(categoriesData);
      setTags(tagsData);
      setUsers(usersData);
      setIsLoading(false);
    }

    loadPageData();
  }, []);

  function handleDeleteEvent(eventId: string) {
    mockApi.deleteEvent(eventId);

    setEvents((currentEvents) =>
      currentEvents.filter((event) => event.id !== eventId)
    );

    setSelectedEvent(null);
    setIsCreating(false);
  }

  function getCategory(categoryId: string) {
    return categories.find((category) => category.id === categoryId);
  }

  const handleUpdateEvent = useCallback(async (updatedEvent: EventItem) => {
    await mockApi.updateEvent(updatedEvent);

    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );

    setSelectedEvent(updatedEvent);
    setIsCreating(false);
  }, []);

  const handleCreateEvent = useCallback(async (newEvent: EventItem) => {
    await mockApi.createEvent(newEvent);

    setEvents((currentEvents) => [...currentEvents, newEvent]);

    setSelectedEvent(newEvent);
    setIsCreating(false);
  }, []);

  function createEmptyEvent(): EventItem {
    const now = new Date();

    const end = new Date(now.getTime() + 60 * 60 * 1000);

    return {
      id: uuid(),
      title: "",
      description: "",
      start: now.toISOString(),
      end: end.toISOString(),
      categoryId: categories[0]?.id ?? "",
      tagIds: [],
      organiserId: users[0]?.id ?? "",
      attendeeIds: [],
    };
  }

  const filteredEvents = events.filter((event) => {
    const matchesCategory =
      !selectedCategoryId || event.categoryId === selectedCategoryId;

    const matchesTags =
      selectedTagIds.length === 0 ||
      selectedTagIds.every((tagId) => event.tagIds.includes(tagId));

    return matchesCategory && matchesTags;
  });

  const schedulerEvents: SchedulerEvent[] = filteredEvents.map((event) => ({
    id: event.id,
    title: event.title || "Untitled event",
    start: event.start,
    end: event.end,
  }));

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Calendar View</Typography>

      <Button
        variant="contained"
        onClick={() => {
          setSelectedEvent(createEmptyEvent());
          setIsCreating(true);
        }}
      >
        Add Event
      </Button>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
          },
          gap: 2,
        }}
      >
        <TextField
          select
          label="Filter by category"
          value={selectedCategoryId}
          onChange={(event) => setSelectedCategoryId(event.target.value)}
        >
          <MenuItem value="">All categories</MenuItem>

          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.title}
            </MenuItem>
          ))}
        </TextField>

        <TagPicker
          tags={tags}
          value={selectedTagIds}
          onChange={setSelectedTagIds}
        />
      </Box>

      <Alert severity="info">
        Scheduler will be connected after the data layer and dialogs are ready.
      </Alert>

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            {filteredEvents.map((event) => {
              const category = getCategory(event.categoryId);

              return (
                <Paper
                  key={event.id}
                  variant="outlined"
                  onClick={() => {
                    setSelectedEvent(event);
                    setIsCreating(false);
                  }}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    borderLeft: 6,
                    borderLeftColor: category?.color || "divider",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <Stack spacing={1}>
                    <Typography sx={{ fontWeight: 700 }}>
                      {event.title}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {new Date(event.start).toLocaleString()} —{" "}
                      {new Date(event.end).toLocaleString()}
                    </Typography>

                    {category && (
                      <Chip
                        label={category.title}
                        size="small"
                        sx={{
                          width: "fit-content",
                          bgcolor: category.color,
                          color: "#fff",
                        }}
                      />
                    )}
                  </Stack>
                </Paper>
              );
            })}

            {filteredEvents.length === 0 && (
              <Typography color="text.secondary">
                No events match selected filters.
              </Typography>
            )}
          </Stack>
        </Paper>
      )}

      <Typography variant="h6">Scheduler Preview</Typography>

      <Paper sx={{ height: 650, p: 2 }}>
        <EventCalendar
          events={schedulerEvents}
          defaultVisibleDate={
            schedulerEvents[0]?.start
              ? new Date(schedulerEvents[0].start)
              : new Date()
          }
        />
      </Paper>

      <EventDialog
        open={Boolean(selectedEvent)}
        event={selectedEvent}
        categories={categories}
        tags={tags}
        users={users}
        onClose={() => {
          setSelectedEvent(null);
          setIsCreating(false);
        }}
        onDelete={handleDeleteEvent}
        onUpdate={handleUpdateEvent}
        isNewEvent={isCreating}
        onCreate={handleCreateEvent}
      />
    </Stack>
  );
}
