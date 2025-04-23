import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  CssBaseline, Box, Toolbar, Typography, Divider, AppBar, IconButton
} from "@mui/material";
import {
  Dashboard, People, Videocam, CalendarToday, Assessment, Logout
} from "@mui/icons-material";
import Swal from "sweetalert2";

const drawerWidth = 260;

const AdminMain: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePage, setActivePage] = useState(location.pathname);

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

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/dashboard/:id" },
    { text: "Faculty Info", icon: <People />, path: "/faculty-info/:id" },
    { text: "Schedule", icon: <CalendarToday />, path: "/schedule/:id" },
    { text: "Live Video", icon: <Videocam />, path: "/live-video/:id" },
    { text: "Generate Reports", icon: <Assessment />, path: "/faculty-reports/:id" },
  ];

  const handleNavigate = (path: string) => {
    const facultyId = localStorage.getItem("userId");
    if (!facultyId) {
      console.error("No faculty ID found!");
      return;
    }
    const newPath = path.replace(":id", facultyId);
    setActivePage(newPath);
    navigate(newPath);
  };

  return (
    <Box sx={{ display: "flex", backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <CssBaseline />

      {/* Admin Header Inside AdminMain */}
      <AppBar position="fixed" sx={{ zIndex: 1201, backgroundColor: "#7B0D1E" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: "#F8E5EE" }}>
            EduVision Admin Panel
          </Typography>
          <IconButton
            onClick={handleLogout}
            sx={{
              color: "#F8E5EE",
              "&:hover": {
                color: "#FFD7E8",
              },
            }}
          >
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth - 130,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#3D1308",
            color: "#F8E5EE",
          },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => {
            const facultyId = localStorage.getItem("userId");
            const resolvedPath = item.path.replace(":id", facultyId || "");
            const isActive = activePage === resolvedPath;

            return (
              <React.Fragment key={item.text}>
                {item.text === "Faculty Info" && (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: "#F8E5EE",
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        ml: 3,
                        mt: 2,
                        mb: 1,
                        opacity: 0.7,
                      }}
                    >
                      Faculty
                    </Typography>
                    <Divider sx={{ backgroundColor: "#4F1A0F", mx: 2, mb: 1 }} />
                  </>
                )}

                <ListItemButton
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    color: "#F8E5EE",
                    backgroundColor: isActive ? "#7B0D1E" : "transparent",
                    borderRadius: "10px",
                    mx: 2,
                    my: 1,
                    borderRight: isActive ? "5px solid #F8E5EE" : "5px solid transparent",
                    "&:hover": {
                      backgroundColor: "#9F2042",
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: "#F8E5EE" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </React.Fragment>
            );
          })}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 1, mt: 4 }}>
        {children}
      </Box>
    </Box>
  );
};

export default AdminMain;
