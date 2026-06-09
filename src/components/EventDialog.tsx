import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
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
  onUpdate: (event: EventItem) => void;
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
}: EventDialogProps) {
  if (!event) {
    return null;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [draftEvent, setDraftEvent] = useState(event);

  useEffect(() => {
    setDraftEvent(event);
    setIsEditing(false);
  }, [event]);

  const category = categories.find((item) => item.id === event.categoryId);
  const eventTags = tags.filter((tag) => event.tagIds.includes(tag.id));
  const organiser = users.find((user) => user.id === event.organiserId);
  const attendees = users.filter((user) => event.attendeeIds.includes(user.id));

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

            <Typography>
              {new Date(event.start).toLocaleString()} —{" "}
              {new Date(event.end).toLocaleString()}
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Category
            </Typography>

            {category && (
              <Chip
                label={category.title}
                sx={{
                  mt: 1,
                  bgcolor: category.color,
                  color: "#fff",
                }}
              />
            )}
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Tags
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
              {eventTags.map((tag) => (
                <Chip key={tag.id} label={tag.title} size="small" />
              ))}
            </Stack>
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

            {organiser && (
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
            )}
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Attendees
            </Typography>

            <Stack spacing={1} sx={{ mt: 1 }}>
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
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => onDelete(event.id)}
        >
          Delete
        </Button>

        <Button
          startIcon={<EditIcon />}
          variant="contained"
          onClick={() => {
            if (isEditing) {
              onUpdate(draftEvent);
              setIsEditing(false);
            } else {
              setIsEditing(true);
            }
          }}
        >
          {isEditing ? "Save" : "Edit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
