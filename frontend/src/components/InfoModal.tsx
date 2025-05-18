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
import { IconButton } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import 'react-calendar-heatmap/dist/styles.css';
import './CustomHeatmap.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import weekday from "dayjs/plugin/weekday";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(weekday);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);


interface ModalProps {
  open: boolean;
  onClose: () => void;
  faculty: any;
}

interface Schedule {
  courseCode: string;
  courseTitle: string;
  displaySection: string;
  days: { mon: boolean; tue: boolean; wed: boolean; thu: boolean; fri: boolean; sat: boolean };
  startTime: string;
  endTime: string;
  room: string;
}


const InfoModal: React.FC<ModalProps> = ({ open, onClose, faculty }) => {
  const [schedules, setSchedules] = useState([]);
  const [logs, setLogs] = useState([]);

  const today = new Date();
  const startDate = new Date(today.getFullYear(), 0, 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);


  const handleAddSchedule = async () => {
    const { value: file } = await Swal.fire({
      title: 'Upload Schedule Document',
      input: 'file',
      inputAttributes: {
        accept: '.doc,.docx',
        'aria-label': 'Upload your teaching load document',
      },
      showCancelButton: true,
      confirmButtonText: 'Upload',
      preConfirm: (file) => {
        if (!file) {
          Swal.showValidationMessage('You need to select a file');
        }
        return file;
      },
    });
  
    if (file) {
      const formData = new FormData();
      formData.append('scheduleDocument', file);
  
      try {
        const { data } = await axios.post('http://localhost:5000/api/auth/uploadScheduleDocument', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        const scheduleData: Schedule[] = data.data;
  
        let tableHtml = `
          <table style="width:100%; border: 1px solid #ddd; border-collapse: collapse;">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Title</th>
                <th>Section</th>
                <th>Days</th>
                <th>Time</th>
                <th>Room</th>
              </tr>
            </thead>
            <tbody>
        `;
  
        scheduleData.forEach((schedule: Schedule) => {
          const days = Object.keys(schedule.days)
            .filter((day) => schedule.days[day as keyof typeof schedule.days])
            .join(", ");
  
          tableHtml += `
            <tr>
              <td>${schedule.courseCode}</td>
              <td>${schedule.courseTitle}</td>
              <td>${schedule.displaySection}</td>
              <td>${days}</td>
              <td>${schedule.startTime} – ${schedule.endTime}</td>
              <td>${schedule.room}</td>
            </tr>
          `;
        });
  
        tableHtml += `</tbody></table>`;
  
        const confirmResult = await Swal.fire({
          title: 'Confirm upload schedule?',
          html: `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <p><strong>Instructor:</strong> ${data.instructorName}</p>
              <p><strong>Semester & AY:</strong> ${data.semester}, AY ${data.academicYear}</p>
            </div>
            ${tableHtml}
          `,
          showCancelButton: true,
          confirmButtonText: 'Confirm Upload',
          width: 800,
          scrollbarPadding: false,
        });
  
        if (confirmResult.isConfirmed) {
          await axios.post('http://localhost:5000/api/auth/confirmSchedules', { schedules: scheduleData });
  
          Swal.fire({
            icon: 'success',
            title: 'Schedules Uploaded!',
            text: 'The schedules have been successfully uploaded to the database.',
          });
        }
  
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: error.response?.data?.message || 'Something went wrong.',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: 'An unknown error occurred.',
          });
        }
      }
    }
  };
  


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

    return Object.keys(logCounts).map(date => ({
      date,
      count: logCounts[date],
    }));
  };

  const values = processLogsForHeatmap();

  return (
    <Modal open={open} onClose={onClose} BackdropProps={{
      style: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
      },
    }}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: '#F8E5EE',
          boxShadow: 10,
          p: 4,
          maxWidth: 1100,
          width: '90%',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Faculty Information of{' '}
            <span style={{ fontWeight: 'bold' }}>{`${faculty.last_name}, ${faculty.first_name}`}</span>
          </Typography>

          {/* Icons aligned to the right */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Upload schedule manually" arrow>
              <IconButton color="primary" onClick={handleAddSchedule}>
                <AddCircleOutlineIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Upload schedule by docx" arrow>
              <IconButton color="primary" onClick={handleAddSchedule}>
                <FileUploadIcon />
              </IconButton>
            </Tooltip>
          </Box>
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
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Highest Educational Attainment:</Typography>
                <Typography variant="body1">{faculty.highestEducationalAttainment}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Academic Rank:</Typography>
                <Typography variant="body1">{faculty.academicRank}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Status of Appointment:</Typography>
                <Typography variant="body1">{faculty.statusOfAppointment}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>No. of Preparations:</Typography>
                <Typography variant="body1">{faculty.numberOfPrep}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Total Teaching Load:</Typography>
                <Typography variant="body1">{faculty.totalTeachingLoad}</Typography>
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
            <TableContainer component={Paper} sx={{ maxHeight: 440, overflowY: 'auto' }}>
              <Table size="small" aria-label="faculty schedules table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Course Code</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Course Title</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Days</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Section</TableCell>
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
                          {(() => {
                            const dayAbbreviations: { [key: string]: string } = {
                              sun: 'Su',
                              mon: 'M',
                              tue: 'T',
                              wed: 'W',
                              thu: 'Th',
                              fri: 'F',
                              sat: 'S',
                            };

                            return Object.entries(schedule.days)
                              .filter(([_, isActive]) => isActive)
                              .map(([day]) => dayAbbreviations[day.toLowerCase()] || '')
                              .join('');
                          })()}
                        </TableCell>
                        <TableCell>
                          {schedule.startTime} - {schedule.endTime}
                        </TableCell>
                        <TableCell>
                          {schedule.section?.course} - {schedule.section?.section}{schedule.section?.block}
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
