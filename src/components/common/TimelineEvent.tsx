import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

// Base visual block for an event in the custom Gantt-style timeline.
export const TimelineEvent = styled(Box)({
  position: "absolute",
  height: 40,
  borderRadius: 8,
  paddingLeft: 8,
  paddingRight: 8,
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  overflow: "hidden",
  userSelect: "none",
  transition: "opacity 0.2s ease, transform 0.2s ease",

  "&:hover": {
    opacity: 0.9,
    transform: "translateY(-2px)",
  },
});
