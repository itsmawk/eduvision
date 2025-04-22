import { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";


export default function Login() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", credentials);

      const { token, user, requiresUpdate } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("course", user.course);

      Swal.fire({
        icon: "success",
        title: `Welcome ${user.last_name}, ${user.first_name} ${user.middle_name ? user.middle_name : ""}`.trim(),
        showConfirmButton: false,
        timer: 2000,
      });

      if (requiresUpdate) {
        navigate(`/update-credentials/${user.id}`);
      } else if (user.role?.toLowerCase() === "superadmin") {
        navigate(`/superadmin-dashboard/${user.id}`);
      } else if (user.role?.toLowerCase() === "dean") {
        navigate(`/dean-dashboard/${user.id}`);
      } else if (
        user.role?.toLowerCase() === "instructor" &&
        user.status?.toLowerCase() === "permanent"
      ) {
        navigate(`/faculty-dashboard/${user.id}`);
      } else if (user.role?.toLowerCase() === "programchairperson") {
        navigate(`/dashboard/${user.id}`);
      }

    } catch (error) {
      let errorMessage = "Invalid Credentials";

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || "Invalid Credentials";
      }

      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: errorMessage,
        confirmButtonColor: "steelblue",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#4d0000",
      }}
    >
      <Card
        elevation={6}
        sx={{
          padding: 4,
          width: "100%",
          textAlign: "center",
          backgroundColor: "#ECDCBF",
          color: "white",
          borderRadius: "16px"
        }}
      >
        <CardContent>
           {/* LOGO */}
            <Box sx={{ mb: 2 }}>
              <img
                src="/ccms.jpg" // assuming it's in public/logo.png
                alt="App Logo"
                style={{ width: "120px", height: "auto", marginBottom: "20px" }}
              />
            </Box>
          <Typography variant="h4" gutterBottom fontWeight="bold" color="black">
            Welcome Back
          </Typography>
          <Typography variant="body2" color="gray" gutterBottom>
            Please enter your credentials to sign in
          </Typography>
          <Box component="form" sx={{ mt: 2 }}>
          <TextField
            label="Username"
            name="username"
            fullWidth
            margin="normal"
            variant="outlined"
            onChange={handleChange}
            InputLabelProps={{ style: { color: "black" } }}
            InputProps={{
              style: { color: "black" },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'black',
                },
                '&:hover fieldset': {
                  borderColor: 'black',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'black',
                },
              },
            }}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            variant="outlined"
            onChange={handleChange}
            InputLabelProps={{ style: { color: "black" } }}
            InputProps={{
              style: { color: "black" },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'black',
                },
                '&:hover fieldset': {
                  borderColor: 'black',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'black',
                },
              },
            }}
          />
            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 2,
                py: 1.2,
                backgroundColor: "#5a0000",
                '&:hover': { backgroundColor: "#730000" },
              }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
