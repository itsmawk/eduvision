import { useState } from "react";
import { TextField, Button, Container, Typography, Card, CardContent, Avatar, CircularProgress } from "@mui/material";
import axios from "axios";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Swal from "sweetalert2";

export default function SignUp() {
  const [user, setUser] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/signup", user);
      console.log(response.data);

      Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: "You can now log in.",
        confirmButtonColor: "steelblue",
        timer: 2000,
        showClass: {
          popup: "animate__animated animate__fadeInDown",
        },
        hideClass: {
          popup: "animate__animated animate__fadeOutUp",
        },
      });
    } catch (error) {
      let errorMessage = "An unexpected error occurred";

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || "Error signing up";
      }

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: errorMessage,
        confirmButtonColor: "steelblue",
        timer: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ display: "flex", justifyContent: "center", minHeight: "100vh", alignItems: "center" }}>
      <Card sx={{ width: "100%", padding: 3, backgroundColor: "#f5f5f5", borderRadius: 3 }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          <Avatar sx={{ bgcolor: "steelblue", width: 60, height: 60, mb: 2 }}>
            <PersonAddIcon sx={{ fontSize: 40 }} />
          </Avatar>

          <Typography variant="h5" fontWeight="bold" color="gray" gutterBottom>
            Create an Account
          </Typography>

          <TextField
            label="Username"
            name="username"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleChange}
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleChange}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            onChange={handleChange}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, bgcolor: "steelblue", "&:hover": { bgcolor: "darkblue" } }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Register"}
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}