import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { spawn } from 'child_process';
import http from 'http';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3002;

// Replace this with your actual RTSP stream URL from the Hikvision NVR
const rtspUrl = 'rtsp://admin:Eduvision124@192.168.8.116:554/Streaming/Channels/101';

wss.on('connection', (ws: WebSocket) => {
  console.log('WebSocket client connected');

  const ffmpeg = spawn('ffmpeg', [
    '-i', rtspUrl,
    '-f', 'image2pipe',
    '-q:v', '5',
    '-r', '5',
    '-update', '1',
    '-vcodec', 'mjpeg',
    '-'
  ]);

  ffmpeg.stdout.on('data', (chunk: Buffer) => {
    const base64Image = chunk.toString('base64');
    ws.send(`data:image/jpeg;base64,${base64Image}`);
  });

  ffmpeg.stderr.on('data', (data: Buffer) => {
    // Optional: uncomment for debugging
    // console.error('FFmpeg stderr:', data.toString());
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    ffmpeg.kill('SIGINT');
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket server running at ws://localhost:${PORT}`);
});
