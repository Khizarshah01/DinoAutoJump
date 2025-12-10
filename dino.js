(function() {
    console.log("%c DINO AUTOMATION JUMP ", "background: #222; color: #bada55; font-size: 14px; padding: 5px; border-radius: 5px;");

    const CONFIG = {
        width: '40px',
        height: '40px',
        startTop: '210px',
        startLeft: '120px',
        
        colorSafe: 'rgba(0, 255, 0, 0.2)',   
        borderSafe: '2px solid #00FF00',     
        
        colorActive: 'rgba(255, 0, 0, 0.2)', 
        borderActive: '2px solid #FF0000',   
        
        pixelThreshold: 100 
    };

    const sensor = document.createElement('div');
    sensor.id = 'pro-sensor-v1';

  Object.assign(sensor.style, {
        position: 'absolute',
        width: CONFIG.width,
        height: CONFIG.height,
        backgroundColor: CONFIG.colorSafe,
        border: CONFIG.borderSafe,
        zIndex: '999999',
        cursor: 'move',
        top: CONFIG.startTop,
        left: CONFIG.startLeft,
        borderRadius: '4px',
        boxSizing: 'border-box'
    });

    document.body.appendChild(sensor);

    let drag = { active: false, x: 0, y: 0 };

    sensor.addEventListener('mousedown', (e) => {
        drag.active = true;
        const rect = sensor.getBoundingClientRect();
        drag.x = e.clientX - rect.left;
        drag.y = e.clientY - rect.top;
        sensor.style.cursor = 'grabbing';
        sensor.style.transition = 'none'; 
    });

    document.addEventListener('mousemove', (e) => {
        if (!drag.active) return;
        sensor.style.left = (e.clientX - drag.x) + 'px';
        sensor.style.top = (e.clientY - drag.y) + 'px';
    });

    document.addEventListener('mouseup', () => {
        drag.active = false;
        sensor.style.cursor = 'move';
    });

    // core logic
    const canvas = document.querySelector('.runner-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;

    function triggerJump() {
        // Dispatch keydown
        document.body.dispatchEvent(new KeyboardEvent('keydown', {
            key: ' ',
            code: 'Space',
            keyCode: 32,
            bubbles: true,
            cancelable: true
        }));
        setTimeout(() => {
            document.body.dispatchEvent(new KeyboardEvent('keyup', {
                key: ' ',
                code: 'Space',
                keyCode: 32,
                bubbles: true,
                cancelable: true
            }));
        }, 20); 
  }

    function gameLoop() {
        requestAnimationFrame(gameLoop);

        if (!canvas || !ctx) return;

        // Coordinate Mapping
        const sensorRect = sensor.getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        // Calculate relative coordinates
        const x = (sensorRect.left - canvasRect.left) * (canvas.width / canvasRect.width);
        const y = (sensorRect.top - canvasRect.top) * (canvas.height / canvasRect.height);
        const w = sensorRect.width * (canvas.width / canvasRect.width);
        const h = sensorRect.height * (canvas.height / canvasRect.height);

        if (x < 0 || y < 0) return;

        try {
            // Pixel Scanning
            const frame = ctx.getImageData(x, y, w, h);
            const data = frame.data;
            let detected = false;

      for (let i = 0; i < data.length; i += 4) {
                if (data[i] < CONFIG.pixelThreshold && 
                    data[i+1] < CONFIG.pixelThreshold && 
                    data[i+2] < CONFIG.pixelThreshold &&
                    data[i+3] > 0) { 
                    detected = true;
                    break;
                }
            }

            // State Updates
            if (detected) {
                sensor.style.border = CONFIG.borderActive;
                sensor.style.backgroundColor = CONFIG.colorActive;
                triggerJump();
            } else {
                sensor.style.border = CONFIG.borderSafe;
                sensor.style.backgroundColor = CONFIG.colorSafe;
            }

        } catch (e) {
        }
    }

    // Start Engine
    gameLoop();

})();
