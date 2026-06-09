import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { mockApi } from "../api/mockApi";
import { EventDialog } from "../components/EventDialog";
import type { Category } from "../types/category";
import type { EventItem } from "../types/event";
import type { Tag } from "../types/tag";
import type { User } from "../types/user";

export function CalendarPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
  }

  function getCategory(categoryId: string) {
    return categories.find((category) => category.id === categoryId);
  }

  async function handleUpdateEvent(updatedEvent: EventItem) {
    await mockApi.updateEvent(updatedEvent);

    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );

    setSelectedEvent(updatedEvent);
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Calendar View</Typography>

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
            {events.map((event) => {
              const category = getCategory(event.categoryId);

              return (
                <Paper
                  key={event.id}
                  variant="outlined"
                  onClick={() => setSelectedEvent(event)}
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

            {events.length === 0 && (
              <Typography color="text.secondary">
                No events available.
              </Typography>
            )}
          </Stack>
        </Paper>
      )}

      <EventDialog
        open={Boolean(selectedEvent)}
        event={selectedEvent}
        categories={categories}
        tags={tags}
        users={users}
        onClose={() => setSelectedEvent(null)}
        onDelete={handleDeleteEvent}
        onUpdate={handleUpdateEvent}
      />
    </Stack>
  );
}
