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
  SelectChangeEvent,
  Menu,
  Autocomplete
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import InfoIcon from '@mui/icons-material/Info';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from "@mui/icons-material/Add";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Swal from "sweetalert2";
import { useFacultyContext } from "../../context/FacultyContext";
import BlockIcon from '@mui/icons-material/Block';

import axios from 'axios';
import DeanMain from './DeanMain';
import InfoModal from '../../components/InfoModal';


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

interface Course {
  _id: string;
  name: string;
  code: string;
  college: string;
}

const ProgramchairInfo: React.FC = () => {
  const collegeCode = localStorage.getItem("college") ?? "";

  const [programChairs, setProgramChairs] = useState<ProgramChair[]>([]);
  const [filteredChairs, setFilteredChairs] = useState<ProgramChair[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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
    role: "",
    college: "",
    course: collegeCode,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [roleAnchorEl, setRoleAnchorEl] = useState<null | HTMLElement>(null);
  const [courseAnchorEl, setCourseAnchorEl] = useState<null | HTMLElement>(null);
  const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(null);
  const roleMenuOpen = Boolean(roleAnchorEl);
  const courseMenuOpen = Boolean(courseAnchorEl);
  const statusMenuOpen = Boolean(statusAnchorEl);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [selectedFacultyInfo, setSelectedFacultyInfo] = useState<any>(null);
  const [selectedChair, setSelectedChair] = useState<string | null>(null);
  const chairOptions = programChairs.map(chair => `${chair.first_name} ${chair.last_name}`);
  const [courses, setCourses] = useState<Course[]>([]);
  


  
    const handleOpenInfoModal = (faculty: any) => {
      setSelectedFacultyInfo(faculty);
      setOpenInfoModal(true);
    };
  
    const handleCloseInfoModal = () => {
      setSelectedFacultyInfo(null);
      setOpenInfoModal(false);
    };

    useEffect(() => {
      const fetchCourses = async () => {
        const collegeCode = localStorage.getItem("college") ?? "";
    
        if (!collegeCode) {
          console.error("No college code found in localStorage.");
          return;
        }
    
        try {
          const response = await axios.post("http://localhost:5000/api/auth/college-courses", { collegeCode });
          setCourses(response.data.courses); // <--- here
        } catch (err: any) {
          console.error("Failed to fetch courses:", err.response?.data?.message || err.message);
        }
      };
    
      fetchCourses();
    }, []);
    

    const fetchProgramChairs = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/auth/programchairs`, {
          params: { collegeCode },
        });
        setProgramChairs(res.data);
        setFilteredChairs(res.data);
        setFacultyList(res.data); // Keep context in sync, if needed
      } catch (error) {
        console.error("Error fetching program chairpersons:", error);
      }
    };
    
    useEffect(() => {
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

  

  const handleRoleClick = (event: React.MouseEvent<HTMLElement>) => {
    setRoleAnchorEl(event.currentTarget);
  };
  
  const handleCourseClick = (event: React.MouseEvent<HTMLElement>) => {
    setCourseAnchorEl(event.currentTarget);
  };

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>) => {
    setStatusAnchorEl(event.currentTarget);
  };
  
  const handleRoleClose = () => {
    setRoleAnchorEl(null);
  };
  
  const handleCourseClose = () => {
    setCourseAnchorEl(null);
  };

  const handleStatusClose = () => {
    setStatusAnchorEl(null);
  };
  

  const handleRoleSelect = (role: string) => {
    if (role === 'all') {
      setFilteredChairs(programChairs);
    } else {
      const filtered = programChairs.filter((chair) =>
        chair.role.toLowerCase() === role.toLowerCase()
      );
      setFilteredChairs(filtered);
    }
    handleRoleClose();
  };
  
  const uniqueCourses = Array.from(
    new Set(programChairs.map(chair => chair.course))
  );
  
  const handleCourseSelect = (course: string) => {
    if (course === 'all') {
      setFilteredChairs(programChairs);
    } else {
      const filtered = programChairs.filter(
        (chair) => chair.course.toLowerCase() === course.toLowerCase()
      );
      setFilteredChairs(filtered);
    }
    handleCourseClose();
  };
  
  const handleStatusSelect = (status: string) => {
    if (status === 'all') {
      setFilteredChairs(programChairs);
    } else {
      const filtered = programChairs.filter((chair) =>
        chair.status.toLowerCase() === status.toLowerCase()
      );
      setFilteredChairs(filtered);
    }
    handleStatusClose(); // make sure this closes the menu
  };
  
  


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
      course: "",
      college: collegeCode,
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setNewFaculty({ last_name: "", first_name: "", middle_name: "", username: "", email: "", password: "", role: "instructor", course: "", college: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewFaculty((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (event: SelectChangeEvent<string>) => {
    const selectedRole = event.target.value;
    setNewFaculty((prev) => ({
      ...prev,
      role: selectedRole,
      course: "" // reset course on role change
    }));
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
      fetchProgramChairs();
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
        fetchProgramChairs();
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

  const generateUsername = (firstName: string, lastName: string) => {
        const first = firstName.substring(0, 3).toUpperCase();
        const last = lastName.substring(0, 3).toUpperCase();
        return last + first;
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
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <strong>Position</strong>
                      <IconButton onClick={handleRoleClick} size="small">
                        <ArrowDropDownIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Menu
                      anchorEl={roleAnchorEl}
                      open={roleMenuOpen}
                      onClose={handleRoleClose}
                    >
                      <MenuItem onClick={() => handleRoleSelect('all')}>
                        All
                      </MenuItem>
                      <MenuItem onClick={() => handleRoleSelect('programchairperson')}>
                        Program Chairperson
                      </MenuItem>
                      <MenuItem onClick={() => handleRoleSelect('instructor')}>
                        Instructor
                      </MenuItem>
                    </Menu>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <strong>Program</strong>
                      <IconButton onClick={handleCourseClick} size="small">
                        <ArrowDropDownIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Menu
                      anchorEl={courseAnchorEl}
                      open={courseMenuOpen}
                      onClose={handleCourseClose}
                    >
                      <MenuItem onClick={() => handleCourseSelect('all')}>
                        All
                      </MenuItem>
                      {uniqueCourses.map((course) => (
                        <MenuItem key={course} onClick={() => handleCourseSelect(course)}>
                          {course}
                        </MenuItem>
                      ))}
                    </Menu>
                  </TableCell>

                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <strong>Status of Account</strong>
                      <IconButton onClick={handleStatusClick} size="small">
                        <ArrowDropDownIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Menu
                      anchorEl={statusAnchorEl}
                      open={statusMenuOpen}
                      onClose={handleStatusClose}
                    >
                      <MenuItem onClick={() => handleStatusSelect('all')}>
                        All
                      </MenuItem>
                      <MenuItem onClick={() => handleStatusSelect('active')}>
                        Active
                      </MenuItem>
                      <MenuItem onClick={() => handleStatusSelect('inactive')}>
                        Inactive
                      </MenuItem>
                      <MenuItem onClick={() => handleStatusSelect('forverification')}>
                        For Verification
                      </MenuItem>
                    </Menu>
                  </TableCell>
                  <TableCell><strong>View More</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredChairs.map((chair) => (
                  <TableRow key={chair._id}>
                    <TableCell>{`${chair.last_name}, ${chair.first_name} ${chair.middle_name ?? ''} `}</TableCell>
                    <TableCell>{chair.email}</TableCell>
                    <TableCell>
                      {chair.role === "programchairperson"
                        ? "Program Chairperson"
                        : chair.role.charAt(0).toUpperCase() + chair.role.slice(1)}
                    </TableCell>
                    <TableCell>{chair.course.toLocaleUpperCase()}</TableCell>
                    <TableCell>
                      {chair.status === "forverification"
                        ? "For Verification"
                        : chair.status.charAt(0).toUpperCase() + chair.status.slice(1)}
                    </TableCell>
                    <TableCell>
                    <>
                        <IconButton color="primary" onClick={() => handleOpenInfoModal(chair)}>
                          <InfoIcon />
                        </IconButton>

                        <InfoModal 
                          open={openInfoModal} 
                          onClose={handleCloseInfoModal}
                          faculty={selectedFacultyInfo}
                        />
                      </>
                    </TableCell>
                    <TableCell>
                      <IconButton>
                        <BlockIcon/>
                      </IconButton>
                      <IconButton onClick={() => handleDeleteAccount(chair._id)}>
                        <DeleteIcon sx={{ color: 'red' }} />
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
            label="Username"
            name="username"
            value={newFaculty.username}
            fullWidth
            margin="normal"
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
              value={newFaculty.role}
              onChange={handleRoleChange}
              label="Role"
              name="role"
            >
              <MenuItem value="instructor">Instructor</MenuItem>
              <MenuItem value="program chairperson">Program Chairperson</MenuItem>
              {/* Add more roles if needed */}
            </Select>
          </FormControl>

          
          <Autocomplete
            options={courses.map(course => course.code)}
            getOptionLabel={(option) => option}
            value={newFaculty.course || null}
            onChange={(event, newValue) => {
              setNewFaculty(prev => ({ ...prev, course: newValue || "" }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Course Code"
                variant="outlined"
                size="small"
              />
            )}
            sx={{ width: 250 }}
          />



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
