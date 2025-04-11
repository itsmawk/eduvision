import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { 
  Typography, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent, 
  IconButton,
  Modal, 
  TextField, 
  Button, 
  Grid 
} from "@mui/material";
import DescriptionIcon from '@mui/icons-material/Description';
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from "dayjs";
import AdminMain from "./AdminMain";
import { Fab } from "@mui/material";
import { darken } from '@mui/material/styles';
import AddIcon from "@mui/icons-material/Add";
import Swal from 'sweetalert2';
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import weekday from "dayjs/plugin/weekday";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(weekday);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(isBetween);

const Schedule: React.FC = () => {
  const [calendarView, setCalendarView] = useState<string>("dayGridMonth");
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const calendarRef = useRef<any>(null);
  
  const [openModal, setOpenModal] = useState(false);
  const [courseTitle, setSubjectName] = useState("");
  const [courseCode, setSubjectCode] = useState("");
  const [instructors, setInstructors] = useState<any[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<string>('');
  const [selectedLab, setSelectedLab] = useState("Lab 1");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [allSchedules, setAllSchedules] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');

  type SemesterOption = {
    label: string;
    value: string;
    startDate: string;
    endDate: string;
  };

  const [semesterOptions, setSemesterOptions] = useState<SemesterOption[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);
  const daysOfWeek = ["mon", "tue", "wed", "thu", "fri", "sat"] as const;
  type DayKey = typeof daysOfWeek[number];



  const handleOpenModal = async () => {
    setOpenModal(true);
  
    if (instructors.length === 0) {
      try {
        const responseInstructors = await axios.get("http://localhost:5000/api/auth/instructors");
        console.log("Fetched instructors:", responseInstructors.data);
        setInstructors(responseInstructors.data);
      } catch (error) {
        console.error("Error fetching instructors:", error);
      }
    }
  
    if (subjects.length === 0) {
      try {
        const responseSubjects = await axios.get("http://localhost:5000/api/auth/subjects");
        console.log("Fetched subjects:", responseSubjects.data);
        setSubjects(responseSubjects.data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    }

    if (labs.length === 0) {
      try {
        const responseLabs = await axios.get("http://localhost:5000/api/auth/rooms");
        console.log("Fetched labs:", responseLabs.data);
        setLabs(responseLabs.data);
      } catch (error) {
        console.error("Error fetching labs:", error);
      }
    }

    if (sections.length === 0) {
      try {
        const responseSections = await axios.get("http://localhost:5000/api/auth/sections");
        console.log("Fetched sections:", responseSections.data);
        setSections(responseSections.data);
      } catch (error) {
        console.error("Failed to fetch sections:", error);
      }
    }

    const upcoming = generateUpcomingSemesters();
      if (upcoming.length > 0) {
        setSemesterOptions(upcoming);
        setSelectedSemester(upcoming[1]?.value || upcoming[0].value);
      }
    
  };
  
  
  const handleCloseModal = () => setOpenModal(false);

  const handleViewChange = (event: SelectChangeEvent<string>) => {
    const newView = event.target.value;
    setCalendarView(newView);
    const calendarApi = calendarRef.current.getApi();
    calendarApi.changeView(newView);
    setCurrentTitle(calendarApi.view.title);
  };

  const handlePrev = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.prev();
    setCurrentTitle(calendarApi.view.title);
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current.getApi();
    calendarApi.next();
    setCurrentTitle(calendarApi.view.title);
  };

  const handleDateSelect = (date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(date.format("YYYY-MM-DD"));
      setCurrentTitle(calendarApi.view.title);
      calendarApi.updateSize();
    }
    setShowDatePicker(false);
  };

  useEffect(() => {
    const calendarApi = calendarRef.current.getApi();
    setCurrentTitle(calendarApi.view.title);
  }, [calendarView]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/schedules");
        const schedules = response.data;
  
        setAllSchedules(schedules);
  
        const mappedEvents = schedules
          .filter((sched: any) => sched.room === selectedLab)
          .map((sched: any) => {
            const title = calendarView === "dayGridMonth" 
              ? `${sched.courseCode}`
              : `${sched.courseCode} - ${sched.courseTitle}`;
  
            return {
              id: sched._id,
              title: title,
              start: `${sched.date}T${sched.startTime}`,
              end: `${sched.date}T${sched.endTime}`,
              extendedProps: {
                room: sched.room,
                instructorId: sched.instructor
              }
            };
          });
  
        setCalendarEvents(mappedEvents);
      } catch (error) {
        console.error("Error fetching schedules:", error);
      }
    };
  
    fetchSchedules();
  }, [calendarView, selectedLab]);
  
  
  useEffect(() => {
    const filteredEvents = allSchedules
      .filter((sched: any) => sched.room === selectedLab)
      .map((sched: any) => ({
        id: sched._id,
        title: `${sched.courseTitle} (${sched.courseCode})`,
        start: `${sched.date}T${sched.startTime}`,
        end: `${sched.date}T${sched.endTime}`,
        extendedProps: {
          room: sched.room,
          instructorId: sched.instructor
        }
      }));
  
    setCalendarEvents(filteredEvents);
  }, [selectedLab, allSchedules]);
  
  useEffect(() => {
    const fetchLabs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/rooms");
        setLabs(response.data);
  
        if (response.data.length > 0 && !selectedLab) {
          setSelectedLab(response.data[0].name);
        }
      } catch (error) {
        console.error("Error fetching labs:", error);
      }
    };
  
    fetchLabs();
  }, []);
  

  const handleAddSchedule = async () => {
    const selectedSemesterData = semesterOptions.find(
      (semester) => semester.value === selectedSemester
    );
  
    if (!selectedSemesterData) {
      Swal.fire({
        icon: "error",
        title: "No Semester Selected",
        text: "Please select a valid semester before adding the schedule.",
        timer: 2000,
        showConfirmButton: false
      });
      return;
    }
  
    const scheduleData = {
      courseTitle,
      courseCode,
      instructor: selectedInstructor,
      room: selectedLab,
      startTime: startTime?.format("HH:mm:ss"),
      endTime: endTime?.format("HH:mm:ss"),
      days: selectedDays,
      semesterStartDate: selectedSemesterData.startDate,
      semesterEndDate: selectedSemesterData.endDate
    };
  
    try {
      const response = await axios.post("http://localhost:5000/api/auth/schedules", scheduleData);
      console.log("Schedule added successfully:", response.data);
  
      Swal.fire({
        icon: "success",
        title: "Schedule Added",
        text: "The schedule was added successfully!",
        timer: 2000,
        showConfirmButton: false
      });
  
      setOpenModal(false);
    } catch (error: any) {
      console.error("Error adding schedule:", error);
  
      Swal.fire({
        icon: "error",
        title: "Failed to Add",
        text: error.response?.data?.message || "An error occurred while adding the schedule.",
        timer: 2000,
        showConfirmButton: false
      });
  
      setOpenModal(false);
  
      setTimeout(() => {
        setOpenModal(true); 
        Swal.close();
      }, 2000);
    }
  };
  
  

  const [selectedDays, setSelectedDays] = useState<Record<DayKey, boolean>>({
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
  });
  
  
  const handleDayToggle = (day: DayKey) => {
    setSelectedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };
  
  useEffect(() => {
    const generateRecurringEvents = () => {
      const events: any[] = [];
  
      allSchedules.forEach((sched: any) => {
        if (sched.room !== selectedLab) return;
  
        const startTime = sched.startTime;
        const endTime = sched.endTime;
        const subjectTitle = `${sched.courseTitle} (${sched.courseCode})`;
  
        const semesterStart = dayjs(sched.semesterStartDate);
        const semesterEnd = dayjs(sched.semesterEndDate);
  
        let currentDate = semesterStart;
  
        while (currentDate.isSameOrBefore(semesterEnd)) {
          const dayKey = currentDate.format("ddd").toLowerCase().slice(0, 3);
  
          if (sched.days[dayKey]) {
            const eventDate = currentDate.format("YYYY-MM-DD");
  
            const eventTitle = calendarView === "dayGridMonth" ? sched.courseCode : subjectTitle;
  
            events.push({
              id: `${sched._id}-${eventDate}`,
              title: eventTitle,
              start: `${eventDate}T${startTime}`,
              end: `${eventDate}T${endTime}`,
              extendedProps: {
                room: sched.room,
                instructorId: sched.instructor,
                originalScheduleId: sched._id
              }
            });
          }
  
          currentDate = currentDate.add(1, "day");
        }
      });
  
      setCalendarEvents(events);
    };
  
    generateRecurringEvents();
  }, [selectedLab, allSchedules, calendarView]);
  
  
  
  const handleDocumentAdd = () => {
    Swal.fire({
      title: 'Upload Schedule Document',
      text: 'Please upload the schedule document (PDF/Word)',
      input: 'file',
      inputAttributes: {
        accept: '.pdf,.doc,.docx',
        'aria-label': 'Upload Schedule Document',
      },
      showCancelButton: true,
      confirmButtonText: 'Upload',
      cancelButtonText: 'Cancel',
      preConfirm: (file) => {
        if (!file) {
          Swal.showValidationMessage('Please select a file');
          return false;
        }
        const formData = new FormData();
        formData.append('scheduleDocument', file);
        return axios
          .post('http://localhost:5000/api/auth/uploadScheduleDocument', formData)
          .then((response) => {
            return response.data;
          })
          .catch((error) => {
            Swal.showValidationMessage('Failed to upload document');
            return Promise.reject(error); 
          });
      },
    })
      .then((result) => {
        if (result.isConfirmed) {
          Swal.fire('Success!', 'Document uploaded successfully!', 'success');
        }
      })
      .catch(() => {
        Swal.fire('Error!', 'An error occurred while uploading the document.', 'error');
      });
  };
  

  const generateUpcomingSemesters = () => {
    const today = dayjs();
    const year = today.year();
  
    const semesters = [];
  
    const firstStart  = dayjs(`${year}-08-01`);
    const firstEnd    = dayjs(`${year}-12-31`);

    const secondStart = dayjs(`${year}-01-01`);
    const secondEnd   = dayjs(`${year}-05-31`);

    const nextSecondStart = dayjs(`${year + 1}-01-01`);
    const nextSecondEnd   = dayjs(`${year + 1}-05-31`);
  
    if (today.isBetween(firstStart, firstEnd, null, '[]')) {
      semesters.push({
        label: `1ST Semester, AY ${year}-${year + 1}`,
        value: `1ST-${year}-${year + 1}`,
        startDate: firstStart.format('YYYY-MM-DD'),
        endDate:   firstEnd.format('YYYY-MM-DD'),
      });
    }
  
    if (today.isBetween(secondStart, secondEnd, null, '[]')) {
      semesters.push({
        label: `2ND Semester, AY ${year - 1}-${year}`,
        value: `2ND-${year - 1}-${year}`,
        startDate: secondStart.format('YYYY-MM-DD'),
        endDate:   secondEnd.format('YYYY-MM-DD'),
      });
    }
  
    if (firstStart.isAfter(today)) {
      semesters.push({
        label: `1ST Semester, AY ${year}-${year + 1}`,
        value: `1ST-${year}-${year + 1}`,
        startDate: firstStart.format('YYYY-MM-DD'),
        endDate:   firstEnd.format('YYYY-MM-DD'),
      });
    }
  
    if (nextSecondStart.isAfter(today)) {
      semesters.push({
        label: `2ND Semester, AY ${year}-${year + 1}`,
        value: `2ND-${year}-${year + 1}`,
        startDate: nextSecondStart.format('YYYY-MM-DD'),
        endDate:   nextSecondEnd.format('YYYY-MM-DD'),
      });
    }
  
    return semesters;
  };


  return (
    <AdminMain>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            textAlign: "left",
            display: "flex",
            alignItems: "center"
          }}
        >
          {currentTitle}
          <IconButton color="primary" sx={{ ml: 1 }} onClick={() => setShowDatePicker(!showDatePicker)}>
            <CalendarTodayIcon />
          </IconButton>
          {showDatePicker && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                value={selectedDate}
                onChange={handleDateSelect}
                views={["year", "month", "day"]}
                slotProps={{ textField: { size: "small" } }}
                sx={{ ml: 1 }}
              />
            </LocalizationProvider>
          )}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={handlePrev} color="primary">
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={handleNext} color="primary">
            <ChevronRightIcon />
          </IconButton>

          <FormControl fullWidth>
            <InputLabel>Lab</InputLabel>
            <Select 
              value={selectedLab} 
              onChange={(e) => setSelectedLab(e.target.value)}
            >
              {labs.map((lab) => (
                <MenuItem key={lab._id} value={lab.name}>
                  {lab.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl variant="outlined" sx={{ ml: 2, minWidth: 150 }}>
            <InputLabel>View</InputLabel>
            <Select
              label="View"
              name="view"
              value={calendarView}
              onChange={handleViewChange}
            >
              <MenuItem value="dayGridMonth">Month</MenuItem>
              <MenuItem value="timeGridWeek">Week</MenuItem>
              <MenuItem value="timeGridDay">Day</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ marginTop: "20px" }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={calendarView}
          headerToolbar={false}
          events={calendarEvents}
          slotMinTime="07:00:00"
          slotMaxTime="19:00:00"
          allDaySlot={false}
          expandRows={true}
          dateClick={(arg) => {
            alert("Date clicked: " + arg.dateStr);
          }}
        />
         <Fab
            color="primary"
            sx={(theme) => ({
              position: "fixed",
              bottom: 16,
              right: 16,
              zIndex: 1000,
              transition: "all 0.3s ease",
              backgroundColor: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: darken(theme.palette.primary.main, 0.1),
              },
            })}
            onClick={handleOpenModal}
          >
            <AddIcon />
          </Fab>

          <Fab
            color="secondary"
            sx={(theme) => ({
              position: "fixed",
              bottom: 16,
              right: 80,
              zIndex: 1000,
              transition: "all 0.3s ease",
              backgroundColor: theme.palette.secondary.main,
              "&:hover": {
                backgroundColor: darken(theme.palette.secondary.main, 0.1),
              },
            })}
            onClick={handleDocumentAdd}
          >
            <DescriptionIcon />
          </Fab>

          <Modal open={openModal} onClose={handleCloseModal}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 800,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Add Schedule
            </Typography>

            <Grid container spacing={2}>
              {/* LEFT COLUMN */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Subject Code</InputLabel>
                  <Select
                    value={courseCode}
                    onChange={(e) => {
                      const selectedCode = e.target.value;
                      setSubjectCode(selectedCode);
                      const selectedSubject = subjects.find(
                        (sub) => sub.courseCode === selectedCode
                      );
                      setSubjectName(selectedSubject?.courseTitle || "");
                    }}
                  >
                    {subjects.map((subject) => (
                      <MenuItem key={subject._id} value={subject.courseCode}>
                        {subject.courseCode}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Subject Name"
                  value={courseTitle}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ mt: 2 }}
                />

                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Instructor</InputLabel>
                  <Select
                    value={selectedInstructor}
                    onChange={(e) => setSelectedInstructor(e.target.value)}
                  >
                    {instructors.map((instructor) => (
                      <MenuItem key={instructor._id} value={instructor._id}>
                        {`${instructor.last_name}, ${instructor.first_name} ${
                          instructor.middle_name ? instructor.middle_name[0] + "." : ""
                        }`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="section-label">Section</InputLabel>
                  <Select
                    labelId="section-label"
                    value={selectedSection}
                    label="Section"
                    onChange={(e) => setSelectedSection(e.target.value)}
                  >
                    {sections.map((section) => (
                      <MenuItem key={section._id} value={section._id}>
                        {`${section.course} ${section.section}${section.block}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* RIGHT COLUMN */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Lab</InputLabel>
                  <Select
                    value={selectedLab}
                    onChange={(e) => setSelectedLab(e.target.value)}
                  >
                    {labs.map((lab) => (
                      <MenuItem key={lab._id} value={lab.name}>
                        {lab.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">Days</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                    {daysOfWeek.map((day) => (
                      <FormControl key={day} sx={{ minWidth: 80 }}>
                        <label>
                          <input
                            type="checkbox"
                            checked={selectedDays[day]}
                            onChange={() => handleDayToggle(day)}
                          />
                          &nbsp;{day.charAt(0).toUpperCase() + day.slice(1)}
                        </label>
                      </FormControl>
                    ))}
                  </Box>
                </Box>

                <FormControl fullWidth>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                  >
                    {semesterOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>


                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        label="Start Time"
                        value={startTime}
                        onChange={(time) => setStartTime(time)}
                        sx={{ width: "100%" }}
                      />
                    </LocalizationProvider>
                  </Grid>
                  <Grid item xs={6}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <TimePicker
                        label="End Time"
                        value={endTime}
                        onChange={(time) => setEndTime(time)}
                        sx={{ width: "100%" }}
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button onClick={handleCloseModal} sx={{ mr: 1 }}>
                  Cancel
                </Button>
                <Button variant="contained" color="primary" onClick={handleAddSchedule}>
                  Add
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Modal>
      </Box>
    </AdminMain>
  );
};

export default Schedule;
