import asyncio
import cv2
import logging
import numpy as np
import json
import requests
from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription, VideoStreamTrack
from av import VideoFrame

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("webrtc")

# Constants
RTSP_URL = "rtsp://tapoadmin:tapo1234@192.168.110.225:554/stream1"
WEB_PORT = 8081
AMS_SERVER_URL = "http://localhost:5080/WebRTCApp/webRTCClient" # Update this with your AMS server URL
# Global state
connections = set()

# RTSP Video Stream
class RTSPVideoTrack(VideoStreamTrack):
    """
    A video track that returns frames from an RTSP stream
    """
    kind = "video"  # Explicitly set the track kind
    
    def __init__(self):
        super().__init__()  # Initialize the parent class
        self.cap = cv2.VideoCapture(RTSP_URL)
        self.frame_count = 0
        if not self.cap.isOpened():
            logger.error(f"Failed to open RTSP stream: {RTSP_URL}")
            # Initialize with a black frame if can't connect
            self.black_frame = np.zeros((480, 640, 3), dtype=np.uint8)
        else:
            logger.info("RTSP stream initialized successfully")
            # Read a frame to get dimensions
            success, frame = self.cap.read()
            if success:
                self.last_frame = frame
            else:
                self.last_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    
    async def recv(self):
        # Get frame timestamp
        pts, time_base = await self.next_timestamp()
        
        # If camera is connected, try to read a frame
        if self.cap and self.cap.isOpened():
            success, frame = self.cap.read()
            if success:
                self.last_frame = frame
            else:
                # If read failed but we were previously connected
                logger.warning("Failed to read frame, attempting to reconnect...")
                self.cap.release()
                self.cap = cv2.VideoCapture(RTSP_URL)
                if not self.cap.isOpened():
                    logger.error("Failed to reconnect to RTSP stream")
                    # Use the last successful frame or black frame
                    frame = self.last_frame
                else:
                    success, frame = self.cap.read()
                    if success:
                        self.last_frame = frame
                    else:
                        frame = self.last_frame
        else:
            # Not connected, use the last frame or black frame
            frame = self.last_frame
            
            # Try to reconnect periodically
            if self.frame_count % 30 == 0:  # Try every ~1 second (30 frames)
                logger.info("Attempting to connect to RTSP stream...")
                self.cap = cv2.VideoCapture(RTSP_URL)
        
        # Convert frame format for WebRTC
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        video_frame = VideoFrame.from_ndarray(rgb_frame, format="rgb24")
        video_frame.pts = pts
        video_frame.time_base = time_base
        
        # Log occasionally
        self.frame_count += 1
        if self.frame_count % 100 == 0:
            logger.info(f"Processed {self.frame_count} frames")
            
        return video_frame

# Routes
async def index(request):
    return web.Response(content_type="text/html", text="""
<html>
  <head>
    <title>RTSP WebRTC Stream</title>
    <style>
      body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
      video { max-width: 100%; border: 1px solid #ccc; border-radius: 4px; }
      .status { margin-top: 10px; font-style: italic; color: #666; }
    </style>
  </head>
  <body>
    <h1>RTSP Stream</h1>
    <video id="video" autoplay playsinline controls></video>
    <div class="status" id="status">Connecting to stream...</div>
    <script>
      const statusElem = document.getElementById("status");
      
      async function start() {
        try {
          statusElem.textContent = "Creating connection...";
          const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
          });
          
          pc.oniceconnectionstatechange = () => {
            statusElem.textContent = "ICE connection state: " + pc.iceConnectionState;
          };
          
          pc.ontrack = (event) => {
            statusElem.textContent = "Stream connected!";
            document.getElementById("video").srcObject = event.streams[0];
          };
          
          statusElem.textContent = "Sending offer...";
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          
          const res = await fetch("/offer", {
            method: "POST",
            body: JSON.stringify({ sdp: pc.localDescription.sdp, type: pc.localDescription.type }),
            headers: { "Content-Type": "application/json" },
          });
          
          if (!res.ok) {
            throw new Error(`Server responded with ${res.status}: ${await res.text()}`);
          }
          
          const answer = await res.json();
          statusElem.textContent = "Setting remote description...";
          await pc.setRemoteDescription(answer);
          statusElem.textContent = "Connection established, waiting for video...";
        } catch (err) {
          statusElem.textContent = "Error: " + err.message;
          console.error("Connection failed:", err);
        }
      }
      
      start();
    </script>
  </body>
</html>
""")

async def offer_handler(request):
    try:
        params = await request.json()
        
        # Forward the offer to the Ant Media Server
        response = requests.post(
            f"{AMS_SERVER_URL}/offer",
            data=json.dumps({
                "sdp": params["sdp"],
                "type": params["type"],
                "streamId": "rtsp-stream",
                "video": True,
                "audio": False
            }),
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code != 200:
            return web.Response(status=response.status_code, text=f"AMS Error: {response.text}")
        
        # Return the AMS response to the client
        return web.json_response(response.json())
    
    except Exception as e:
        logger.error(f"Error in offer handler: {str(e)}", exc_info=True)
        return web.Response(status=500, text=str(e))

# Clean up resources on shutdown
async def on_shutdown(app):
    logger.info("Shutting down connections...")
    # Close all peer connections
    coros = [pc.close() for pc in connections]
    await asyncio.gather(*coros)
    connections.clear()
    logger.info("All connections closed")

# App startup
async def init_app():
    app = web.Application()
    app.add_routes([web.get("/", index), web.post("/offer", offer_handler)])
    app.on_shutdown.append(on_shutdown)
    return app

if __name__ == "__main__":
    logger.info(f"Starting WebRTC server at http://localhost:{WEB_PORT}")
    web_app = web.Application()
    web_app.add_routes([web.get("/", index), web.post("/offer", offer_handler)])
    web_app.on_shutdown.append(on_shutdown)
    web.run_app(web_app, port=WEB_PORT)