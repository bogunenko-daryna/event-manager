import { Alert, Stack, Typography } from "@mui/material";

export function TimelinePage() {
  return (
    <Stack spacing={2}>
      <Typography variant="h5">Timeline View</Typography>

      <Alert severity="warning">
        Timeline will be implemented after Calendar View. It may require MUI X
        Premium.
      </Alert>
    </Stack>
  );
}
