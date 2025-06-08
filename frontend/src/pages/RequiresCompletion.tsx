import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const RequiresCompletion: React.FC = () => {
  const navigate = useNavigate();

  const handleProceed = () => {
    navigate("/complete-profile"); // <-- Change this path to your actual profile completion page
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="#f5f5f5"
    >
      <Paper elevation={4} sx={{ p: 4, textAlign: "center", maxWidth: 400 }}>
        <CheckCircleIcon sx={{ fontSize: 60, color: "#4caf50" }} />
        <Typography variant="h5" fontWeight="bold" mt={2}>
          Account Approved
        </Typography>
        <Typography variant="body1" mt={1}>
          Your account has been approved. To complete your registration, please fill out your profile information.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          onClick={handleProceed}
        >
          Complete Profile
        </Button>
      </Paper>
    </Box>
  );
};

export default RequiresCompletion;
