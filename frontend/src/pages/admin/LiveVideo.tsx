import React, { useEffect, useRef } from "react";
import { Typography, Box } from "@mui/material";
import AdminMain from "./AdminMain";

const LiveVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <AdminMain>
      <Typography variant="h4" fontWeight="bold" color="#333" mb={2}>
        Live Video Feed
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
        <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxWidth: "800px", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0,0,0,0.2)" }} />
      </Box>
    </AdminMain>
  );
};

export default LiveVideo;
