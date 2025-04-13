import React, { useEffect, useState } from "react";
import { Typography, Box } from "@mui/material";
import UserMain from "./UserMain";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";

interface ScheduleItem {
  courseTitle: string;
  startTime: string;
  endTime: string;
  semesterStartDate: string;
  semesterEndDate: string;
  days: {
    mon: boolean;
    tue: boolean;
    wed: boolean;
    thu: boolean;
    fri: boolean;
    sat: boolean;
  };
}

const FacultySchedule: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const facultyId = localStorage.getItem("facultyId");
        if (!facultyId) return;

        const { data } = await axios.get(
          `http://localhost:5000/api/auth/faculty-schedules/${facultyId}`
        );

        const allEvents: any[] = [];

        data.forEach((schedule: ScheduleItem) => {
          const { startTime, endTime, semesterStartDate, semesterEndDate, courseTitle, days } = schedule;

          const startDate = new Date(semesterStartDate);
          const endDate = new Date(semesterEndDate);

          const daysMap = {
            mon: 1,
            tue: 2,
            wed: 3,
            thu: 4,
            fri: 5,
            sat: 6,
          };

          for (const [dayKey, dayNum] of Object.entries(daysMap)) {
            if (days[dayKey as keyof typeof days]) {
              let current = new Date(startDate);

              while (current <= endDate) {
                if (current.getDay() === dayNum) {
                  const dateStr = current.toISOString().split("T")[0];
                  allEvents.push({
                    title: courseTitle,
                    start: `${dateStr}T${startTime}`,
                    end: `${dateStr}T${endTime}`,
                  });
                }
                current.setDate(current.getDate() + 1);
              }
            }
          }
        });

        setEvents(allEvents);
      } catch (error) {
        console.error("Failed to load schedules:", error);
      }
    };

    fetchSchedule();
  }, []);

  return (
    <UserMain>
      <Typography variant="h4" fontWeight="bold" color="#333" mb={3}>
        Welcome to Faculty Schedule
      </Typography>

      <Box sx={{ backgroundColor: "#fff", borderRadius: 2, p: 2, boxShadow: 2 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          slotMinTime="07:00:00"
          slotMaxTime="18:00:00"
          selectable={true}
          editable={false}
          height="auto"
          events={events}
        />
      </Box>
    </UserMain>
  );
};

export default FacultySchedule;
