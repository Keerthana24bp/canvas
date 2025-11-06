// client/websocket.js

// This connects to the server that is serving this file
// The 'io()' function is available because we will add the socket.io.js script
const socket = io();

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
});

// We will add listeners for drawing events here in Phase 3