import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CloseIcon from "@mui/icons-material/Close";
import { UserPicker } from "./UserPicker";
import { MultiUserPicker } from "./MultiUserPicker";
import { TagPicker } from "./TagPicker";
import { RichTextEditor } from "./RichTextEditor";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
  TextField,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { Category } from "../types/category";
import type { EventItem } from "../types/event";
import type { Tag } from "../types/tag";
import type { User } from "../types/user";
import { useEffect, useState } from "react";
import { getPlainTextFromRichText, sanitizeRichText } from "../utils/richText";

type EventDialogProps = {
  event: EventItem | null;
  open: boolean;
  categories: Category[];
  tags: Tag[];
  users: User[];
  onClose: () => void;
  onDelete: (eventId: string) => void;
  onUpdate: (event: EventItem) => Promise<void>;
  isNewEvent: boolean;
  onCreate: (event: EventItem) => Promise<void>;
};

// EventDialog is used for both viewing and editing an event. Existing events
// open read-only first, while new events open directly in edit mode.
export function EventDialog({
  event,
  open,
  categories,
  tags,
  users,
  onClose,
  onDelete,
  onUpdate,
  isNewEvent,
  onCreate,
}: EventDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isEditing, setIsEditing] = useState(isNewEvent);
  const [draftEvent, setDraftEvent] = useState<EventItem | null>(event);
  const [isSaving, setIsSaving] = useState(false);

  // datetime-local inputs need local time strings, but the app stores dates as
  // ISO strings so they can be persisted consistently in localStorage.
  function toDateTimeLocalValue(date: string) {
    const value = new Date(date);
    const offset = value.getTimezoneOffset() * 60_000;

    return new Date(value.getTime() - offset).toISOString().slice(0, 16);
  }

  function fromDateTimeLocalValue(value: string) {
    return new Date(value).toISOString();
  }

  const hasValidDateRange =
    draftEvent &&
    new Date(draftEvent.end).getTime() > new Date(draftEvent.start).getTime();

  const canSave =
    Boolean(draftEvent?.title.trim()) &&
    Boolean(draftEvent?.categoryId) &&
    Boolean(draftEvent?.organiserId) &&
    Boolean(hasValidDateRange);

  async function saveExistingEvent() {
    if (!draftEvent || !canSave) {
      return;
    }

    setIsSaving(true);
    await onUpdate(draftEvent);
    setIsSaving(false);
    setIsEditing(false);
  }

  function handleCancel() {
    if (isNewEvent) {
      onClose();
      return;
    }

    setDraftEvent(event);
    setIsEditing(false);
  }

  // Existing events save automatically after the user pauses typing. New events
  // wait for the explicit Create button so incomplete drafts are not persisted.
  useEffect(() => {
    if (isNewEvent || !isEditing || !draftEvent || !event) {
      return;
    }

    const isChanged = JSON.stringify(draftEvent) !== JSON.stringify(event);

    if (!isChanged) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      if (!canSave) {
        return;
      }

      setIsSaving(true);

      await onUpdate(draftEvent);

      setIsSaving(false);
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [canSave, draftEvent, event, isEditing, isNewEvent, onUpdate]);

  if (!event || !draftEvent) {
    return null;
  }

  const category = categories.find((item) => item.id === event.categoryId);
  const eventTags = tags.filter((tag) => event.tagIds.includes(tag.id));
  // Events store only user IDs; the dialog resolves them to full user objects
  // for avatars and readable names.
  const organiser = users.find((user) => user.id === event.organiserId);
  const attendees = users.filter((user) => event.attendeeIds.includes(user.id));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      disableRestoreFocus
      fullWidth
      fullScreen={isMobile}
      maxWidth="sm"
    >
      <DialogTitle>
        {isEditing ? (
          <TextField
            fullWidth
            label="Title"
            placeholder="Event title"
            value={draftEvent.title}
            onChange={(e) =>
              setDraftEvent({
                ...draftEvent,
                title: e.target.value,
              })
            }
          />
        ) : (
          draftEvent.title
        )}
      </DialogTitle>

      <DialogContent dividers={isMobile}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Date and time
            </Typography>

            {isEditing ? (
              <Box
                sx={{
                  mt: 1,
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                }}
              >
                <TextField
                  label="Start"
                  type="datetime-local"
                  fullWidth
                  value={toDateTimeLocalValue(draftEvent.start)}
                  onChange={(event) =>
                    setDraftEvent({
                      ...draftEvent,
                      start: fromDateTimeLocalValue(event.target.value),
                    })
                  }
                />

                <TextField
                  label="End"
                  type="datetime-local"
                  fullWidth
                  error={!hasValidDateRange}
                  helperText={
                    !hasValidDateRange ? "End must be after start" : ""
                  }
                  value={toDateTimeLocalValue(draftEvent.end)}
                  onChange={(event) =>
                    setDraftEvent({
                      ...draftEvent,
                      end: fromDateTimeLocalValue(event.target.value),
                    })
                  }
                />
              </Box>
            ) : (
              <Typography>
                {new Date(draftEvent.start).toLocaleString()} —{" "}
                {new Date(draftEvent.end).toLocaleString()}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Category
            </Typography>

            {isEditing ? (
              <TextField
                select
                fullWidth
                label="Category"
                value={draftEvent.categoryId}
                onChange={(event) =>
                  setDraftEvent({
                    ...draftEvent,
                    categoryId: event.target.value,
                  })
                }
                sx={{ mt: 1 }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.title}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              category && (
                <Chip
                  label={category.title}
                  sx={{
                    mt: 1,
                    bgcolor: category.color,
                    color: "#fff",
                  }}
                />
              )
            )}
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Tags
            </Typography>

            {isEditing ? (
              <TagPicker
                tags={tags}
                value={draftEvent.tagIds}
                onChange={(tagIds) =>
                  setDraftEvent({
                    ...draftEvent,
                    tagIds,
                  })
                }
              />
            ) : (
              <Box
                sx={{
                  mt: 1,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {eventTags.map((tag) => (
                  <Chip key={tag.id} label={tag.title} size="small" />
                ))}
              </Box>
            )}
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Description
            </Typography>

            {isEditing ? (
              <RichTextEditor
                value={draftEvent.description}
                onChange={(description) =>
                  setDraftEvent({
                    ...draftEvent,
                    description,
                  })
                }
              />
            ) : (
              <Box
                sx={{
                  mt: 1,
                  "& p": { my: 0.5 },
                  "& ul": { my: 0.5, pl: 3 },
                  "& a": { color: "primary.main" },
                }}
              >
                {getPlainTextFromRichText(draftEvent.description) ? (
                  <Box
                    dangerouslySetInnerHTML={{
                      __html: sanitizeRichText(draftEvent.description),
                    }}
                  />
                ) : (
                  <Typography color="text.secondary">No description</Typography>
                )}
              </Box>
            )}
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Organiser
            </Typography>

            {isEditing ? (
              <UserPicker
                users={users}
                value={draftEvent.organiserId}
                label="Organiser"
                onChange={(userId) =>
                  setDraftEvent({
                    ...draftEvent,
                    organiserId: userId,
                  })
                }
              />
            ) : (
              organiser && (
                <Box
                  sx={{
                    mt: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Avatar src={organiser.avatar}>
                    {organiser.fullName.charAt(0)}
                  </Avatar>

                  <Typography>{organiser.fullName}</Typography>
                </Box>
              )
            )}
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Attendees
            </Typography>

            {isEditing ? (
              <MultiUserPicker
                users={users}
                value={draftEvent.attendeeIds}
                onChange={(userIds) =>
                  setDraftEvent({
                    ...draftEvent,
                    attendeeIds: userIds,
                  })
                }
              />
            ) : (
              <Box
                sx={{
                  mt: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {attendees.map((user) => (
                  <Box
                    key={user.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Avatar src={user.avatar} sx={{ width: 28, height: 28 }}>
                      {user.fullName.charAt(0)}
                    </Avatar>

                    <Typography variant="body2">{user.fullName}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          flexDirection: { xs: "column-reverse", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          gap: { xs: 1, sm: 0 },
        }}
      >
        {isEditing && !isNewEvent && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mr: { sm: "auto" }, textAlign: { xs: "center", sm: "left" } }}
          >
            {isSaving ? "Saving..." : "Changes save automatically"}
          </Typography>
        )}

        {!isNewEvent && (
          <Button
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(draftEvent.id)}
          >
            Delete
          </Button>
        )}

        {isEditing && (
          <Button startIcon={<CloseIcon />} onClick={handleCancel}>
            Cancel
          </Button>
        )}

        {isNewEvent ? (
          <Button
            variant="contained"
            startIcon={<EventAvailableIcon />}
            onClick={async () => {
              await onCreate(draftEvent);
              onClose();
            }}
            disabled={!canSave}
          >
            Create
          </Button>
        ) : (
          <Button
            startIcon={<EditIcon />}
            variant="contained"
            onClick={() => {
              if (isEditing) {
                saveExistingEvent();
                return;
              }

              setIsEditing(true);
            }}
            disabled={isEditing && (!canSave || isSaving)}
          >
            {isEditing ? "Done" : "Edit"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
