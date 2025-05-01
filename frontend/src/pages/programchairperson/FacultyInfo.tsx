import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminMain from "./AdminMain";
import Swal from "sweetalert2";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import InfoIcon from '@mui/icons-material/Info';
import { useFacultyContext } from "../../context/FacultyContext";
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
import InfoModal from '../../components/InfoModal';


const FacultyInfo: React.FC = () => {
  const CourseName = localStorage.getItem("course") ?? "";
  const CollegeName = localStorage.getItem("college") ?? "";
  const { facultyList, setFacultyList } = useFacultyContext();
  const [selectedFaculty, setSelectedFaculty] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFaculty, setNewFaculty] = useState({
    last_name: "",
    first_name: "",
    middle_name: "",
    username: "",
    email: "",
    password: "",
    role: "instructor",
    college: "",
    course: "",
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
      username: "",
      email: "",
      password: random4Digit(),
      role: "instructor",
      college: CollegeName,
      course: CourseName,
    });
    setOpenModal(true);
  };

  const handleCloseModal = (resetForm = true) => {
    setOpenModal(false);
    if (resetForm) {
      setNewFaculty({
        last_name: "",
        first_name: "",
        middle_name: "",
        username: "",
        email: "",
        password: "",
        role: "instructor",
        college: "",
        course: "",
      });
    }
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
      handleCloseModal(false);
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill out all required fields.",
        timer: 2000,
        timerProgressBar: true,
        willClose: () => {
          setOpenModal(true);
        },
      });
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/auth/faculty", newFaculty);
      setFacultyList([...facultyList, res.data]);
      Swal.fire({ 
        icon: "success", 
        title: "Success", 
        text: "Faculty account added successfully!" });
      handleCloseModal();
    } catch (error: any) {
      handleCloseModal(false)
      console.error("Error adding faculty account:", error);
      Swal.fire({ 
        icon: "error", 
        title: "Error", 
        text: error.response?.data?.message || "Failed to add faculty account.", 
        timer: 2000,
        timerProgressBar: true,
        willClose: () => {
          setOpenModal(true);
        }, 
      });
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

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredFacultyList = facultyList.filter((faculty) => {
    const fullName = `${faculty.last_name}, ${faculty.first_name} ${faculty.middle_name || ""}`.toLowerCase();
    return (
      fullName.includes(searchQuery) ||
      faculty.username.toLowerCase().includes(searchQuery) ||
      faculty.email.toLowerCase().includes(searchQuery)
    );
  });

  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [selectedFacultyInfo, setSelectedFacultyInfo] = useState<any>(null);

  const handleOpenInfoModal = (faculty: any) => {
    setSelectedFacultyInfo(faculty);
    setOpenInfoModal(true);
  };

  const handleCloseInfoModal = () => {
    setSelectedFacultyInfo(null);
    setOpenInfoModal(false);
  };

  const generateUsername = (firstName: string, lastName: string) => {
    const first = firstName.substring(0, 3).toUpperCase();
    const last = lastName.substring(0, 3).toUpperCase();
    return first + last;
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (newFaculty.first_name && newFaculty.last_name) {
        const username = generateUsername(newFaculty.first_name, newFaculty.last_name);
        setNewFaculty(prev => ({ ...prev, username }));
      }
    }, 2000);
  
    return () => clearTimeout(timer);
  }, [newFaculty.first_name, newFaculty.last_name]);
  
  
  return (
    <AdminMain>
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
      <Typography variant="h4" fontWeight="bold" color="#333" gutterBottom>
        Faculty Information {CourseName && `- ${CourseName.toUpperCase()}`}
      </Typography>
        <TextField
          variant="outlined"
          placeholder="Search faculty..."
          size="small"
          sx={{ mx: 2, width: "250px" }}
          onChange={handleSearch}
        />

        <IconButton color="primary" onClick={handleOpenModal}>
          <AddIcon />
        </IconButton>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TableContainer component={Paper} sx={{ width: "100%" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Full Name</strong></TableCell>
                  <TableCell><strong>Username</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFacultyList.map((faculty) => (
                  <TableRow 
                    key={faculty._id}
                    sx={{
                      backgroundColor: selectedFaculty === faculty._id ? "#e0f7fa" : "transparent",
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#f1f1f1" }
                    }}
                  >
                    <TableCell>
                      {`${faculty.last_name}, ${faculty.first_name} ${faculty.middle_name ? faculty.middle_name : ""}`}
                    </TableCell>
                    <TableCell>{faculty.username}</TableCell>
                    <TableCell>{faculty.email}</TableCell>
                    <TableCell>{faculty.role.charAt(0).toUpperCase() + faculty.role.slice(1)}</TableCell>
                    <TableCell>{faculty.status.charAt(0).toUpperCase() + faculty.status.slice(1)}</TableCell>
                    <TableCell>
                      <IconButton color="error" onClick={() => handleDeleteAccount(faculty._id)}>
                        <DeleteIcon />
                      </IconButton>
                      <>
                        <IconButton color="primary" onClick={() => handleOpenInfoModal(faculty)}>
                          <InfoIcon />
                        </IconButton>

                        <InfoModal 
                          open={openInfoModal} 
                          onClose={handleCloseInfoModal}
                          faculty={selectedFacultyInfo}
                        />
                      </>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>


      <Dialog open={openModal} onClose={() => handleCloseModal()}>
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
            InputProps={{
              readOnly: true,
            }} 
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
            <Select
              name="role"
              value={newFaculty.role}
              onChange={handleRoleChange}
              disabled // 👈 This disables the dropdown
            >
              <MenuItem value="instructor">Instructor</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleCloseModal()}>Cancel</Button>
          <Button onClick={handleAddAccount} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </AdminMain>
  );
};

export default FacultyInfo;
