import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow
} from "@mui/material";
import AdminMain from "./AdminMain";
import axios from "axios";

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}

interface AttendanceRow {
  name: string;
  courseCode: string;
  courseTitle: string;
  status: string;
  timeInOut: string;
  room: string;
}

const columns: readonly Column[] = [
  { id: "name", label: "Instructor Name", minWidth: 120 },
  { id: "courseCode", label: "Course Code", minWidth: 50 },
  { id: "courseTitle", label: "Course Title", minWidth: 120 },
  { id: "status", label: "Status", minWidth: 100 },
  { id: "timeInOut", label: "Time In & Out", minWidth: 80 },
  { id: "room", label: "Room", minWidth: 70 },
];

const FacultyReports: React.FC = () => {
  const CourseName = localStorage.getItem("course") ?? "";

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  

  // Placeholder for your fetched attendance rows

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("http://localhost:5000/api/auth/show-daily-report", {
          CourseName,
        });
        if (response.data.success) {
          setRows(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch attendance data:", error);
      }
    };

    fetchData();
  }, [CourseName]);


  const handleGenerateReport = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/generate-daily-report",
        { CourseName: CourseName },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "DailyAttendanceReport.docx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report.");
    }
  };

  return (
    <AdminMain>
      
      <Typography variant="h5" align="center" sx={{ mb: 2 }}>Faculty Daily Report</Typography>

      <Paper sx={{ width: "100%", height: 500, display: "flex", flexDirection: "column" }}>
        <TableContainer sx={{ flex: 1, overflow: "auto" }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    No attendance today of faculty.
                  </TableCell>
                </TableRow>
              ) : (
                rows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, idx) => (
                    <TableRow hover tabIndex={-1} key={idx}>
                      {columns.map((column) => {
                        const value = (row as any)[column.id];
                        return (
                          <TableCell key={column.id} align={column.align}>
                            {column.format && typeof value === "number"
                              ? column.format(value)
                              : value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Box display="flex" justifyContent="flex-end" sx={{ mt: 2 }}>
        <Button variant="contained" color="primary" onClick={handleGenerateReport}>
          Generate & Download Report
        </Button>
      </Box>

    </AdminMain>
  );
};

export default FacultyReports;
