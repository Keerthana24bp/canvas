// 1. Import necessary modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// 2. Import our drawing state manager
const state = require('./drawing-state');

// 3. Setup Express app and HTTP server
const app = express();
const server = http.createServer(app);

// 4. Initialize Socket.io
const io = socketIo(server);

// 5. Set up Express static middleware to serve client files
const clientPath = path.join(__dirname, '../client');
console.log(`Serving static files from: ${clientPath}`);
app.use(express.static(clientPath));

// 6. Handle WebSocket connections
io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    // Send the entire history to the new user
    socket.emit('LOAD_HISTORY', state.getHistory());

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });

    // Listen for a new stroke from a client
    socket.on('DRAW_STROKE', (strokeData) => {
        // Add the new stroke to our history
        state.addStroke(strokeData);
        
        // Broadcast this stroke to EVERYONE ELSE
        socket.broadcast.emit('DRAW_STROKE', strokeData);
    });

    // Handle Global Undo
    socket.on('UNDO', () => {
        // Call the undo function from our state manager
        state.undo();
        
        // Broadcast the *entire* updated history to ALL clients
        io.emit('LOAD_HISTORY', state.getHistory());
    });

    // Handle Global Redo
    socket.on('REDO', () => {
        // Call the redo function
        state.redo();
        
        // Broadcast the *entire* updated history to ALL clients
        io.emit('LOAD_HISTORY', state.getHistory());
    });
});

// 7. Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});