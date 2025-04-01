import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminMain from "./AdminMain";
import Swal from "sweetalert2";
import {
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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from "@mui/material";

interface Faculty {
  _id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  username:string;
  email: string;
  role: string;
}

const FacultyInfo: React.FC = () => {
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
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

  const handleOpenModal = () => setOpenModal(true);

  const handleCloseModal = () => {
    setOpenModal(false);
    setNewFaculty({ last_name: "", first_name: "", middle_name: "", username: "",email: "", password: "", role: "instructor" });
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

  const handleDeleteAccount = async () => {
    if (!selectedFaculty) {
      Swal.fire({
        icon: "warning",
        title: "No Faculty Selected",
        text: "Please select a faculty to delete.",
      });
      return;
    }

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
        await axios.delete(`http://localhost:5000/api/auth/faculty/${selectedFaculty}`);
        setFacultyList(facultyList.filter((faculty) => faculty._id !== selectedFaculty));
        setSelectedFaculty(null);
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
    <AdminMain>
      <Typography variant="h4" fontWeight="bold" color="#333" gutterBottom>
        Faculty Information
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={8}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Full Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Select</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {facultyList.map((faculty) => (
                  <TableRow 
                    key={faculty._id} 
                    onClick={() => setSelectedFaculty(faculty._id)}
                    sx={{
                      backgroundColor: selectedFaculty === faculty._id ? "#e0f7fa" : "transparent",
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#f1f1f1" }
                    }}
                  >
                    <TableCell>
                      {`${faculty.last_name}, ${faculty.first_name} ${faculty.middle_name ? faculty.middle_name : ""}`}
                    </TableCell>
                    <TableCell>{faculty.email}</TableCell>
                    <TableCell>{faculty.role}</TableCell>
                    <TableCell>
                      <input 
                        type="radio" 
                        name="facultySelect" 
                        checked={selectedFaculty === faculty._id} 
                        onChange={() => setSelectedFaculty(faculty._id)} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={4}>
          <Paper sx={{ padding: 3, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Actions
            </Typography>
            <Divider sx={{ width: "100%", mb: 2 }} />
            <Button variant="contained" color="primary" fullWidth sx={{ mb: 2 }} onClick={handleOpenModal}>
              Add Account
            </Button>
            <Button variant="contained" color="secondary" fullWidth disabled={!selectedFaculty} onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </Paper>
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
            type="password" 
            value={newFaculty.password} 
            onChange={handleInputChange} 
            margin="dense" 
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select name="role" value={newFaculty.role} onChange={handleRoleChange}>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="instructor">Instructor</MenuItem>
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
    </AdminMain>
  );
};

export default FacultyInfo;
