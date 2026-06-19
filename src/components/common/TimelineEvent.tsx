import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

export const TimelineEvent = styled(Box)({
  position: "absolute",
  height: 40,
  borderRadius: 8,
  paddingLeft: 8,
  paddingRight: 8,
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  transition: "0.2s",

  "&:hover": {
    opacity: 0.9,
    transform: "translateY(-2px)",
  },
});
