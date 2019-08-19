var Draw = {
    SMALL: 4,
    MEDIUM: 6,
    BIG: 8,

    canvas: null,
    canvasbg: null,
    ctx: null,
    draw: null,
    save: null,

    // MouseEvents for drawing
    drawing: false,
    mousePos: { x: 0, y: 0 },
    lastPos: this.mousePos,

    init: function (snapBackground) {
        Draw.draw = document.getElementById('draw');
        // Set up the canvas
        Draw.canvas = document.getElementById('draw-canvas');
        Draw.canvas.width = document.body.clientWidth;
        Draw.canvas.height = document.body.clientHeight;

        Draw.canvasbg = document.getElementById('draw-background');
        Draw.canvasbg.width = document.body.clientWidth;
        Draw.canvasbg.height = document.body.clientHeight;

        bgctx = Draw.canvasbg.getContext("2d");
        // fill canvas with white
        bgctx.fillStyle = "white";
        bgctx.fillRect(0, 0, Draw.canvasbg.width, Draw.canvasbg.height);
        if(snapBackground) {
            // copy over snap image
            bgctx.drawImage(Snap.canvas, 0, 0, Draw.canvasbg.width, Draw.canvasbg.width * Snap.canvas.height / Snap.canvas.width);
        }

        Draw.ctx = Draw.canvas.getContext('2d');
        Draw.ctx.strokeStyle = Draw.BLACK;
        Draw.ctx.lineWidth = Draw.MEDIUM;
        Draw.ctx.lineCap = 'round';

        // Get a regular interval for drawing to the screen
        window.requestAnimFrame = (function (callback) {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimaitonFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                };
        })();
        // Allow for animation
        (function drawLoop() {
            requestAnimFrame(drawLoop);
            Draw.renderCanvas();
        })();

        Draw.canvas.addEventListener('mousedown', Draw.startDrawing, true);
        Draw.canvas.addEventListener('mouseenter', Draw.startDrawing, false);
        Draw.canvas.addEventListener('mouseup', Draw.stopDrawing, false);
        Draw.canvas.addEventListener('mouseleave', Draw.stopDrawing, false);
        Draw.canvas.addEventListener('mousemove', function (e) {
            Draw.mousePos = Draw.getPos(Draw.canvas, e);
        }, false);

        // Set up touch events for mobile, etc
        Draw.canvas.addEventListener('touchstart', function (e) {
            Draw.mousePos = Draw.getPos(Draw.canvas, e);
            var touch = e.touches[0];
            var mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            Draw.canvas.dispatchEvent(mouseEvent);
        }, false);
        Draw.canvas.addEventListener('touchend', Draw.stopDrawing, false);
        Draw.canvas.addEventListener('touchmove', function (e) {
            var touch = e.touches[0];
            var mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            Draw.canvas.dispatchEvent(mouseEvent);
        }, false);

        document.body.addEventListener('touchstart', Draw.disableForCanvas, false);
        document.body.addEventListener('touchend', Draw.disableForCanvas, false);
        document.body.addEventListener('touchmove', Draw.disableForCanvas, false);

        // Clear canvas
        const clear = document.getElementById('draw-clear');
        clear.addEventListener('click', (e) => {
            const rect = Draw.canvas.getBoundingClientRect();
            Draw.ctx.clearRect(0, 0, rect.width, rect.height);
        }, false);

        // Save (background +) drawing
        Draw.save = document.getElementById('draw-save');
        Draw.save.onclick = (e) => {
            const rect = Draw.canvas.getBoundingClientRect();
            const finalCanvas = document.createElement('canvas');

            finalCanvas.setAttribute('width', rect.width);
            finalCanvas.setAttribute('height', rect.height);

            const bgimg = document.getElementById('draw-background');
            const finalctx = finalCanvas.getContext('2d');

            finalctx.drawImage(bgimg, 0, 0, rect.width, rect.height);
            finalctx.drawImage(Draw.canvas, 0, 0, rect.width, rect.height);

            finalCanvas.toBlob(
                function (blob) {
                    Upload.prepare(blob);
                    Upload.name = 'drawing.jpg';
                    Upload.init();
                },
                'image/jpeg',
                0.85
            );
        };

        // Use the eraser
        const eraser = document.querySelector('.draw-eraser');
        eraser.addEventListener('click', (e) => {
            Draw.ctx.globalCompositeOperation = 'destination-out';
            Draw.ctx.strokeStyle = 'rgba(0,0,0,1)';
        }, false);

        // Change pencil color
        const colors = document.querySelectorAll('.draw-colors li');
        for (let i = 0; i < colors.length; i++) {
            colors[i].addEventListener('click', function(e) {
                colors.forEach(item => item.classList.remove('selected'));
                this.classList.add('selected');

                Draw.ctx.globalCompositeOperation = 'source-over';
                Draw.ctx.strokeStyle = window.getComputedStyle(colors[i].querySelector('span.primary')).backgroundColor;
            });
        }

        // Change pencil thickness
        const widths = document.querySelectorAll('.draw-widths li');
        for (let i = 0; i < widths.length; i++) {
            widths[i].addEventListener('click', function(e) {
                widths.forEach(item => item.classList.remove('selected'));
                this.classList.add('selected');

                let width;
                switch (this.dataset.width) {
                    case 'small':
                        width = Draw.SMALL;
                        break;
                    case 'medium':
                        width = Draw.MEDIUM;
                        break;
                    case 'big':
                        width = Draw.BIG;
                        break;
                    default:
                        width = Draw.SMALL;
                }
                Draw.ctx.lineWidth = width;
            });
        }

        const drawback = document.querySelector('#draw #drawback');
        drawback.addEventListener('click', () => {
            Draw.draw.classList = '';
        });

        // When all is ready, show the panel
        Draw.draw.classList.add('init');
    },

    stopDrawing: function(e) {
        Draw.drawing = false;
        Draw.ctx.beginPath();
    },

    startDrawing: function(e) {
        if (e.buttons == 1) {
            Draw.drawing = true;
            Draw.lastPos = Draw.getPos(Draw.canvas, e);
        }
    },

    // Get the position of the mouse/touch relative to the canvas
    getPos: function(canvasDom, event) {
        var rect = canvasDom.getBoundingClientRect();
        let x, y;
        if (event.touches) {
            x = event.touches[0].clientX - rect.left;
            y = event.touches[0].clientY - rect.top;
        } else {
            x = event.clientX - rect.left;
            y = event.clientY - rect.top;
        }
        return { x, y };
    },

    // Draw to the canvas
    renderCanvas: function() {
        if (Draw.drawing) {
            Draw.ctx.moveTo(Draw.lastPos.x, Draw.lastPos.y);
            Draw.ctx.lineTo(Draw.mousePos.x, Draw.mousePos.y);
            Draw.ctx.stroke();
            Draw.lastPos = Draw.mousePos;
        }
    },

    disableForCanvas: function(e) {
        if (e.target.tagName == 'canvas') {
            e.preventDefault();
        }
    }
};

Upload.attach((file) => {
    if (Draw.draw) Draw.draw.classList = '';
    if (Draw.save) Draw.save.querySelector('span.primary').style.backgroundImage = '';
});

Upload.progress((percent) => {
    if (Draw.save) {
        Draw.save.querySelector('span.primary').style.backgroundImage
            = 'linear-gradient(to top, rgba(0, 0, 0, 0.5) ' + percent + '%, transparent ' + percent + '%)';
    }
});

Upload.fail(() => {
    if (Draw.draw) Draw.draw.classList = 'upload';
    if (Draw.save) Draw.save.querySelector('span.primary').style.backgroundImage = '';
});
