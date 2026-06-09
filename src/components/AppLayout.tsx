import type { ReactNode } from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TimelineIcon from "@mui/icons-material/Timeline";
import { Box, Button, Stack, Typography } from "@mui/material";

type AppLayoutProps = {
  activePage: string;
  onPageChange: (page: string) => void;
  children: ReactNode;
};

export function AppLayout({
  activePage,
  onPageChange,
  children,
}: AppLayoutProps) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Event Manager
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button
            variant={activePage === "dashboard" ? "contained" : "text"}
            startIcon={<DashboardIcon />}
            onClick={() => onPageChange("dashboard")}
          >
            Dashboard
          </Button>

          <Button
            variant={activePage === "calendar" ? "contained" : "text"}
            startIcon={<CalendarMonthIcon />}
            onClick={() => onPageChange("calendar")}
          >
            Calendar
          </Button>

          <Button
            variant={activePage === "timeline" ? "contained" : "text"}
            startIcon={<TimelineIcon />}
            onClick={() => onPageChange("timeline")}
          >
            Timeline
          </Button>
        </Stack>
      </Box>

      <Box sx={{ p: 3 }}>{children}</Box>
    </Box>
  );
}
