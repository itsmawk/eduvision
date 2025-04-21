import React from "react";
import { Typography } from "@mui/material";
import DeanMain from "./DeanMain";

const Dashboard: React.FC = () => {
  return (
    <DeanMain>
      <Typography variant="h4" fontWeight="bold" color="#333">
        Welcome to EduVision Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Manage faculty attendance and system settings here.
      </Typography>
    </DeanMain>
  );
};

export default Dashboard;
