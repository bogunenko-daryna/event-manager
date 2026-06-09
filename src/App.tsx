import { useState } from "react";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AppLayout } from "./components/AppLayout";
import { CalendarPage } from "./pages/Calendar";
import { DashboardPage } from "./pages/Dashboard";
import { TimelinePage } from "./pages/Timeline";

const theme = createTheme({
  palette: {
    mode: "light",
  },
});

export default function App() {
  const [activePage, setActivePage] = useState("calendar");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AppLayout activePage={activePage} onPageChange={setActivePage}>
        {activePage === "dashboard" && <DashboardPage />}
        {activePage === "calendar" && <CalendarPage />}
        {activePage === "timeline" && <TimelinePage />}
      </AppLayout>
    </ThemeProvider>
  );
}
