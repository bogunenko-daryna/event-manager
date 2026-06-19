import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  Divider,
  Stack,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CategoryIcon from "@mui/icons-material/Category";
import GroupsIcon from "@mui/icons-material/Groups";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { PieChart, BarChart } from "@mui/x-charts";
import { mockApi } from "../api/mockApi";
import type { EventItem } from "../types/event";
import type { Category } from "../types/category";

export function DashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const [eventsData, categoriesData] = await Promise.all([
        mockApi.getEvents(),
        mockApi.getCategories(),
      ]);

      setEvents(eventsData);
      setCategories(categoriesData);
      setIsLoading(false);
    }

    loadData();
  }, []);

  if (isLoading) {
    return <CircularProgress />;
  }

  const pieData = categories.map((category) => ({
    id: category.id,
    label: category.title,
    value: events.filter((event) => event.categoryId === category.id).length,
  }));

  const monthData = Array.from({ length: 12 }).map((_, index) => {
    const count = events.filter(
      (event) => new Date(event.start).getMonth() === index
    ).length;

    return count;
  });

  const upcomingEvents = events
    .filter((event) => new Date(event.start) >= new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 5);
  const attendeeCount = new Set(events.flatMap((event) => event.attendeeIds))
    .size;
  const busiestMonthIndex = monthData.reduce(
    (bestIndex, count, index) => (count > monthData[bestIndex] ? index : bestIndex),
    0
  );
  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const stats = [
    {
      label: "Total events",
      value: events.length,
      icon: <CalendarTodayIcon />,
      color: "primary.main",
    },
    {
      label: "Categories used",
      value: pieData.filter((item) => item.value > 0).length,
      icon: <CategoryIcon />,
      color: "secondary.main",
    },
    {
      label: "People involved",
      value: attendeeCount,
      icon: <GroupsIcon />,
      color: "success.main",
    },
    {
      label: "Busiest month",
      value: monthLabels[busiestMonthIndex],
      icon: <TrendingUpIcon />,
      color: "warning.main",
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          A quick read on event load, participation, and what is coming next.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    color: "#fff",
                    bgcolor: stat.color,
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    {stat.label}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    {stat.value}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
        <Card sx={{ flex: 1, minWidth: 300 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Events by Category
            </Typography>

            <PieChart
              series={[
                {
                  data: pieData,
                  innerRadius: 42,
                  paddingAngle: 2,
                },
              ]}
              width={400}
              height={250}
            />
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 300 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Events by Month
            </Typography>

            <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: [
                    ...monthLabels,
                  ],
                },
              ]}
              series={[
                {
                  data: monthData,
                },
              ]}
              width={500}
              height={250}
            />
          </CardContent>
        </Card>
      </Box>

      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Upcoming Events
          </Typography>

          {upcomingEvents.length === 0 ? (
            <Typography color="text.secondary">No upcoming events</Typography>
          ) : (
            <Stack divider={<Divider flexItem />} spacing={1}>
              {upcomingEvents.map((event) => {
                const category = categories.find(
                  (item) => item.id === event.categoryId
                );

                return (
                  <Stack
                    key={event.id}
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    sx={{ py: 1, justifyContent: "space-between" }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 800 }}>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(event.start).toLocaleString()}
                      </Typography>
                    </Box>

                    {category && (
                      <Chip
                        label={category.title}
                        size="small"
                        sx={{
                          bgcolor: category.color,
                          color: "#fff",
                          width: "fit-content",
                        }}
                      />
                    )}
                  </Stack>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
