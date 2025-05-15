import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from "@mui/icons-material/Add";
import Swal from "sweetalert2";
import { useFacultyContext } from "../../context/FacultyContext";

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
  role: string;
  college: {
    code: string;
  };
}

const ProgramchairInfo: React.FC = () => {
  const collegeCode = localStorage.getItem("college") ?? "";

  const [programChairs, setProgramChairs] = useState<ProgramChair[]>([]);
  const [filteredChairs, setFilteredChairs] = useState<ProgramChair[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProgramChairs = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/programchairs`, {
          params: { collegeCode },
        });
        setProgramChairs(res.data);
        setFilteredChairs(res.data); // Initialize filtered list
      } catch (error) {
        console.error("Error fetching program chairpersons:", error);
      }
    };
    fetchProgramChairs();
  }, [collegeCode]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchQuery(value);

    const filtered = programChairs.filter((chair) => {
      return (
        chair.first_name.toLowerCase().includes(value) ||
        (chair.middle_name?.toLowerCase().includes(value) ?? false) ||
        chair.last_name.toLowerCase().includes(value) ||
        chair.email.toLowerCase().includes(value) ||
        chair.username.toLowerCase().includes(value)
      );
    });

    setFilteredChairs(filtered);
  };



  const { facultyList, setFacultyList } = useFacultyContext();
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    last_name: "",
    first_name: "",
    middle_name: "",
    username: "",
    email: "",
    password: "",
    role: "instructor",
  });
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const random4Digit = (): string => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleOpenModal = () => {
    setNewFaculty({
      last_name: "",
      first_name: "",
      middle_name: "",
      username: random4Digit(),
      email: "",
      password: random4Digit(),
      role: "instructor",
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setNewFaculty({ last_name: "", first_name: "", middle_name: "", username: "", email: "", password: "", role: "instructor" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewFaculty((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    setNewFaculty((prev) => ({ ...prev, role: event.target.value }));
  };

  const handleAddAccount = async () => {
    if (
      !newFaculty.last_name.trim() ||
      !newFaculty.first_name.trim() ||
      !newFaculty.email.trim() ||
      !newFaculty.password.trim()
    ) {
      Swal.fire({ icon: "warning", title: "Missing Fields", text: "Please fill out all required fields." });
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/faculty", newFaculty);
      setFacultyList([...facultyList, res.data]);
      Swal.fire({ icon: "success", title: "Success", text: "Faculty account added successfully!" });
      handleCloseModal();
    } catch (error: any) {
      console.error("Error adding faculty account:", error);
      Swal.fire({ icon: "error", title: "Error", text: error.response?.data?.message || "Failed to add faculty account." });
    }
  };

  const handleDeleteAccount = async (id: string) => {
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirmation.isConfirmed) {
      try {
        await axios.delete(`http://localhost:5000/api/auth/faculty/${id}`);
        setFacultyList(facultyList.filter((faculty) => faculty._id !== id));
        if (selectedFaculty === id) {
          setSelectedFaculty(null);
        }
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "The faculty account has been deleted successfully.",
        });
      } catch (error) {
        console.error("Error deleting account:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong! Unable to delete the account.",
        });
      }
    }
  };

  return (
    <DeanMain>
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight="bold" color="#333" gutterBottom>
          {collegeCode ? `${collegeCode} Staff Information` : "Faculty Information"}
        </Typography>
        <TextField
          variant="outlined"
          placeholder="Search faculty..."
          size="small"
          sx={{ mx: 2, width: "250px" }}
          value={searchQuery}
          onChange={handleSearch}
        />
        <IconButton color="primary" onClick={handleOpenModal}>
          <AddIcon />
        </IconButton>
      </Box>

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
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Course</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredChairs.map((chair) => (
                  <TableRow key={chair._id}>
                    <TableCell>{`${chair.first_name} ${chair.middle_name ?? ''} ${chair.last_name}`}</TableCell>
                    <TableCell>{chair.username}</TableCell>
                    <TableCell>{chair.email}</TableCell>
                    <TableCell>{chair.college?.code ?? "N/A"}</TableCell>
                    <TableCell>{chair.role}</TableCell>
                    <TableCell>{chair.course.toLocaleUpperCase()}</TableCell>
                    <TableCell>{chair.status}</TableCell>
                    <TableCell>
                      <IconButton><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDeleteAccount(chair._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Add Faculty Account</DialogTitle>
        <DialogContent>
          <TextField 
            fullWidth 
            label="Last Name" 
            name="last_name" 
            value={newFaculty.last_name} 
            onChange={handleInputChange} 
            margin="dense" 
          />
          <TextField 
            fullWidth 
            label="First Name" 
            name="first_name" 
            value={newFaculty.first_name} 
            onChange={handleInputChange} 
            margin="dense" 
          />
          <TextField 
            fullWidth 
            label="Middle Name" 
            name="middle_name" 
            value={newFaculty.middle_name} 
            onChange={handleInputChange} 
            margin="dense" 
          />
          <TextField 
            fullWidth 
            label="Username" 
            name="username" 
            value={newFaculty.username} 
            onChange={handleInputChange} 
            margin="dense" 
          />
          <TextField 
            fullWidth 
            label="Email" 
            name="email" 
            value={newFaculty.email} 
            onChange={handleInputChange} 
            margin="dense" 
          />
          <TextField 
            fullWidth 
            label="Password" 
            name="password" 
            type={showPassword ? "text" : "password"} 
            value={newFaculty.password} 
            onChange={handleInputChange} 
            margin="dense" 
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePasswordVisibility} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }} 
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select name="role" value={newFaculty.role} onChange={handleRoleChange}>
              <MenuItem value="superadmin">Super Admin</MenuItem>
              <MenuItem value="instructor">Instructor</MenuItem>
              <MenuItem value="dean">Dean</MenuItem>
              <MenuItem value="programchairperson">Program Chairperson</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleAddAccount} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
      
    </DeanMain>
  );
};


export default ProgramchairInfo;
