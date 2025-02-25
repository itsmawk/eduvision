import React from "react";
import { Typography } from "@mui/material";
import AdminMain from "../pages/AdminMain"; // Import the layout wrapper

const Dashboard: React.FC = () => {
  return (
    <AdminMain>
      <Typography variant="h4" fontWeight="bold" color="#333">
        Welcome to EduVision Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Manage faculty attendance and system settings here.
      </Typography>
    </AdminMain>
  );
};

export default Dashboard;
