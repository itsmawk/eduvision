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
<<<<<<< HEAD
      const res = await axios.post("http://localhost:5000/api/auth/login", credentials);
=======
      const res = await axios.post("http://localhost:5000/api/loginsignup/login", credentials);
      const { token, user, requiresUpdate, requiresCompletion } = res.data;
>>>>>>> 6d424866abecb76ae57bd22063767d8cf80f0064

      const { token, user, requiresUpdate } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user.id);
      localStorage.setItem("course", user.course);
      localStorage.setItem("college", user.college.code);

      Swal.fire({
        icon: "success",
        title: `Welcome ${user.last_name}, ${user.first_name} ${user.middle_name ? user.middle_name : ""}`.trim(),
        showConfirmButton: false,
        timer: 2000,
      });

      if (requiresUpdate) {
        navigate(`/update-credentials/${user.id}`);
      } else if (requiresCompletion) {
        navigate(`/requires-completion/${user.id}`);
      }else if (user.role?.toLowerCase() === "superadmin") {
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
<<<<<<< HEAD
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
=======

              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.div
                    key="login-left"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.4 }}
                    style={{ 
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      gap: "24px",
                    }}
                  >
                    <img
                      src="/EduVisionLogo.png"
                      alt="EduVision Logo"
                      style={{
                        height: 140,
                        objectFit: "contain",
                        borderRadius: 40,
                      }}
                    />
                    
                    <Typography variant="h5" sx={{ color: "white" }}>
                      Join us and manage your faculty schedules efficiently.
                    </Typography>
                  </motion.div>


                ) : (
                  <motion.div
                    key="signup-left"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="h4" fontWeight="bold">
                        Sign Up
                      </Typography>
                      <Typography variant="body2" color="gray" sx={{ mb: 1 }}>
                        Create your account here.
                      </Typography>

                      <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        sx={{ mb: 3 }}
                      >
                        <Avatar
                          src={preview || ""}
                          alt="Profile"
                          sx={{ width: 80, height: 80, mb: 1.5 }}
                        />
                        <input
                          accept="image/*"
                          id="upload-photo"
                          type="file"
                          style={{ display: "none" }}
                          onChange={handleImageChange}
                        />
                        <label htmlFor="upload-photo">
                          <IconButton
                            color="primary"
                            aria-label="upload picture"
                            component="span"
                            sx={{
                              backgroundColor: "#e0e0e0",
                              ":hover": { backgroundColor: "#d0d0d0" },
                              px: 2,
                              py: 1,
                              borderRadius: 2,
                              fontSize: 14,
                            }}
                          >
                            <PhotoCamera sx={{ mr: 1 }} />
                            Upload Photo
                          </IconButton>
                        </label>
                      </Box>

                      <TextField
                        label="Email"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <TextField
                        select
                        label="Role"
                        fullWidth
                        sx={{ mb: 2 }}
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <MenuItem value="dean">Dean</MenuItem>
                        <MenuItem value="programchairperson">Program Chairperson</MenuItem>
                        <MenuItem value="instructor">Instructor</MenuItem>
                      </TextField>
                      <Box display="flex" gap={2} sx={{ mb: 1 }}>
                        <FormControl fullWidth sx={{ mb: 1 }}>
                          <InputLabel id="college-select-label">Department</InputLabel>
                          <Select
                            labelId="college-select-label"
                            value={selectedCollegeCode}
                            label="Department"
                            onChange={(e) => {
                              const code = e.target.value;
                              setSelectedCollegeCode(code);
                              setSelectedProgram("");
                              handleCollegeChange(code);
                            }}
                            renderValue={(selected) => selected}
                          >
                            {colleges.map((college) => (
                              <MenuItem key={college._id} value={college.code}>
                                ({college.code}) - {college.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 1 }}>
                          <InputLabel id="program-select-label">Program</InputLabel>
                          <Select
                            labelId="program-select-label"
                            value={selectedProgram}
                            label="Program"
                            onChange={(e) => setSelectedProgram(e.target.value.toLowerCase())}
                            renderValue={(selected) => selected.toUpperCase()}
                            disabled={role === "dean" || programs.length === 0}
                          >
                            {programs.map((program) => (
                              <MenuItem key={program._id} value={program.code.toLowerCase()}>
                                ({program.code.toUpperCase()}) {program.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSignUp}
                        sx={{
                          py: 1.2,
                          backgroundColor: "#5a0000",
                          '&:hover': { backgroundColor: "#730000" },
                          mb: 1,
                        }}
                      >
                        Sign Up
                      </Button>

                      <Typography variant="body2" sx={{ color: "black" }}>
                        Already have an account?{" "}
                        <Typography
                          component="span"
                          onClick={() => setIsLogin(true)}
                          sx={{
                            color: "#5a0000",
                            textTransform: "none",
                            cursor: "pointer",
                            display: "inline",
                            position: "relative",
                            "&::after": {
                              content: '""',
                              position: "absolute",
                              width: "0%",
                              height: "2px",
                              left: 0,
                              bottom: 0,
                              backgroundColor: "#5a0000",
                              transition: "width 0.3s ease",
                            },
                            "&:hover::after": {
                              width: "100%",
                            },
                          }}
                        >
                          Login
                        </Typography>
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>

            </Grid>

            {/* RIGHT PANEL */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                background: isLogin
                  ? "linear-gradient(135deg, #f0e3d8, #ECDCBF)"
                  : "linear-gradient(135deg, #660708, #A4161A)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: 4,
                color: isLogin ? "#333" : "white",
                minHeight: { xs: 500, md: 600 },
              }}
            >
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.div
                    key="login-right"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Box width="100%" maxWidth={350}>
                      <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Log In
                      </Typography>
                      <Typography variant="body2" color="gray" gutterBottom>
                        Please enter your credentials to sign in
                      </Typography>
                      <TextField
                        label="Email or Username"
                        name="usernameOrEmail"
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        onChange={handleChange}
                        InputLabelProps={{ style: { color: "black" } }}
                        InputProps={{ style: { color: "black" } }}
                        sx={{ mt: 2 }}
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
                        InputProps={{ style: { color: "black" } }}
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
                      <Typography variant="body2" sx={{ mt: 2, color: "black" }}>
                        Don't have an account?{" "}
                        <Typography
                          component="span"
                          onClick={() => setIsLogin(false)}
                          sx={{
                            color: "#5a0000",
                            textTransform: "none",
                            cursor: "pointer",
                            display: "inline",
                            position: "relative",
                            "&::after": {
                              content: '""',
                              position: "absolute",
                              width: "0%",
                              height: "2px",
                              left: 0,
                              bottom: 0,
                              backgroundColor: "#5a0000",
                              transition: "width 0.3s ease",
                            },
                            "&:hover::after": {
                              width: "100%",
                            },
                          }}
                        >
                          Sign up
                        </Typography>
                      </Typography>
                    </Box>
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup-right"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box
                      sx={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        px: 2,
                      }}
                    >
                      <img
                        src="/EduVisionLogo.png"
                        alt="EduVision Logo"
                        style={{
                          height: 140,
                          objectFit: "contain",
                          borderRadius: 40,
                        }}
                      />
                      <Typography 
                        variant="h5" 
                        sx={{ color: "white", mt: 3, textAlign: "center" }}
                      >
                        Connect, manage, and track with confidence.
                      </Typography>
                    </Box>

                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      sx={{ mb: 3 }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ color: "white", fontSize: "0.8rem" }}
                      >
                        Do you want to check the status of your account?{" "}
                        <Button
                          variant="text"
                          onClick={handleCheckAccountStatus}
                          sx={{
                            color: "white",
                            padding: 0,
                            minWidth: "unset",
                            textTransform: "none",
                            fontWeight: "inherit",
                            fontFamily: "inherit",
                            fontSize: "inherit",
                            lineHeight: "inherit",
                            borderBottom: "2px solid white",
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "transparent",
                              borderBottom: "2px solid white",
                            },
                          }}
                        >
                          Click here
                        </Button>
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </AnimatePresence>
            </Grid>
          </Grid>
        </Card>
      </Container>
    </Box>
>>>>>>> 6d424866abecb76ae57bd22063767d8cf80f0064
  );
}
