import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Popover,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { EventCalendar } from "@mui/x-scheduler/event-calendar";
import type {
  SchedulerEventColor,
  SchedulerEventModelStructure,
  SchedulerResource,
} from "@mui/x-scheduler/models";

import { EventDialog } from "../components/EventDialog";
import { TagPicker } from "../components/TagPicker";
import { FilterPanel } from "../components/common/FilterPanel";
import { mockApi } from "../api/mockApi";
import { createEmptyEvent } from "../utils/createEmptyEvent";

import type { Category } from "../types/category";
import type { EventItem } from "../types/event";
import type { Tag } from "../types/tag";
import type { User } from "../types/user";

type CalendarSchedulerEvent = EventItem & {
  color: SchedulerEventColor;
  resource: string;
};

const schedulerColors: SchedulerEventColor[] = [
  "blue",
  "purple",
  "orange",
  "green",
  "red",
  "teal",
  "indigo",
  "amber",
  "grey",
  "pink",
];

const schedulerEventModelStructure: SchedulerEventModelStructure<CalendarSchedulerEvent> =
  {
    id: {
      getter: (event) => event.id,
    },
    title: {
      getter: (event) => event.title,
      setter: (event, value) => ({ ...event, title: String(value) }),
    },
    description: {
      getter: (event) => event.description,
      setter: (event, value) => ({
        ...event,
        description: String(value ?? ""),
      }),
    },
    start: {
      getter: (event) => event.start,
      setter: (event, value) => ({
        ...event,
        start: new Date(value).toISOString(),
      }),
    },
    end: {
      getter: (event) => event.end,
      setter: (event, value) => ({
        ...event,
        end: new Date(value).toISOString(),
      }),
    },
    resource: {
      getter: (event) => event.resource,
      setter: (event, value) => ({
        ...event,
        categoryId: String(value ?? event.categoryId),
        resource: String(value ?? event.resource),
      }),
    },
    color: {
      getter: (event) => event.color,
    },
  };

