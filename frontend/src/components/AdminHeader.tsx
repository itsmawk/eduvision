import React from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import { Logout } from "@mui/icons-material";
import Swal from "sweetalert2";

const AdminHeader: React.FC = () => {
  const navigate = useNavigate();

  // Example: Fetch name from localStorage
  const loggedInName = localStorage.getItem("fullname") || "Admin";

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#9F2042",
      cancelButtonColor: "#7B0D1E",
      confirmButtonText: "Yes, log out",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/");
      }
    });
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: 1201, backgroundColor: "#7B0D1E" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, color: "#F8E5EE" }}>
          EduVision Panel
        </Typography>

        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="subtitle1" sx={{ color: "#F8E5EE" }}>
            Ako
          </Typography>
          <IconButton
            onClick={handleLogout}
            sx={{
              color: "#F8E5EE",
              "&:hover": {
                color: "#FFD7E8", // softer hover tone
              },
            }}
          >
            <Logout />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default AdminHeader;
