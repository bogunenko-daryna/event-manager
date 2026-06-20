import AddIcon from "@mui/icons-material/Add";
import { Button } from "@mui/material";

type CreateEventButtonProps = {
  onClick: () => void;
};

// Shared action used by Calendar and Timeline to start creating a new event.
export function CreateEventButton({ onClick }: CreateEventButtonProps) {
  return (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      onClick={onClick}
      sx={{ width: { xs: "100%", sm: "auto" } }}
    >
      Add Event
    </Button>
  );
}