export function CalendarPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isNewEvent, setIsNewEvent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredEvent, setHoveredEvent] = useState<EventItem | null>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(
    null
  );

  const isFilterOpen = Boolean(filterAnchorEl);

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

  const handleUpdateEvent = useCallback(async (updatedEvent: EventItem) => {
    await mockApi.updateEvent(updatedEvent);

    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
  }, []);

  async function handleDeleteEvent(eventId: string) {
    await mockApi.deleteEvent(eventId);

    setEvents((currentEvents) =>
      currentEvents.filter((event) => event.id !== eventId)
    );

    setSelectedEvent(null);
    setIsNewEvent(false);
  }

  async function handleCreateEvent(newEvent: EventItem) {
    const createdEvent = await mockApi.createEvent(newEvent);

    setEvents((currentEvents) => [...currentEvents, createdEvent]);
    setSelectedEvent(null);
    setIsNewEvent(false);
  }

  function handleAddEvent() {
    setIsNewEvent(true);
    setSelectedEvent(createEmptyEvent());
  }

  function getCategory(categoryId: string) {
    return categories.find((category) => category.id === categoryId);
  }

  const filteredEvents = events.filter((event) => {
    const matchesCategory =
      !selectedCategory || event.categoryId === selectedCategory;

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tagId) => event.tagIds.includes(tagId));

    return matchesCategory && matchesTags;
  });

  const schedulerResources: SchedulerResource[] = categories.map(
    (category, index) => ({
      id: category.id,
      title: category.title,
      eventColor: schedulerColors[index % schedulerColors.length],
    })
  );

  const schedulerEvents: CalendarSchedulerEvent[] = filteredEvents.map(
    (event) => {
      const categoryIndex = categories.findIndex(
        (category) => category.id === event.categoryId
      );

      return {
        ...event,
        title: event.title || "Untitled event",
        color:
          schedulerColors[
            Math.max(0, categoryIndex) % schedulerColors.length
          ],
        resource: event.categoryId,
      };
    }
  );

  function handleSchedulerEventsChange(updatedEvents: CalendarSchedulerEvent[]) {
    updatedEvents.forEach((updatedEvent) => {
      const currentEvent = events.find((event) => event.id === updatedEvent.id);

      if (!currentEvent) {
        return;
      }

      const normalizedEvent: EventItem = {
        ...currentEvent,
        title: updatedEvent.title,
        description: updatedEvent.description,
        start: new Date(updatedEvent.start).toISOString(),
        end: new Date(updatedEvent.end).toISOString(),
        categoryId: updatedEvent.resource || updatedEvent.categoryId,
      };

      if (JSON.stringify(currentEvent) !== JSON.stringify(normalizedEvent)) {
        handleUpdateEvent(normalizedEvent);
      }
    });
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Calendar View
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Browse events, filter by category or tags, and open any event to edit.
        </Typography>
      </Box>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ flexWrap: "wrap" }}
        >
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={(event) =>
              setFilterAnchorEl(filterAnchorEl ? null : event.currentTarget)
            }
          >
            Filters
          </Button>

          {selectedCategory ? (
            <Chip
              label={
                categories.find((category) => category.id === selectedCategory)
                  ?.title
              }
              onDelete={() => setSelectedCategory("")}
            />
          ) : null}

          {selectedTags.map((tagId) => (
            <Chip
              key={tagId}
              label={tags.find((tag) => tag.id === tagId)?.title ?? tagId}
              onDelete={() =>
                setSelectedTags((currentTags) =>
                  currentTags.filter((currentTagId) => currentTagId !== tagId)
                )
              }
            />
          ))}
        </Stack>

        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddEvent}>
          Add Event
        </Button>
      </Stack>

      <Popover
        open={isFilterOpen}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        sx={{ zIndex: 1200 }}
      >
        <FilterPanel>
          <TextField
            select
            fullWidth
            label="Category"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <MenuItem value="">All categories</MenuItem>

            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.title}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ mt: 2 }}>
            <TagPicker
              tags={tags}
              value={selectedTags}
              onChange={setSelectedTags}
            />
          </Box>
        </FilterPanel>
      </Popover>

      <Paper
        sx={{
          p: 2,
          maxHeight: { xs: 420, md: 520 },
          overflowY: "auto",
          scrollbarGutter: "stable",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{
            mb: 2,
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">Event list</Typography>
          <Chip
            label={`${filteredEvents.length} of ${events.length} events`}
            size="small"
          />
        </Stack>

        {filteredEvents.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography color="text.secondary">No events found</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider flexItem />} spacing={0}>
            {filteredEvents.map((event) => {
              const category = getCategory(event.categoryId);
              const attendeeCount = event.attendeeIds.length;

              return (
                <Box
                  key={event.id}
                  onClick={() => {
                    setIsNewEvent(false);
                    setSelectedEvent(event);
                  }}
                  onMouseEnter={(mouseEvent) => {
                    setHoveredEvent(event);
                    setMousePosition({
                      x: mouseEvent.clientX,
                      y: mouseEvent.clientY,
                    });
                  }}
                  onMouseMove={(mouseEvent) => {
                    setMousePosition({
                      x: mouseEvent.clientX,
                      y: mouseEvent.clientY,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredEvent(null);
                    setMousePosition(null);
                  }}
                  sx={{
                    py: 1.5,
                    px: 1,
                    cursor: "pointer",
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "minmax(0, 1fr) auto",
                    },
                    gap: 1,
                    borderRadius: 1,
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <Stack spacing={1}>
                    <Typography sx={{ fontWeight: 800 }}>
                      {event.title || "Untitled event"}
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
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{
                      alignItems: "center",
                      color: "text.secondary",
                      justifyContent: { xs: "flex-start", sm: "flex-end" },
                    }}
                  >
                    <PeopleAltIcon fontSize="small" />
                    <Typography variant="body2">
                      {attendeeCount} attendee{attendeeCount === 1 ? "" : "s"}
                    </Typography>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>

      <Typography variant="h6">Scheduler Calendar</Typography>

      <Paper sx={{ height: 650, p: 2 }}>
        <EventCalendar
          events={schedulerEvents}
          resources={schedulerResources}
          eventModelStructure={schedulerEventModelStructure}
          areEventsDraggable
          areEventsResizable="end"
          eventCreation={false}
          onEventsChange={handleSchedulerEventsChange}
          defaultVisibleDate={
            schedulerEvents[0]?.start
              ? new Date(schedulerEvents[0].start)
              : new Date()
          }
        />
      </Paper>

      <Popover
        open={Boolean(hoveredEvent && mousePosition)}
        anchorReference="anchorPosition"
        onClose={() => setHoveredEvent(null)}
        anchorPosition={
          mousePosition
            ? { top: mousePosition.y + 10, left: mousePosition.x + 10 }
            : undefined
        }
        sx={{ zIndex: 1500, pointerEvents: "none" }}
      >
        {hoveredEvent && (
          <Paper
            sx={{
              p: 1.5,
              bgcolor: "grey.900",
              color: "#fff",
              maxWidth: 260,
            }}
          >
            <Typography sx={{ fontWeight: 800 }}>
              {hoveredEvent.title || "Untitled event"}
            </Typography>
            <Typography variant="body2">
              {new Date(hoveredEvent.start).toLocaleString()}
            </Typography>
          </Paper>
        )}
      </Popover>

      <EventDialog
        key={`${isNewEvent ? "new" : "existing"}-${selectedEvent?.id ?? "empty"}`}
        open={Boolean(selectedEvent)}
        event={selectedEvent}
        categories={categories}
        tags={tags}
        users={users}
        onClose={() => {
          setSelectedEvent(null);
          setIsNewEvent(false);
        }}
        onDelete={handleDeleteEvent}
        onUpdate={handleUpdateEvent}
        isNewEvent={isNewEvent}
        onCreate={handleCreateEvent}
      />
    </Stack>
  );
}
