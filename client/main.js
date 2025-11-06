// Wait for the DOM to be fully loaded before running our script
window.addEventListener('load', () => {

    // --- 1. GET DOM ELEMENTS ---
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');

    // Toolbar controls
    const colorSwatches = document.querySelectorAll('.color-swatch');
    const strokeWidthSlider = document.getElementById('strokeWidth');
    const brushBtn = document.getElementById('brushBtn');
    const eraserBtn = document.getElementById('eraserBtn');
    
    // Note: Undo/Redo buttons are grabbed but will be implemented in a later phase
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    // --- 2. SET CANVAS & DRAWING STATE ---
    
    // Set canvas dimensions (fit to 80% of window)
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.7;

    // Drawing state variables
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    // Store the current color. We need this for the eraser.
    let currentColor = '#000000';
    const eraserColor = '#FFFFFF'; // This should match the canvas background

    // Set initial context properties
    ctx.strokeStyle = currentColor;
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round'; // Makes lines look smoother
    ctx.lineCap = 'round'; // Makes line ends look smoother

    // --- 3. DRAWING FUNCTIONS ---

    /**
     * Called on mousedown. Begins a new drawing path.
     */
    function startDrawing(e) {
        isDrawing = true;
        // Get the mouse position relative to the canvas
        [lastX, lastY] = [e.offsetX, e.offsetY];
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
    }

    /**
     * Called on mousemove. Draws a line from the last point to the current one.
     */
    function draw(e) {
        // Stop if not in "drawing" state (mouse button not pressed)
        if (!isDrawing) return;

        // Draw the line
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();

        // Update the last position
        [lastX, lastY] = [e.offsetX, e.offsetY];
    }

    /**
     * Called on mouseup or mouseleave. Stops the drawing.
     */
    function stopDrawing() {
        if (!isDrawing) return;
        ctx.closePath();
        isDrawing = false;
    }

    // --- 4. EVENT LISTENERS ---

    // Drawing listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing); // Stop drawing if mouse leaves canvas

    // --- 5. TOOLBAR LOGIC ---

    // Color swatch listener
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            // Set the new color
            currentColor = swatch.dataset.color;
            ctx.strokeStyle = currentColor;

            // Update active state for UI
            document.querySelector('.color-swatch.active').classList.remove('active');
            swatch.classList.add('active');
            
            // Make sure we're in "brush" mode
            ctx.strokeStyle = currentColor;
            brushBtn.classList.add('active');
            eraserBtn.classList.remove('active');
        });
    });

    // Stroke width slider
    strokeWidthSlider.addEventListener('input', (e) => {
        ctx.lineWidth = e.target.value;
    });

    // Brush button
    brushBtn.addEventListener('click', () => {
        ctx.strokeStyle = currentColor; // Set to the last selected color
        
        // Update UI
        brushBtn.classList.add('active');
        eraserBtn.classList.remove('active');
    });

    // Eraser button
    eraserBtn.addEventListener('click', () => {
        ctx.strokeStyle = eraserColor; // Set to the background color
        
        // Update UI
        eraserBtn.classList.add('active');
        brushBtn.classList.remove('active');
    });
    
    // Placeholder for Undo/Redo - these will be networked
    undoBtn.addEventListener('click', () => console.log('Undo clicked - not implemented yet!'));
    redoBtn.addEventListener('click', () => console.log('Redo clicked - not implemented yet!'));

});