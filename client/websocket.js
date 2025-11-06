// client/websocket.js

// This 'socket' variable is created here and is globally accessible
const socket = io();

socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
});

// Listen for a single stroke from another user
socket.on('DRAW_STROKE', (strokeData) => {
    // 'drawStroke' is a function we create in main.js
    // We attach it to the 'window' object to make it globally accessible
    if (window.drawStroke) {
        window.drawStroke(strokeData);
    } else {
        console.error('drawStroke function not found!');
    }
});

// Listen for the entire history on join
socket.on('LOAD_HISTORY', (history) => {
    // 'clearCanvas' and 'drawStroke' are in main.js
    if (window.clearCanvas && window.drawStroke) {
        window.clearCanvas();
        for (const stroke of history) {
            window.drawStroke(stroke);
        }
    } else {
        console.error('clearCanvas or drawStroke function not found!');
    }
});