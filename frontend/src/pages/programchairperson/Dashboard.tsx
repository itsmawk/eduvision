import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card, IconButton, Grid, Avatar
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { HighlightScope } from '@mui/x-charts/context';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PeopleIcon from '@mui/icons-material/People';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { green, grey } from '@mui/material/colors';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import axios from "axios";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
import AdminMain from './AdminMain';

const highlightScope: HighlightScope = {
  highlight: 'series',
  fade: 'global',
};

interface Schedule {
  instructor: string;
  startTime: string;
  endTime: string;
  room: string;
}


const Dashboard: React.FC = () => {
  const [instructorCount, setinstructorCount] = useState<number | null>(null);
  const [schedulesCountToday, setSchedulesCountToday] = useState<number | null>(null);
  const [expectedHours, setExpectedHours] = useState<number[]>([]);
  const [actualHours, setActualHours] = useState<number[]>([]);
  const [facultyNames, setFacultyNames] = useState<string[]>([]);
  const [allFacultiesLogs, setAllFacultiesLogs] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [overlappingSchedules, setOverlappingSchedules] = useState<any[]>([]);
  const [overlappingCount, setOverlappingCount] = useState(0);

  const CourseName = localStorage.getItem("course") ?? "";
  const ShortCourseName = CourseName.replace(/^bs/i, "").toUpperCase();

  useEffect(() => {
    const fetchOverlappingSchedules = async () => {
      try {
        const response = await axios.post("http://localhost:5000/api/auth/all-schedules/overlapping", {
          shortCourseName: ShortCourseName,
        });
        console.log("Overlapping Schedules:", response.data);
        const overlappingSchedules = response.data;
        setOverlappingCount(overlappingSchedules.length);
        setOverlappingSchedules(response.data);
      } catch (error) {
        console.error("Error fetching overlapping schedules:", error);
      }
    };

    if (ShortCourseName) {
      fetchOverlappingSchedules(); // Only fetch if shortCourseName is provided
    }
  }, [ShortCourseName]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.post("http://localhost:5000/api/auth/all-schedules/today", {
          shortCourseName: ShortCourseName
        });
        console.log("Received schedule data:", response.data);
        setSchedules(response.data);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };
  
    fetchSchedules();
  }, [ShortCourseName]);
  
  useEffect(() => {
    const fetchInstructorCount = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/auth/count/instructors`, {
          params: { course: CourseName }
        });
        setinstructorCount(response.data.count);
      } catch (error) {
        console.error("Failed to fetch instructor count:", error);
      }
    };
  
    if (CourseName) {
      fetchInstructorCount();
    }
  }, [CourseName]);

  useEffect(() => {
    const fetchSchedulesCountToday = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/auth/schedules-count/today`, {
          params: { course: CourseName }
        });
        setSchedulesCountToday(response.data.count);
      } catch (error) {
        console.error("Failed to fetch today's schedule count:", error);
      }
    };
  
    if (CourseName) {
      fetchSchedulesCountToday();
    }
  }, []);
  
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/actual-and-expected-hours-by-faculty", {
          params: {
            courseName: CourseName,
            shortCourseName: ShortCourseName,
          },
        });
  
        const data = res.data || [];
  
        setExpectedHours(data.map((item: any) => item.totalExpectedHours));
        setActualHours(data.map((item: any) => item.totalActualHours));
        setFacultyNames(data.map((item: any) => item.name));
      } catch (error) {
        console.error("Failed to fetch chart data:", error);
      }
    };
  
    fetchChartData();
  }, []);
  
  const series = [
    {
      label: "Expected schedule hours",
      data: expectedHours,
    },
    {
      label: "Total schedule hours",
      data: actualHours,
    },
  ].map((s) => ({ ...s, highlightScope }));

  useEffect(() => {
    const fetchAllFacultiesLogs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/logs/all-faculties/today", {
          params: {
            courseName: CourseName,
          },
        });
        setAllFacultiesLogs(res.data);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      }
    };

    fetchAllFacultiesLogs();
  }, []);

  return (
    <AdminMain>
    <Box sx={{ color: 'grey.900', p: { xs: 2, sm: 3, md: 1 } }}>
      <Box maxWidth="1200px" mx="auto">
        {/* Header */}
        <Box mb={3}>
          <Typography variant="h4" fontWeight={600}>
            {CourseName ? CourseName.toUpperCase() : "Loading..."} Program Chairperson Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            <span style={{ fontWeight: 400 }}>Dashboard</span> /{' '}
            <span style={{ fontStyle: 'italic' }}>Attendance</span>
          </Typography>
        </Box>

        <Box sx={{ pb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1} sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: '#f3e8ff', color: '#9f7aea', mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="600" color="text.primary">
                    {instructorCount !== null ? instructorCount.toLocaleString() : "Loading..."}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Faculties
                  </Typography>
                </Box>
                <Box sx={{ marginLeft: 'auto' }}>
                  <IconButton size="small" sx={{ color: 'gray' }}>
                    <MoreHorizIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1} sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: '#e0f2fe', color: '#38bdf8', mr: 2 }}>
                  <HighlightOffIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="600" color="text.primary">
                    0
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Instructor Absentees Today
                  </Typography>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1} sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: '#ffedd5', color: '#fb923c', mr: 2 }}>
                  <EventAvailableIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="600" color="text.primary">
                    {schedulesCountToday !== null ? schedulesCountToday.toLocaleString() : "Loading..."}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Classes Today
                  </Typography>
                </Box>
                <Box sx={{ marginLeft: 'auto' }}>
                  <IconButton size="small" sx={{ color: 'gray' }}>
                    <MoreHorizIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={1} sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: '#fce7f3', color: '#ec4899', mr: 2 }}>
                  <WarningAmberIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="600" color="text.primary">
                  {overlappingCount !== null ? overlappingCount.toLocaleString() : "Loading..."}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Schedule Conflicts
                  </Typography>
                </Box>
                <Box sx={{ marginLeft: 'auto' }}>
                  <IconButton size="small" sx={{ color: 'gray' }}>
                    <MoreHorizIcon />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>
        
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }} gap={3} mb={6}>
          {/* Bar Chart */}
          <Paper variant="outlined" sx={{ p: 3, gridColumn: { md: 'span 2' } }}>
            <Typography variant="subtitle2" color="primary" fontWeight={600} mb={2}>
              Today Schedule Chart
            </Typography>
            <BarChart
              height={300}
              xAxis={[{ scaleType: "band", data: facultyNames }]}
              series={series}
            />
          </Paper>

          {/* Today Activity */}
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="primary" fontWeight={600} mb={2}>
              Today Activity
            </Typography>
            <Box ml={1} pl={1} display="flex" flexDirection="column" gap={2}>
              {allFacultiesLogs.length === 0 ||
              !allFacultiesLogs.some((log) => log.timeIn || log.timeout) ? (
                <Typography variant="body2" color="textSecondary" textAlign="center">
                  There is no current activity today.
                </Typography>
              ) : (
                allFacultiesLogs.map((log, index) => {
                  const entries = [];

                  if (log.timeIn) {
                    entries.push({ label: "Time In", time: log.timeIn });
                  }
                  if (log.timeout) {
                    entries.push({ label: "Time Out", time: log.timeout });
                  }

                  return entries.map((entry, subIndex, arr) => {
                    const parsed = dayjs(entry.time, "HH:mm");
                    const formattedTime = parsed.isValid()
                      ? parsed.format("hh:mm A")
                      : "Invalid time";

                    const isLastItem =
                      subIndex === arr.length - 1 &&
                      index === allFacultiesLogs.length - 1;

                    return (
                      <Box
                        key={`${index}-${subIndex}`}
                        display="flex"
                        position="relative"
                        pl={3}
                      >
                        {/* Circle and connecting line */}
                        <Box
                          position="absolute"
                          left={-12}
                          top={0}
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                        >
                          {/* Circle */}
                          <Box
                            width={12}
                            height={12}
                            borderRadius="50%"
                            bgcolor="white"
                            border={`2px solid ${green[400]}`}
                            zIndex={1}
                            mt={0.5}
                          />
                          {/* Connecting line */}
                          {!isLastItem && (
                            <Box
                              flex={1}
                              width={2}
                              bgcolor={green[300]}
                              mt={0.5}
                              style={{ minHeight: 36 }}
                            />
                          )}
                        </Box>

                        {/* Entry content */}
                        <Box>
                          <Typography fontWeight={600} fontSize={13}>
                            {entry.label} of {log.instructorName || "Unknown Instructor"}
                          </Typography>
                          <Box display="flex" alignItems="center" color="grey.500">
                            <AccessTimeIcon sx={{ fontSize: 12, mr: 0.5 }} />
                            <Typography variant="caption">{formattedTime}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  });
                })
              )}
            </Box>
          </Paper>
        </Box>

        {/* Attendance Table */}
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: 'repeat(3, 1fr)' }} gap={3}>
          <Paper
            variant="outlined"
            sx={{ p: 3, gridColumn: { xs: 'span 1', lg: 'span 2' }, overflowX: 'auto' }}
          >
            <Typography variant="subtitle2" color="primary" fontWeight={600} mb={2}>
              All Schedules Today
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: grey[100] }}>
                    <TableCell sx={{ fontWeight: 600 }}>S. No</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Instructor</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Start Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>End Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Room</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
  {schedules.length === 0 ? (
    <TableRow>
      <TableCell colSpan={5} align="center">
        No schedules found.
      </TableCell>
    </TableRow>
  ) : (
    schedules.map((schedule, idx) => (
      <TableRow key={idx} sx={{ backgroundColor: idx % 2 === 0 ? 'white' : grey[50] }}>
        <TableCell sx={{ fontWeight: 600 }}>{idx + 1}</TableCell>
        <TableCell>{schedule.instructor}</TableCell>
        <TableCell>{schedule.startTime}</TableCell>
        <TableCell>{schedule.endTime}</TableCell>
        <TableCell>{schedule.room}</TableCell>
      </TableRow>
    ))
  )}
</TableBody>

              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </Box>
    </AdminMain>
  );
};

export default Dashboard;
