import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import DeanMain from './DeanMain';

interface ProgramChair {
  _id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  username: string;
  email: string;
  status: string;
  course: string;
  college: {
    code: string;
  };
}

const ProgramchairInfo: React.FC = () => {
  const collegeCode = localStorage.getItem("college") ?? "";
  const [programChairs, setProgramChairs] = useState<ProgramChair[]>([]);

  useEffect(() => {
    const fetchProgramChairs = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/programchairs`, {
          params: { collegeCode },
        });
        console.log(res.data);
        setProgramChairs(res.data);
      } catch (error) {
        console.error("Error fetching program chairpersons:", error);
      }
    };
  
    fetchProgramChairs();
  }, [collegeCode]);

  return (
    <DeanMain>
    <Typography variant="h4" fontWeight="bold" color="#333" gutterBottom>
      List of Program Chairperson/s
    </Typography>
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TableContainer component={Paper} sx={{ width: '100%' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Full Name</strong></TableCell>
                <TableCell><strong>Username</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>College</strong></TableCell>
                <TableCell><strong>Course</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {programChairs.map((chair) => (
                <TableRow key={chair._id}>
                  <TableCell>{`${chair.first_name} ${chair.middle_name ?? ''} ${chair.last_name}`}</TableCell>
                  <TableCell>{chair.username}</TableCell>
                  <TableCell>{chair.email}</TableCell>
                  <TableCell>{chair.college?.code ?? "N/A"}</TableCell>
                  <TableCell>{chair.course.toLocaleUpperCase()}</TableCell>
                  <TableCell>{chair.status}</TableCell>
                  <TableCell>
                    <IconButton><EditIcon /></IconButton>
                    <IconButton><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  </DeanMain>
  );
};

export default ProgramchairInfo;
