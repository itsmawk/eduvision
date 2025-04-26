import React from 'react';
import { Modal, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  faculty: any;
}

const InfoModal: React.FC<ModalProps> = ({ open, onClose, faculty }) => {
  if (!faculty) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          maxWidth: 600,
          width: '90%',
        }}
      >
        <h2>Faculty Information</h2>

        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 500 }} size="small" aria-label="faculty info table">
            <TableHead>
              <TableRow>
                <TableCell>Field</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Full Name</TableCell>
                <TableCell>{`${faculty.last_name}, ${faculty.first_name} ${faculty.middle_name || ""}`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>{faculty.username}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>{faculty.email}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Role</TableCell>
                <TableCell>{faculty.role.charAt(0).toUpperCase() + faculty.role.slice(1)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Status</TableCell>
                <TableCell>{faculty.status.charAt(0).toUpperCase() + faculty.status.slice(1)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* Close Button */}
        <Button
          variant="contained"
          onClick={onClose}
          sx={{ marginTop: 2 }}
          fullWidth
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default InfoModal;
