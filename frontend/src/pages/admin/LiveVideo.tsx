import React, { useEffect, useRef, useState } from "react";
import { Typography, Box, Button } from "@mui/material";
import AdminMain from "./AdminMain";

const LiveVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <AdminMain>
      <Typography variant="h4" fontWeight="bold" color="#333" mb={2}>
        Live Video Feed
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", height: "70vh" }}>
        <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxWidth: "800px", borderRadius: "10px", boxShadow: "0px 4px 10px rgba(0,0,0,0.2)" }} />
        <Box mt={2}>
          {!isCameraOn ? (
            <Button variant="contained" color="primary" onClick={startCamera}>
              Turn On Camera
            </Button>
          ) : (
            <Button variant="contained" color="secondary" onClick={stopCamera}>
              Turn Off Camera
            </Button>
          )}
        </Box>
      </Box>
    </AdminMain>
  );
};

export default LiveVideo;