import { Paper } from "@mui/material";
import { styled } from "@mui/material/styles";

// Shared popover body for Calendar and Timeline filters.
export const FilterPanel = styled(Paper)({
  padding: 16,
  marginTop: 8,
  width: 320,
  maxWidth: "calc(100vw - 32px)",
});
