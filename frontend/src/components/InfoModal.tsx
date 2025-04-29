import React, { useEffect, useState } from 'react';
import {
  Modal,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from '@mui/material';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import './CustomHeatmap.css';
import axios from 'axios';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  faculty: any;
}

const InfoModal: React.FC<ModalProps> = ({ open, onClose, faculty }) => {
  const [schedules, setSchedules] = useState([]);
  const [logs, setLogs] = useState([]);

  const today = new Date();
  const startDate = new Date(today.getFullYear(), 0, 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Fetch schedules on component mount or when facultyId changes
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!faculty?._id) return;

      try {
        const response = await axios.get('http://localhost:5000/api/auth/schedules-faculty', {
          params: { facultyId: faculty._id },
        });
        console.log('Received schedule data:', response.data);
        setSchedules(response.data);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };

    fetchSchedules();
  }, [faculty?._id]);

  // Fetch logs on component mount or when facultyId changes
  useEffect(() => {
    const fetchLogs = async () => {
      if (!faculty?._id) return;

      try {
        const response = await axios.get('http://localhost:5000/api/auth/logs/faculty-today', {
          params: { facultyId: faculty._id },
        });
        console.log('Received logs:', response.data);
        setLogs(response.data);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    fetchLogs();
  }, [faculty?._id]);

  if (!faculty) return null;

  // Process the logs to get count per day
  const processLogsForHeatmap = () => {
    const logCounts: { [key: string]: number } = {};

    logs.forEach((log: any) => {
      const date = log.date;
      if (logCounts[date]) {
        logCounts[date] += 1;
      } else {
        logCounts[date] = 1;
      }
    });

    // Convert to the format expected by react-calendar-heatmap
    return Object.keys(logCounts).map(date => ({
      date,
      count: logCounts[date],
    }));
  };

  const values = processLogsForHeatmap();

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          maxWidth: 1100,
          width: '90%',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography variant="h5">
            Faculty Information of <span style={{ fontWeight: 'bold' }}>{`${faculty.last_name}, ${faculty.first_name}`}</span>
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 4,
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          {/* Left Column: Faculty Info and Heatmap */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Faculty Information Table */}
            <Box component={Paper} sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Username:</Typography>
                <Typography variant="body1">{faculty.username}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Email:</Typography>
                <Typography variant="body1">{faculty.email}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Role:</Typography>
                <Typography variant="body1">{faculty.role.charAt(0).toUpperCase() + faculty.role.slice(1)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Status:</Typography>
                <Typography variant="body1">{faculty.status.charAt(0).toUpperCase() + faculty.status.slice(1)}</Typography>
              </Box>
            </Box>

            {/* Faculty Activity Heatmap */}
            <Box
              sx={{
                p: 2,
                border: '1px solid #ccc',
                borderRadius: 2,
                backgroundColor: '#fafafa',
                flexShrink: 0,
                height: 'auto',
                textAlign: 'center',
              }}
            >
              <Typography variant="h6">Faculty Activity</Typography>
              <CalendarHeatmap
                startDate={startDate}
                endDate={endDate}
                values={values}
                classForValue={(value) => {
                  if (!value || value.count === 0) {
                    return 'color-empty';
                  }
                  return `color-github-${value.count}`;
                }}
                tooltipDataAttrs={(value) => {
                  if (value && value.date) {
                    return {
                      'data-tip': `${value.date}: ${value.count} activities`,
                    } as unknown as CalendarHeatmap.TooltipDataAttrs;
                  }
                  return {} as CalendarHeatmap.TooltipDataAttrs;
                }}
                showWeekdayLabels
              />
            </Box>
          </Box>

          {/* Right Column: Faculty Schedules */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Faculty Schedules Table */}
            <TableContainer component={Paper}>
              <Table size="small" aria-label="faculty schedules table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Course Code</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Course Title</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Days</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Room</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedules.length > 0 ? (
                    schedules.map((schedule: any) => (
                      <TableRow key={schedule._id}>
                        <TableCell>{schedule.courseCode}</TableCell>
                        <TableCell>{schedule.courseTitle}</TableCell>
                        <TableCell>
                          {Object.entries(schedule.days)
                            .filter(([_, isActive]) => isActive)
                            .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1))
                            .join(', ')}
                        </TableCell>
                        <TableCell>
                          {schedule.startTime} - {schedule.endTime}
                        </TableCell>
                        <TableCell>{schedule.room}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No schedules yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>

        <Button variant="contained" onClick={onClose} sx={{ marginTop: 2 }} fullWidth>
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default InfoModal;
