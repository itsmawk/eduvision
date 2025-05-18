import React from "react";
import {
  Modal,
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

type Subject = {
  _id: string;
  courseCode: string;
  courseTitle: string;
};

type Instructor = {
  _id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
};

type Section = {
  _id: string;
  course: string;
  section: string;
  block: string;
};

type Lab = {
  _id: string;
  name: string;
};

type SemesterOption = {
  label: string;
  value: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  courseCode: string;
  courseTitle: string;
  subjects: Subject[];
  instructors: Instructor[];
  sections: Section[];
  labs: Lab[];
  selectedInstructor: string;
  selectedSection: string;
  selectedLab: string;
  selectedDays: Record<string, boolean>;
  selectedSemester: string;
  semesterOptions: SemesterOption[];
  startTime: dayjs.Dayjs | null;
  endTime: dayjs.Dayjs | null;
  daysOfWeek: string[];
  onChangeSubjectCode: (code: string) => void;
  onChangeInstructor: (id: string) => void;
  onChangeSection: (id: string) => void;
  onChangeLab: (name: string) => void;
  onChangeDay: (day: string) => void;
  onChangeSemester: (value: string) => void;
  onChangeStartTime: (value: dayjs.Dayjs | null) => void;
  onChangeEndTime: (value: dayjs.Dayjs | null) => void;
  onSubmit: () => void;
};

const AddScheduleManualModal: React.FC<Props> = ({
  open,
  onClose,
  courseCode,
  courseTitle,
  subjects,
  instructors,
  sections,
  labs,
  selectedInstructor,
  selectedSection,
  selectedLab,
  selectedDays,
  selectedSemester,
  semesterOptions,
  startTime,
  endTime,
  daysOfWeek,
  onChangeSubjectCode,
  onChangeInstructor,
  onChangeSection,
  onChangeLab,
  onChangeDay,
  onChangeSemester,
  onChangeStartTime,
  onChangeEndTime,
  onSubmit,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
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
                onChange={(e) => onChangeSubjectCode(e.target.value)}
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
                onChange={(e) => onChangeInstructor(e.target.value)}
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
                onChange={(e) => onChangeSection(e.target.value)}
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
                onChange={(e) => onChangeLab(e.target.value)}
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
                        onChange={() => onChangeDay(day)}
                      />
                      &nbsp;{day.charAt(0).toUpperCase() + day.slice(1)}
                    </label>
                  </FormControl>
                ))}
              </Box>
            </Box>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Semester</InputLabel>
              <Select
                value={selectedSemester}
                onChange={(e) => onChangeSemester(e.target.value)}
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
                    onChange={onChangeStartTime}
                    sx={{ width: "100%" }}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={6}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <TimePicker
                    label="End Time"
                    value={endTime}
                    onChange={onChangeEndTime}
                    sx={{ width: "100%" }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={onClose} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={onSubmit}>
              Add
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default AddScheduleManualModal;
