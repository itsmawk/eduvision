import React from "react";
import { Typography } from "@mui/material";
import AdminMain from "./AdminMain";

const FacultyInfo: React.FC = () => {
  return (
    <AdminMain>
      <Typography variant="h4" fontWeight="bold" color="#333">
        Welcome to Faculty Info
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Manage faculty attendance and system settings here.
      </Typography>
    </AdminMain>
  );
};

export default FacultyInfo;
