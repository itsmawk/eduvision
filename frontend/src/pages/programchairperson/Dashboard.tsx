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
import BedIcon from '@mui/icons-material/Hotel';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
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


const Dashboard: React.FC = () => {
  const [instructorCount, setinstructorCount] = useState<number | null>(null);
  const [schedulesCountToday, setSchedulesCountToday] = useState<number | null>(null);
  const [expectedHours, setExpectedHours] = useState<number[]>([]);
  const [actualHours, setActualHours] = useState<number[]>([]);
  const [facultyNames, setFacultyNames] = useState<string[]>([]);
  const [allFacultiesLogs, setAllFacultiesLogs] = useState<any[]>([]);
  const CourseName = localStorage.getItem("course");
  
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
        const res = await axios.get("http://localhost:5000/api/auth/actual-and-expected-hours-by-faculty");
  
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
        const res = await axios.get(`http://localhost:5000/api/auth/logs/all-faculties/today`);
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
                  <BedIcon />
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
                  <PeopleIcon />
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
                  <ReceiptIcon />
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
                  <DirectionsCarIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="600" color="text.primary">
                    0
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Scedule Conflicts
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
              {allFacultiesLogs.map((log, index) => {
                const entries = [];

                if (log.timeIn) {
                  entries.push({ label: "Time In", time: log.timeIn });
                }
                if (log.timeout) {
                  entries.push({ label: "Time Out", time: log.timeout });
                }

                return entries.map((entry, subIndex, arr) => {
                  const parsed = dayjs(entry.time, "HH:mm");
                  const formattedTime = parsed.isValid() ? parsed.format("hh:mm A") : "Invalid time";

                  const isLastItem = subIndex === arr.length - 1 && index === allFacultiesLogs.length - 1;

                  return (
                    <Box key={`${index}-${subIndex}`} display="flex" position="relative" pl={3}>
                      {/* Circle and connecting line */}
                      <Box position="absolute" left={-12} top={0} display="flex" flexDirection="column" alignItems="center">
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
              })}
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
              Attendance List
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: grey[100] }}>
                    <TableCell sx={{ fontWeight: 600 }}>S. No</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Punch In</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Punch Out</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Production</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Break</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Overtime</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    ['1', '19 Feb 2019', '10 AM', '7 PM', '9 hrs', '1 hrs', '2 hrs'],
                    ['2', '20 Feb 2019', '10 AM', '7 PM', '9 hrs', '1 hrs', '0 hrs'],
                    ['3', '21 Feb 2019', '10 AM', '7 PM', '9 hrs', '1 hrs', '0 hrs'],
                    ['4', '22 Feb 2019', '10 AM', '7 PM', '9 hrs', '1 hrs', '0 hrs'],
                  ].map((row, idx) => (
                    <TableRow key={idx} sx={{ backgroundColor: idx % 2 === 0 ? 'white' : grey[50] }}>
                      {row.map((cell, i) => (
                        <TableCell key={i} sx={{ fontWeight: i === 0 ? 600 : 400 }}>
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
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
