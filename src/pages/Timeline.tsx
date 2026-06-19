import { useEffect, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Paper,
  Typography,
  Popover,
  TextField,
  MenuItem,
  Button,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import { mockApi } from "../api/mockApi";
import type { Category } from "../types/category";
import type { EventItem } from "../types/event";
import type { Tag } from "../types/tag";
import type { User } from "../types/user";
import { EventDialog } from "../components/EventDialog";
import { TagPicker } from "../components/TagPicker";
import { TimelineEvent } from "../components/common/TimelineEvent";
import { FilterPanel } from "../components/common/FilterPanel";

import { createEmptyEvent } from "../utils/createEmptyEvent";

export function TimelinePage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const DAY_WIDTH = 100;
  const CATEGORY_WIDTH = 180;
  const EVENT_HEIGHT = 40;
  const EVENT_GAP = 10;
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [hoveredEvent, setHoveredEvent] = useState<EventItem | null>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  //  Filter
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(
    null
  );

  // additional derived state
  const [isNewEvent, setIsNewEvent] = useState(false);

  const isFilterOpen = Boolean(filterAnchorEl);

  // drag and drop state
  const [draggingEventId, setDraggingEventId] = useState<string | null>(null);

  // resizing state
  const [resizingEventId, setResizingEventId] = useState<string | null>(null);
  const [resizedDraftEvent, setResizedDraftEvent] = useState<EventItem | null>(
    null
  );

  function getLeftOffset(date: string) {
    const start = new Date("2026-06-01").getTime();
    const current = new Date(date).getTime();

    return Math.max(
      0,
      ((current - start) / (1000 * 60 * 60 * 24)) * DAY_WIDTH
    );
  }

  function getWidth(start: string, end: string) {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const maxWidth = Math.max(80, 30 * DAY_WIDTH - getLeftOffset(start));

    return Math.min(
      maxWidth,
      Math.max(
        80,
        ((endTime - startTime) / (1000 * 60 * 60 * 24)) * DAY_WIDTH
      )
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
    setSelectedEvent(null);
    setIsNewEvent(false);
    setEvents((currentEvents) => [...currentEvents, createdEvent]);
    setSelectedEvent(null);
  }

  // Filter

  const filteredEvents = events.filter((event) => {
    const matchesCategory =
      !selectedCategory || event.categoryId === selectedCategory;

    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.every((tagId) => event.tagIds.includes(tagId));

    return matchesCategory && matchesTags;
  });

  // Add event
  function handleAddEvent() {
    setIsNewEvent(true);
    setSelectedEvent(createEmptyEvent());
  }

  // Drag and drop handlers
  async function handleDropEvent(
    dropEvent: React.DragEvent<HTMLDivElement>,
    categoryId: string
  ) {
    if (!draggingEventId) {
      return;
    }

    const rowRect = dropEvent.currentTarget.getBoundingClientRect();
    const dropX = dropEvent.clientX - rowRect.left;

    const dayOffset = Math.min(29, Math.max(0, Math.floor(dropX / DAY_WIDTH)));

    const timelineStart = new Date("2026-06-01");
    const newStart = new Date(timelineStart);
    newStart.setDate(timelineStart.getDate() + dayOffset);

    const draggedEvent = events.find((event) => event.id === draggingEventId);

    if (!draggedEvent) {
      return;
    }

    const oldStart = new Date(draggedEvent.start).getTime();
    const oldEnd = new Date(draggedEvent.end).getTime();
    const duration = oldEnd - oldStart;

    const newEnd = new Date(newStart.getTime() + duration);

    const updatedEvent: EventItem = {
      ...draggedEvent,
      categoryId,
      start: newStart.toISOString(),
      end: newEnd.toISOString(),
    };

    await handleUpdateEvent(updatedEvent);
    setDraggingEventId(null);
  }

  // Resize handlers
  async function handleResizeEvent(
    mouseEvent: React.MouseEvent<HTMLDivElement>
  ) {
    if (!resizingEventId) return;

    const rowRect = mouseEvent.currentTarget.getBoundingClientRect();
    const mouseX = mouseEvent.clientX - rowRect.left;
    const dayOffset = Math.ceil(mouseX / DAY_WIDTH);

    const timelineStart = new Date("2026-06-01");
    const newEnd = new Date(timelineStart);
    newEnd.setDate(timelineStart.getDate() + dayOffset);

    const resizedEvent = events.find((event) => event.id === resizingEventId);

    if (!resizedEvent) return;

    if (newEnd <= new Date(resizedEvent.start)) {
      return;
    }

    const updatedEvent: EventItem = {
      ...resizedEvent,
      end: newEnd.toISOString(),
    };
    setResizedDraftEvent(updatedEvent);

    setEvents((currentEvents) =>
      currentEvents.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      )
    );
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
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Timeline View
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Drag events between categories or resize the handle to adjust duration.
        </Typography>
      </Box>

      <Paper sx={{ p: 2, overflowX: "auto" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            mb: 3,
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

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddEvent}
          >
            Add Event
          </Button>
        </Stack>

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

        {/* No events found message */}

        {filteredEvents.length === 0 && (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography color="text.secondary">No events found</Typography>
          </Box>
        )}

        {/* ROWS */}
        {filteredEvents.length > 0 &&
          categories.map((category) => {
            const categoryEvents = filteredEvents.filter(
              (event) => event.categoryId === category.id
            );
            const rowHeight =
              Math.max(1, categoryEvents.length) * (EVENT_HEIGHT + EVENT_GAP) +
              EVENT_GAP;

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
                  onMouseMove={(mouseEvent) => {
                    if (!resizingEventId) return;

                    handleResizeEvent(mouseEvent);
                  }}
                  onMouseUp={async () => {
                    if (resizedDraftEvent) {
                      await handleUpdateEvent(resizedDraftEvent);
                    }

                    setResizingEventId(null);
                    setResizedDraftEvent(null);
                  }}
                  onMouseLeave={() => {
                    if (resizingEventId) {
                      return;
                    }
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                  }}
                  onDrop={(dropEvent) => {
                    handleDropEvent(dropEvent, category.id);
                  }}
                  sx={{
                    position: "relative",
                    width: 30 * DAY_WIDTH,
                    height: rowHeight,
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
                  {categoryEvents.map((event, index) => (
                    <TimelineEvent
                      draggable
                      onDragStart={() => {
                        setDraggingEventId(event.id);
                      }}
                      onDragEnd={() => {
                        setDraggingEventId(null);
                      }}
                      onClick={() => {
                        setIsNewEvent(false);
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
                        left: getLeftOffset(event.start),
                        top: EVENT_GAP + index * (EVENT_HEIGHT + EVENT_GAP),
                        width: getWidth(event.start, event.end),
                        bgcolor: category.color,
                        color: "#fff",
                        boxShadow: "0 10px 22px rgba(15, 23, 42, 0.18)",
                      }}
                    >
                      <Typography variant="body2" noWrap>
                        {event.title}
                      </Typography>
                      <Box
                        onMouseDown={(mouseEvent) => {
                          mouseEvent.stopPropagation();
                          setResizingEventId(event.id);
                        }}
                        sx={{
                          position: "absolute",
                          right: 0,
                          top: 0,
                          width: 8,
                          height: "100%",
                          cursor: "ew-resize",
                          bgcolor: "rgba(255,255,255,0.4)",
                        }}
                      />
                    </TimelineEvent>
                  ))}
                </Box>
              </Box>
            );
          })}
      </Paper>

      {/* Hover info popper */}
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
    </Box>
  );
}
