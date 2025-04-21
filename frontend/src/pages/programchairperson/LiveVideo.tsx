import React from "react";
import { Typography, Box } from "@mui/material";
import AdminMain from "./AdminMain";

const LiveVideo: React.FC = () => {
  return (
    <AdminMain>
      {/* Increased margin-bottom for spacing */}
      <Typography variant="h4" fontWeight="bold" color="#333" mb={4}>
        Live Face Recognition Feed
      </Typography>
      
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
          mt: 6, // Adds extra margin on top of the video box
        }}
      >
        <img
          src="http://localhost:5001/video_feed"
          alt="Live Video Stream"
          style={{
            width: "100%",
            maxWidth: "800px",
            borderRadius: "10px",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
          }}
        />
      </Box>
    </AdminMain>
  );
};

export default LiveVideo;
