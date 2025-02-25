import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, CssBaseline, Box, Toolbar } from "@mui/material";
import { Dashboard, People } from "@mui/icons-material";
import AdminHeader from "../components/AdminHeader";

const drawerWidth = 260;

const AdminMain: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePage, setActivePage] = useState(location.pathname);

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
    { text: "Faculty", icon: <People />, path: "/faculty" },
  ];

  const handleNavigate = (path: string) => {
    setActivePage(path);
    navigate(path);
  };

  return (
    <Box sx={{ display: "flex", backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      <CssBaseline />
      <AdminHeader />

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "#1e1e2d",
            color: "#ffffff",
          },
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.text}
              onClick={() => handleNavigate(item.path)}
              sx={{
                color: activePage === item.path ? "#1e88e5" : "#ffffff",
                backgroundColor: activePage === item.path ? "rgba(30,136,229,0.2)" : "transparent",
                borderRadius: "10px",
                mx: 2,
                my: 1,
                "&:hover": { backgroundColor: "rgba(30,136,229,0.3)" },
              }}
            >
              <ListItemIcon sx={{ color: activePage === item.path ? "#1e88e5" : "#ffffff" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children} {/* This will load the dashboard or other pages dynamically */}
      </Box>
    </Box>
  );
};

export default AdminMain;
