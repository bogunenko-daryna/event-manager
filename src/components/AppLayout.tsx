import type { ReactNode } from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TimelineIcon from "@mui/icons-material/Timeline";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { Box, Button, Stack, Typography } from "@mui/material";

type AppLayoutProps = {
  activePage: string;
  onPageChange: (page: string) => void;
  children: ReactNode;
};

// AppLayout owns the shared shell: sticky header, page navigation, and the
// content area where Dashboard, Calendar, or Timeline is rendered.
export function AppLayout({
  activePage,
  onPageChange,
  children,
}: AppLayoutProps) {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        sx={{
          px: { xs: 2, md: 4 },
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: { xs: 1.5, sm: 2 },
          position: "sticky",
          top: 0,
          zIndex: 10,
          bgcolor: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: "primary.main",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 18px rgba(37, 99, 235, 0.25)",
            }}
          >
            <EventNoteIcon />
          </Box>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.1 }}>
              Event Manager
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Plan, assign, and track team events
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={{ xs: 0.5, sm: 1 }}
          sx={{
            overflowX: "auto",
            pb: 0.5,
            width: { xs: "100%", sm: "auto" },
            maxWidth: "100%",
          }}
        >
          <Button
            variant={activePage === "dashboard" ? "contained" : "text"}
            startIcon={<DashboardIcon />}
            onClick={() => onPageChange("dashboard")}
            sx={{ flexShrink: 0 }}
          >
            Dashboard
          </Button>

          <Button
            variant={activePage === "calendar" ? "contained" : "text"}
            startIcon={<CalendarMonthIcon />}
            onClick={() => onPageChange("calendar")}
            sx={{ flexShrink: 0 }}
          >
            Calendar
          </Button>

          <Button
            variant={activePage === "timeline" ? "contained" : "text"}
            startIcon={<TimelineIcon />}
            onClick={() => onPageChange("timeline")}
            sx={{ flexShrink: 0 }}
          >
            Timeline
          </Button>
        </Stack>
      </Box>

      <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>
    </Box>
  );
}
