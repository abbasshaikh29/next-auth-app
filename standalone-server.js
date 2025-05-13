const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const next = require('next');
const cors = require('cors');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const expressApp = express();
  const server = http.createServer(expressApp);
  
  // Set up CORS
  expressApp.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: false
  }));

  // Initialize Socket.io
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: false
    },
    transports: ['polling', 'websocket'],
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000,
    allowEIO3: true
  });

  // Socket.io connection handler
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join a post room to receive updates for that post
    socket.on('join-post', (postId) => {
      socket.join(`post:${postId}`);
      console.log(`Socket ${socket.id} joined post:${postId}`);
    });

    // Leave a post room
    socket.on('leave-post', (postId) => {
      socket.leave(`post:${postId}`);
      console.log(`Socket ${socket.id} left post:${postId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Make io accessible to our API routes
  expressApp.use((req, res, next) => {
    req.io = io;
    next();
  });

  // Export io for use in API routes
  global.io = io;

  // Handle all other routes with Next.js
  expressApp.all('*', (req, res) => {
    return handle(req, res);
  });

  // Start the server
  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> Socket.io server running on port ${port}`);
  });
});
