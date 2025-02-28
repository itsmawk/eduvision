import React, { useEffect, useState } from "react";
import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import axios from "axios";
import AdminMain from "./AdminMain";

interface Faculty {
  _id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  role: string;
}

const FacultyInfo: React.FC = () => {
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/faculty");
        setFacultyList(res.data);
      } catch (error) {
        console.error("Error fetching faculty data:", error);
      }
    };

    fetchFaculty();
  }, []);

  return (
    <AdminMain>
      <Typography variant="h4" fontWeight="bold" color="#333" gutterBottom>
        Faculty Information
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Full Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {facultyList.map((faculty) => (
              <TableRow key={faculty._id}>
                <TableCell>
                  {`${faculty.last_name}, ${faculty.first_name} ${faculty.middle_name ? faculty.middle_name : ""}`}
                </TableCell>
                <TableCell>{faculty.email}</TableCell>
                <TableCell>{faculty.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </AdminMain>
  );
};

export default FacultyInfo;
