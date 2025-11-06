// client/main.js

// Wait for the DOM to be fully loaded
window.addEventListener('load', () => {

    // --- 1. GET DOM ELEMENTS ---
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');

    // Toolbar controls
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const strokeWidthSlider = document.getElementById('strokeWidth');
    const brushBtn = document.getElementById('brushBtn');
    const eraserBtn = document.getElementById('eraserBtn');
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    // --- 2. SET CANVAS & DRAWING STATE ---
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.7;

    // Drawing state variables
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentColor = '#000000';
    const eraserColor = '#FFFFFF'; // Must match canvas background

    // Stroke buffering
    let currentStrokePoints = [];

    // Set initial context properties
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // --- 3. DRAWING FUNCTIONS (LOCAL) ---

    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = [e.offsetX, e.offsetY];

        // Start buffering points
        currentStrokePoints = [{ x: lastX, y: lastY }];
        
        // Draw locally
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
    }

    function draw(e) {
        if (!isDrawing) return;

        // Add point to buffer
        currentStrokePoints.push({ x: e.offsetX, y: e.offsetY });

        // Draw locally for a smooth feel
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();

        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    function stopDrawing() {
        if (!isDrawing) return;
        ctx.closePath();
        isDrawing = false;

        // Send the completed stroke to the server
        if (currentStrokePoints.length > 1) {
            const strokeData = {
                id: `${socket.id}-${Date.now()}`,
                points: currentStrokePoints,
                color: ctx.strokeStyle,
                width: ctx.lineWidth
            };
            
            // 'socket' is from websocket.js
            socket.emit('DRAW_STROKE', strokeData);
        }
        
        // Clear the local buffer
        currentStrokePoints = [];
    }

    // --- 4. HELPER FUNCTIONS (FOR NETWORK) ---
    // Attached to 'window' so websocket.js can call them

    window.clearCanvas = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    window.drawStroke = (stroke) => {
        if (!stroke || !stroke.points || stroke.points.length === 0) return;

        ctx.beginPath();
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
        ctx.closePath();
    };

    // --- 5. LOCAL DRAWING LISTENERS ---
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    // --- 6. TOOLBAR LOGIC ---
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            currentColor = swatch.dataset.color;
            ctx.strokeStyle = currentColor;
            document.querySelector('.color-swatch.active').classList.remove('active');
            swatch.classList.add('active');
            brushBtn.classList.add('active');
            eraserBtn.classList.remove('active');
        });
    });

    strokeWidthSlider.addEventListener('input', (e) => {
        ctx.lineWidth = e.target.value;
    });

    brushBtn.addEventListener('click', () => {
        ctx.strokeStyle = currentColor;
        brushBtn.classList.add('active');
        eraserBtn.classList.remove('active');
    });

    eraserBtn.addEventListener('click', (e) => {
        ctx.strokeStyle = eraserColor;
        eraserBtn.classList.add('active');
        brushBtn.classList.remove('active');
    });

    // --- 7. GLOBAL UNDO/REDO LISTENERS ---
    undoBtn.addEventListener('click', () => {
        socket.emit('UNDO');
    });

    redoBtn.addEventListener('click', () => {
        socket.emit('REDO');
    });
});