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
import SuperadminMain from './SuperadminMain';

interface Dean {
    _id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    username: string;
    email: string;
    role: string;
    college?: {
      _id: string;
      code: string;
      name: string;
    };
    status: string;
  }
  

const DeanInfo: React.FC = () => {
  const [deans, setDeans] = useState<Dean[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeans = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/dean');
        setDeans(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching deans:', error);
        setError('Failed to fetch deans');
        setLoading(false);
      }
    };

    fetchDeans();
  }, []);

  return (
    <SuperadminMain>
        <Typography variant="h4" fontWeight="bold" color="#333" gutterBottom>
          List of Dean/s
        </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div style={{ color: 'red' }}>{error}</div>
          ) : (
            <TableContainer component={Paper} sx={{ width: '100%' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Full Name</strong></TableCell>
                    <TableCell><strong>Username</strong></TableCell>
                    <TableCell><strong>Email</strong></TableCell>
                    <TableCell><strong>College</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Action</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deans.map((dean) => (
                    <TableRow key={dean._id}>
                      <TableCell>{`${dean.last_name}, ${dean.first_name} ${dean.middle_name ? dean.middle_name.charAt(0) + '.' : ''}`}</TableCell>
                      <TableCell>{dean.username}</TableCell>
                      <TableCell>{dean.email}</TableCell>
                      <TableCell>{dean.college?.name || 'N/A'}</TableCell>
                      <TableCell>{dean.status}</TableCell>
                      <TableCell>
                        <IconButton color="primary" onClick={() => console.log('Edit', dean._id)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton color="error" onClick={() => console.log('Delete', dean._id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {deans.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No dean data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>
    </SuperadminMain>
  );
};

export default DeanInfo;
