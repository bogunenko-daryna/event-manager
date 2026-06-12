import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { UserPicker } from "./UserPicker";
import { MultiUserPicker } from "./MultiUserPicker";
import { TagPicker } from "./TagPicker";
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
} from "@mui/material";
import type { Category } from "../types/category";
import type { EventItem } from "../types/event";
import type { Tag } from "../types/tag";
import type { User } from "../types/user";
import { useEffect, useState } from "react";

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
  if (!event) {
    return null;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [draftEvent, setDraftEvent] = useState<EventItem | null>(event);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraftEvent(event);
    setIsEditing(Boolean(isNewEvent));
  }, [event, isNewEvent]);

  if (!event || !draftEvent) {
    return null;
  }

  const category = categories.find((item) => item.id === event.categoryId);
  const eventTags = tags.filter((tag) => event.tagIds.includes(tag.id));
  const organiser = users.find((user) => user.id === event.organiserId);
  const attendees = users.filter((user) => event.attendeeIds.includes(user.id));

  function toDateTimeLocalValue(date: string) {
    return date.slice(0, 16);
  }

  function fromDateTimeLocalValue(value: string) {
    return new Date(value).toISOString();
  }
  useEffect(() => {
    if (isNewEvent || !isEditing || !draftEvent || !event) {
      return;
    }

    const isChanged = JSON.stringify(draftEvent) !== JSON.stringify(event);

    if (!isChanged) {
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setIsSaving(true);

      await onUpdate(draftEvent);

      setIsSaving(false);
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [draftEvent, event, isEditing, onUpdate]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEditing ? (
          <TextField
            fullWidth
            label="Title"
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

      <DialogContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Date and time
            </Typography>

            {isEditing ? (
              <Box
                sx={{
                  mt: 1,
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                  },
                  gap: 2,
                }}
              >
                <TextField
                  label="Start"
                  type="datetime-local"
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
              <TextField
                fullWidth
                multiline
                rows={4}
                value={draftEvent.description}
                onChange={(e) =>
                  setDraftEvent({
                    ...draftEvent,
                    description: e.target.value,
                  })
                }
              />
            ) : (
              <Typography
                sx={{ mt: 1 }}
                dangerouslySetInnerHTML={{
                  __html: draftEvent.description,
                }}
              />
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

      <DialogActions>
        {isEditing && !isNewEvent && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mr: "auto" }}
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

        {isNewEvent ? (
          <Button
            variant="contained"
            onClick={() => onCreate(draftEvent)}
            disabled={
              !draftEvent.title ||
              !draftEvent.categoryId ||
              !draftEvent.organiserId
            }
          >
            Create
          </Button>
        ) : (
          <Button
            startIcon={<EditIcon />}
            variant="contained"
            onClick={() => setIsEditing((currentValue) => !currentValue)}
          >
            {isEditing ? "Done" : "Edit"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
