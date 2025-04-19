import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import { green, red, yellow, blue, grey } from '@mui/material/colors';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SuperadminMain from './SuperadminMain';

const SuperadminDashboard: React.FC = () => {
  return (
    <SuperadminMain>
    <Box sx={{ bgcolor: 'white', color: 'grey.900', p: { xs: 2, sm: 3, md: 5 } }}>
      <Box maxWidth="1200px" mx="auto">
        {/* Header */}
        <Box mb={6}>
          <Typography variant="h6" fontWeight={600}>
            Attendance
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            <span style={{ fontWeight: 400 }}>Dashboard</span> /{' '}
            <span style={{ fontStyle: 'italic' }}>Attendance</span>
          </Typography>
        </Box>

        <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }} gap={3} mb={6}>
          {/* Timesheet */}
          <Paper variant="outlined" sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="subtitle2" color="primary" fontWeight={600}>
                Timesheet
              </Typography>
              <Typography variant="caption" color="text.secondary">
                11 Mar 2019
              </Typography>
            </Box>

            <Box border="1px solid" borderColor="grey.300" borderRadius={1} p={2} mb={4}>
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Punch In at
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Wed, 11th Mar 2019 10.00 AM
              </Typography>
            </Box>

            <Box display="flex" justifyContent="center" mb={4}>
              {/* Circular progress (custom SVG) */}
              <svg width="96" height="96" viewBox="0 0 100 100" role="img" aria-label="Circular progress">
                <circle cx="50" cy="50" r="45" stroke={grey[300]} strokeWidth="10" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke={blue[600]}
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="282.6"
                  strokeDashoffset="182.6"
                  transform="rotate(-90 50 50)"
                />
                <text
                  x="50"
                  y="55"
                  textAnchor="middle"
                  fontSize="16"
                  fontWeight="700"
                  fill="#111827"
                  fontFamily="Inter, sans-serif"
                >
                  3.45 hrs
                </text>
              </svg>
            </Box>

            <Button
              variant="contained"
              sx={{ backgroundColor: green[400], color: 'white', px: 3, py: 1, fontSize: 14, fontWeight: 600, mx: 'auto' }}
            >
              Punch Out
            </Button>

            <Box display="flex" justifyContent="space-between" fontSize={12} color="grey.700" fontWeight={600} mt={4} px={1}>
              <Box textAlign="center">
                <Typography variant="body2" fontSize="0.75rem">
                  BREAK
                </Typography>
                <Typography variant="body2" fontWeight={400}>
                  1.21 hrs
                </Typography>
              </Box>
              <Box textAlign="center">
                <Typography variant="body2" fontSize="0.75rem">
                  OVERTIME
                </Typography>
                <Typography variant="body2" fontWeight={400}>
                  3 hrs
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Statistics */}
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="primary" fontWeight={600} mb={2}>
              Statistics
            </Typography>
            {[
              { label: 'Today', value: 3.45, max: 8, color: green[400] },
              { label: 'This Week', value: 28, max: 40, color: red[500] },
              { label: 'This Month', value: 90, max: 160, color: yellow[700] },
              { label: 'Remaining', value: 90, max: 160, color: blue[600] },
              { label: 'Overtime', value: 5, max: 20, color: yellow[500] },
            ].map(({ label, value, max, color }) => (
              <Box key={label} mb={2}>
                <Typography fontSize={12} fontWeight={600} color="grey.700" mb={0.5}>
                  {label}
                </Typography>
                <Box display="flex" justifyContent="space-between" fontSize={12} color="grey.500" mb={0.5}>
                  <span>{value}</span>
                  <span>/ {max} hrs</span>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(value / max) * 100}
                  sx={{ height: 8, borderRadius: 5, backgroundColor: grey[300], '& .MuiLinearProgress-bar': { backgroundColor: color } }}
                />
              </Box>
            ))}
          </Paper>

          {/* Today Activity */}
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="primary" fontWeight={600} mb={2}>
              Today Activity
            </Typography>
            <Box ml={1} pl={1} borderLeft={`2px solid ${green[300]}`} display="flex" flexDirection="column" gap={2}>
              {[
                'Punch In at 10.00 AM',
                'Punch Out at 11.00 AM',
                'Punch In at 11.30 AM',
                'Punch Out at 01.30 AM',
                'Punch In at 02.30 AM',
                'Punch In at 04.15 AM',
                'Punch Out at 07.00 AM',
              ].map((entry, index) => {
                const [label, time] = entry.split(' at ');
                return (
                  <Box key={index} position="relative" pl={3}>
                    <Box
                      position="absolute"
                      left={-12}
                      top={4}
                      width={10}
                      height={10}
                      borderRadius="50%"
                      bgcolor="white"
                      border={`2px solid ${green[400]}`}
                    />
                    <Typography fontWeight={600} fontSize={13}>
                      {label}
                    </Typography>
                    <Box display="flex" alignItems="center" color="grey.500">
                      <AccessTimeIcon sx={{ fontSize: 12, mr: 0.5 }} />
                      <Typography variant="caption">{time}</Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Box>

        {/* Attendance Table */}
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', lg: 'repeat(3, 1fr)' }} gap={3}>
          <Paper
            variant="outlined"
            sx={{ p: 3, gridColumn: { xs: 'span 1', lg: 'span 2' }, overflowX: 'auto' }}
          >
            <Typography variant="subtitle2" color="primary" fontWeight={600} mb={2}>
              Attendance List
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: grey[100] }}>
                    <TableCell sx={{ fontWeight: 600 }}>S. No</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Punch In</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Punch Out</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Production</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Break</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Overtime</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    ['1', '19 Feb 2019', '10 AM', '7 PM', '9 hrs', '1 hrs', '2 hrs'],
                    ['2', '20 Feb 2019', '10 AM', '7 PM', '9 hrs', '1 hrs', '0 hrs'],
                    ['3', '21 Feb 2019', '10 AM', '7 PM', '9 hrs', '1 hrs', '0 hrs'],
                    ['4', '22 Feb 2019', '10 AM', '7 PM', '9 hrs', '1 hrs', '0 hrs'],
                  ].map((row, idx) => (
                    <TableRow key={idx} sx={{ backgroundColor: idx % 2 === 0 ? 'white' : grey[50] }}>
                      {row.map((cell, i) => (
                        <TableCell key={i} sx={{ fontWeight: i === 0 ? 600 : 400 }}>
                          {cell}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>
    </Box>
    </SuperadminMain>
  );
};

export default SuperadminDashboard;
