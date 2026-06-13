import { useEffect, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Paper,
  Typography,
  Popper,
} from "@mui/material";
import { mockApi } from "../api/mockApi";
import type { Category } from "../types/category";
import type { EventItem } from "../types/event";
import type { Tag } from "../types/tag";
import type { User } from "../types/user";
import { EventDialog } from "../components/EventDialog";

export function TimelinePage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const DAY_WIDTH = 100;
  const CATEGORY_WIDTH = 180;
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [hoveredEvent, setHoveredEvent] = useState<EventItem | null>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  function getLeftOffset(date: string) {
    const start = new Date("2026-06-01").getTime();
    const current = new Date(date).getTime();

    return ((current - start) / (1000 * 60 * 60 * 24)) * DAY_WIDTH;
  }

  function getWidth(start: string, end: string) {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    return Math.max(
      80,
      ((endTime - startTime) / (1000 * 60 * 60 * 24)) * DAY_WIDTH
    );
  }

  useEffect(() => {
    async function loadData() {
      const [eventsData, categoriesData, usersData, tagsData] =
        await Promise.all([
          mockApi.getEvents(),
          mockApi.getCategories(),
          mockApi.getUsers(),
          mockApi.getTags(),
        ]);

      setEvents(eventsData);
      setCategories(categoriesData);
      setIsLoading(false);
      setEvents(eventsData);
      setCategories(categoriesData);
      setUsers(usersData);
      setTags(tagsData);

      setIsLoading(false);
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  async function handleUpdateEvent(updatedEvent: EventItem) {
    await mockApi.updateEvent(updatedEvent);

    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  }

  async function handleDeleteEvent(eventId: string) {
    await mockApi.deleteEvent(eventId);

    setEvents((currentEvents) =>
      currentEvents.filter((event) => event.id !== eventId)
    );

    setSelectedEvent(null);
  }

  async function handleCreateEvent(newEvent: EventItem) {
    const createdEvent = await mockApi.createEvent(newEvent);

    setEvents((currentEvents) => [...currentEvents, createdEvent]);
    setSelectedEvent(null);
  }

  return (
    <Box
      sx={{
        display: "flex",
        overflowX: "auto",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h5">Timeline View</Typography>

      {/* <Box
        sx={{
          display: "flex",
          borderBottom: 1,
          borderColor: "divider",
          pb: 1,
          mb: 2,
        }}
      >
        <Box sx={{ width: CATEGORY_WIDTH }}>
          <Typography sx={{ fontWeight: 700 }}>Category</Typography>
        </Box>

        <Box sx={{ display: "flex" }}>
          {Array.from({ length: 30 }).map((_, index) => (
            <Box
              key={index}
              sx={{
                width: DAY_WIDTH,
                textAlign: "center",
              }}
            >
              Jun {index + 1}
            </Box>
          ))}
        </Box>
      </Box> */}

      <Paper sx={{ p: 2, overflowX: "auto" }}>
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            borderBottom: 1,
            borderColor: "divider",
            pb: 1,
            mb: 3,
            minWidth: CATEGORY_WIDTH + 30 * DAY_WIDTH,
          }}
        >
          <Box
            sx={{
              width: CATEGORY_WIDTH,
              flexShrink: 0,
            }}
          >
            <Typography sx={{ fontWeight: 700 }}>Category</Typography>
          </Box>

          <Box sx={{ display: "flex" }}>
            {Array.from({ length: 30 }).map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: DAY_WIDTH,
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                Jun {index + 1}
              </Box>
            ))}
          </Box>
        </Box>

        {/* ROWS */}
        {categories.map((category) => {
          const categoryEvents = events.filter(
            (event) => event.categoryId === category.id
          );

          if (categoryEvents.length === 0) {
            return null;
          }

          return (
            <Box
              key={category.id}
              sx={{
                display: "flex",
                mb: 3,
                minWidth: CATEGORY_WIDTH + 30 * DAY_WIDTH,
              }}
            >
              {/* LEFT CATEGORY */}
              <Box
                sx={{
                  width: CATEGORY_WIDTH,
                  flexShrink: 0,
                  pr: 2,
                }}
              >
                <Chip
                  label={category.title}
                  sx={{
                    bgcolor: category.color,
                    color: "#fff",
                    fontWeight: 700,
                  }}
                />
              </Box>

              {/* TIMELINE ROW */}

              <Box
                sx={{
                  position: "relative",
                  width: 30 * DAY_WIDTH,
                  height: 60,
                  borderBottom: 1,
                  borderColor: "divider",
                  flexShrink: 0,

                  backgroundImage: `
repeating-linear-gradient(
to right,
transparent,
transparent ${DAY_WIDTH - 1}px,
rgba(0,0,0,0.1) ${DAY_WIDTH - 1}px,
rgba(0,0,0,0.1) ${DAY_WIDTH}px
)
`,
                }}
              >
                {categoryEvents.map((event) => (
                  <Box
                    onClick={() => {
                      console.log("timeline click", event);
                      setSelectedEvent(event);
                    }}
                    onMouseEnter={(e) => {
                      setHoveredEvent(event);
                      setMousePosition({
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    onMouseMove={(e) => {
                      setMousePosition({
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    onMouseLeave={() => {
                      setHoveredEvent(null);
                      setMousePosition(null);
                    }}
                    key={event.id}
                    sx={{
                      position: "absolute",
                      left: getLeftOffset(event.start),
                      top: 0,
                      width: getWidth(event.start, event.end),
                      height: 40,
                      bgcolor: category.color,
                      color: "#fff",
                      borderRadius: 1,
                      px: 1,
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      transition: "0.2s",

                      "&:hover": {
                        opacity: 0.9,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Typography variant="body2" noWrap>
                      {event.title}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })}
      </Paper>

      <Popper
        open={Boolean(hoveredEvent && mousePosition)}
        anchorEl={
          mousePosition
            ? {
                getBoundingClientRect: () =>
                  new DOMRect(mousePosition.x + 12, mousePosition.y + 12, 0, 0),
              }
            : null
        }
        placement="bottom-start"
        sx={{ zIndex: 1500, pointerEvents: "none" }}
      >
        {hoveredEvent && (
          <Paper
            sx={{
              p: 1.5,
              bgcolor: "grey.800",
              color: "#fff",
              maxWidth: 240,
            }}
          >
            <Typography sx={{ fontWeight: 700 }}>
              {hoveredEvent.title}
            </Typography>

            <Typography variant="body2">
              {new Date(hoveredEvent.start).toLocaleDateString()}
            </Typography>
          </Paper>
        )}{" "}
      </Popper>

      <EventDialog
        open={Boolean(selectedEvent)}
        event={selectedEvent}
        categories={categories}
        tags={tags}
        users={users}
        onClose={() => setSelectedEvent(null)}
        onDelete={handleDeleteEvent}
        onUpdate={handleUpdateEvent}
        isNewEvent={false}
        onCreate={handleCreateEvent}
      />
    </Box>
  );
}
