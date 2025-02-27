import { useState } from "react";
import { TextField, Button, Container, Typography, Card, CardContent, Box } from "@mui/material";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [user, setUser] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
        const res = await axios.post("http://localhost:5000/api/auth/login", user);

        localStorage.setItem("token", res.data.token);

        const faculty = res.data.faculty;
        if (!faculty) throw new Error("Invalid faculty data received.");

        const { first_name, middle_name, last_name } = faculty;

        Swal.fire({
            icon: "success",
            title: `Welcome ${last_name}, ${first_name} ${middle_name ? middle_name : ""}`.trim(),
            showConfirmButton: false,
            timer: 2000,
        });

        setTimeout(() => {
            navigate("/dashboard");
        }, 2000);

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
    <Container maxWidth="xs" sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Card elevation={3} sx={{ padding: 3, width: "100%", textAlign: "center" }}>
        <CardContent>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Welcome Back
          </Typography>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Please enter your credentials to sign in
          </Typography>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField 
              label="Email" 
              name="email" 
              fullWidth 
              margin="normal" 
              variant="outlined" 
              onChange={handleChange} 
            />
            <TextField 
              label="Password" 
              name="password" 
              type="password" 
              fullWidth 
              margin="normal" 
              variant="outlined" 
              onChange={handleChange} 
            />
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth 
              sx={{ mt: 2, py: 1.2 }}
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
