import React from "react";
import { Typography } from "@mui/material";
import UserMain from "./UserMain";

const Dashboard: React.FC = () => {
  return (
    <UserMain>
      <Typography variant="h4" fontWeight="bold" color="#333">
        Welcome to Faculty EduVision Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Manage faculty attendance and system settings here.
      </Typography>
    </UserMain>
  );
};

export default Dashboard;
