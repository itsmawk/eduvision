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
  Dialog, 
  DialogTitle, 
  DialogContent 
} from "@mui/material";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from "dayjs";
import AdminMain from "./AdminMain";

const Schedule: React.FC = () => {
  const [calendarView, setCalendarView] = useState<string>("dayGridMonth");
  const [currentTitle, setCurrentTitle] = useState<string>("");
  const [openDateDialog, setOpenDateDialog] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const calendarRef = useRef<any>(null);

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

  const handleOpenDateDialog = () => {
    setOpenDateDialog(true);
  };

  const handleCloseDateDialog = () => {
    setOpenDateDialog(false);
  };

  const handleDateSelect = (date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(date.format("YYYY-MM-DD")); // Navigate calendar to selected date
      setOpenDateDialog(false); // Close the dialog
    }
  };

  useEffect(() => {
    const calendarApi = calendarRef.current.getApi();
    setCurrentTitle(calendarApi.view.title);
  }, [calendarView]);

  return (
    <AdminMain>
      {/* Header Section */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1, textAlign: "left", display: "flex", alignItems: "center" }}>
          {currentTitle}
          <IconButton color="primary" sx={{ ml: 1 }} onClick={handleOpenDateDialog}>
            <CalendarTodayIcon />
          </IconButton>
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={handlePrev} color="primary">
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={handleNext} color="primary">
            <ChevronRightIcon />
          </IconButton>
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

      {/* Calendar */}
      <Box sx={{ marginTop: "20px" }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={calendarView}
          headerToolbar={false}
          events={[
            { title: "Meeting", start: "2023-03-10" },
            { title: "Conference", start: "2023-03-15", end: "2023-03-17" },
          ]}
        />
      </Box>

      {/* Date Picker Dialog */}
      <Dialog open={openDateDialog} onClose={handleCloseDateDialog}>
        <DialogTitle>Select Date</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={selectedDate}
              onChange={handleDateSelect}
              views={["year", "month", "day"]}
              sx={{ mt: 2, width: "100%" }}
            />
          </LocalizationProvider>
        </DialogContent>
      </Dialog>
    </AdminMain>
  );
};

export default Schedule;
