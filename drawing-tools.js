module.exports = `
<style>
  /* === UI === */
  #mps-footer { position: fixed; bottom: 0; left: 0; width: 100%; height: 60px; background: #2c3e50; display: flex; align-items: center; justify-content: center; z-index: 9999; gap: 10px; font-family: sans-serif; border-top: 2px solid #34495e; }
  .mps-btn { background: #3498db; color: white; border: none; padding: 0 14px; cursor: pointer; border-radius: 8px; font-weight: bold; font-size: 14px; transition: transform 0.1s; height: 40px; display: flex; align-items: center; justify-content: center;}
  .mps-btn:active { transform: scale(0.95); }
  .mps-drop-btn { min-width: 80px; justify-content: space-between; }
  
  /* CANVAS LAYER - iOS OPTIMIZED */
  .mps-canvas-layer { 
      position: absolute; top: 0; left: 0; 
      width: 100%; height: 100%; 
      z-index: 1; 
      
      /* Entscheidend für iPad: Deaktiviert ALLE Browser-Gesten auf dem Canvas */
      touch-action: none !important; 
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
      
      /* Lässt Klicks durch, wenn kein Tool aktiv ist (wird per JS gesteuert) */
      pointer-events: none; 
  }
  
  /* Icons & Popovers */
  .mps-tool { width: 40px; padding: 0; border-radius: 50%; border: 3px solid transparent; font-size: 18px; }
  .mps-tool.active { border-color: white; box-shadow: 0 0 8px rgba(255,255,255,0.6); transform: scale(1.1); }
  
  .mps-popover { position: absolute; bottom: 70px; background: #1f2a36; border: 2px solid #34495e; border-radius: 10px; padding: 8px; display: none; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
  .mps-popover button { background: #3498db; color: white; border: none; border-radius: 6px; padding: 6px 12px; font-weight: bold; cursor: pointer; font-size: 12px; }
  .mps-popover button:hover { background: #2980b9; }

  /* Timer */
  #mps-timer-widget {
      position: fixed; top: 20px; right: 20px;
      background: rgba(31, 42, 54, 0.95); border: 2px solid #3498db;
      border-radius: 12px; padding: 10px 15px;
      display: none; flex-direction: column; align-items: center; gap: 5px;
      z-index: 9999; box-shadow: 0 8px 20px rgba(0,0,0,0.4);
      min-width: 140px; pointer-events: auto;
  }
  #mps-timer-display { font-family: 'Courier New', monospace; font-size: 32px; font-weight: bold; color: #fff; text-align: center; letter-spacing: 2px; }
  .mps-timer-controls { display: flex; gap: 8px; margin-top: 5px; }
  .mps-timer-btn { background: #34495e; color: #fff; border: 1px solid #555; border-radius: 4px; padding: 4px 10px; cursor: pointer; font-size: 12px; }
  .mps-timer-btn:hover { background: #3498db; }
  .mps-timer-finished { color: #e74c3c !important; animation: blink 1s infinite; }
  @keyframes blink { 50% { opacity: 0.5; } }

  .btn-blk { background: #2c3e50; }
  .btn-red { background: #e74c3c; }
  .btn-grn { background: #27ae60; }
  .btn-era { background: #ecf0f1; color: #333; }
  .btn-clr { background: #c0392b; }
  
  @media print { #mps-footer, .mps-canvas-layer, #mps-timer-widget { display: none !important; } }
</style>

<div id="mps-timer-widget">
  <div id="mps-timer-display">00:00</div>
  <div class="mps-timer-controls">
      <button class="mps-timer-btn" id="btn-timer-toggle" onclick="timerToggle()">⏸</button>
      <button class="mps-timer-btn" onclick="timerReset()">↺</button>
      <button class="mps-timer-btn" onclick="timerAdd(1)">+1m</button>
  </div>
</div>

<div id="mps-footer">
  <button class="mps-btn" onclick="document.dispatchEvent(new KeyboardEvent('keydown',{'key':'ArrowLeft'}))">←</button>
  <button class="mps-btn" onclick="document.dispatchEvent(new KeyboardEvent('keydown',{'key':'ArrowRight'}))">→</button>
  <div style="width:15px"></div>
  
  <button class="mps-btn mps-tool btn-blk" onclick="setMpsTool('black')">✏️</button>
  <button class="mps-btn mps-tool btn-red" onclick="setMpsTool('red')">✏️</button>
  <button class="mps-btn mps-tool btn-grn" onclick="setMpsTool('green')">✏️</button>
  
  <div style="position: relative;">
      <button class="mps-btn mps-drop-btn" id="btn-pen-size" onclick="toggleMenu('menu-pen-size')">Size ▾</button>
      <div id="menu-pen-size" class="mps-popover">
          <button onclick="setPenWidth(2)">Small</button>
          <button onclick="setPenWidth(5)">Medium</button>
          <button onclick="setPenWidth(9)">Large</button>
          <button onclick="setPenWidth(14)">Huge</button>
      </div>
  </div>

  <div style="width:10px"></div>
  <button class="mps-btn mps-tool btn-era" onclick="setMpsTool('eraser')">🧽</button>
  <div style="position: relative;">
      <button class="mps-btn mps-drop-btn" id="btn-era-size" onclick="toggleMenu('menu-era-size')">Size ▾</button>
      <div id="menu-era-size" class="mps-popover">
          <button onclick="setEraserWidth(15)">Small</button>
          <button onclick="setEraserWidth(30)">Medium</button>
          <button onclick="setEraserWidth(50)">Large</button>
          <button onclick="setEraserWidth(80)">Huge</button>
      </div>
  </div>

  <button class="mps-btn btn-clr" onclick="clearVisibleSlide()">🗑️</button>
  <div style="width:15px"></div>
  <button class="mps-btn" onclick="toggleMpsFS()">⛶</button>
</div>

<script>
(() => {
  let currentTool = 'none';
  // Wir speichern die ID des Pointers, der gerade malt (für Multitouch-Handling)
  let activePointerId = null; 
  
  let penWidth = 5;
  let eraserWidth = 30;

  // --- INIT ---
  const initCanvases = () => {
    document.querySelectorAll('section').forEach((sec, index) => {
      if (sec.querySelector('.mps-canvas-layer')) return;
      sec.style.position = 'relative'; 
      const c = document.createElement('canvas');
      c.className = 'mps-canvas-layer';
      c.id = 'canvas-slide-' + (index + 1);
      attachEvents(c);
      sec.appendChild(c);
      resizeCanvas(c);
    });
    setTimeout(checkTimer, 200); 
  };

  // --- RESIZE LOGIC (Pixel-Perfect) ---
  const resizeCanvas = (c) => {
    const rect = c.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    // Interne Puffergröße (High DPI)
    c.width = Math.round(rect.width * dpr);
    c.height = Math.round(rect.height * dpr);
    // CSS Anzeigegröße
    c.style.width = rect.width + 'px';
    c.style.height = rect.height + 'px';
  };
  
  window.addEventListener('resize', () => {
    document.querySelectorAll('.mps-canvas-layer').forEach(c => resizeCanvas(c));
  });

  // --- KOORDINATEN (Raw & Robust) ---
  const getPos = (c, e) => {
    const rect = c.getBoundingClientRect();
    const scaleX = c.width / rect.width;
    const scaleY = c.height / rect.height;
    return { 
      x: (e.clientX - rect.left) * scaleX, 
      y: (e.clientY - rect.top) * scaleY 
    };
  };

  const attachEvents = (c) => {
    const ctx = c.getContext('2d');
    
    // START: Stift setzt auf
    const start = (e) => {
      if (currentTool === 'none') return;
      
      // iPad-Fix: Verhindert sofort Scrolling/Zooming/Texmarkierung
      e.preventDefault();
      e.stopPropagation();

      // Wenn wir schon malen, ignorieren wir weitere Finger (Handballen)
      if (activePointerId !== null) return;
      
      activePointerId = e.pointerId;
      
      // Pointer Capture sorgt dafür, dass wir Events bekommen, 
      // auch wenn der Stift das Canvas-Element verlässt
      try { c.setPointerCapture(e.pointerId); } catch(err){}
      
      const p = getPos(c, e);
      ctx.beginPath(); 
      ctx.moveTo(p.x, p.y);
    };
    
    // MOVE: Stift bewegt sich
    const move = (e) => {
      if (currentTool === 'none') return;
      
      // Wir reagieren nur auf den Stift, der gestartet hat
      if (activePointerId !== e.pointerId) return;

      e.preventDefault();
      e.stopPropagation();
      
      const p = getPos(c, e);
      
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      
      // Dynamische Dicke berechnen (wg. Retina Skalierung)
      const scaleFactor = c.width / c.getBoundingClientRect().width;
      ctx.lineWidth = (currentTool === 'eraser' ? eraserWidth : penWidth) * scaleFactor;
      
      ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
      ctx.strokeStyle = currentTool === 'black' ? '#2c3e50' : currentTool;
      
      ctx.lineTo(p.x, p.y); 
      ctx.stroke();
    };
    
    // END: Stift hebt ab
    const end = (e) => { 
        if (activePointerId === e.pointerId) {
            e.preventDefault();
            e.stopPropagation();
            activePointerId = null;
            try { c.releasePointerCapture(e.pointerId); } catch(err){}
        }
    };
    
    // Listener für moderne Pointer Events (deckt Maus, Touch, Pencil ab)
    c.addEventListener('pointerdown', start); 
    c.addEventListener('pointermove', move);
    c.addEventListener('pointerup', end); 
    c.addEventListener('pointercancel', end);
    c.addEventListener('pointerout', end);
    
    // "Ghost Click" Killer: Verhindert Blättern nach dem Zeichnen
    c.addEventListener('click', (e) => {
        if(currentTool !== 'none') {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);
  };

  // --- TOOLBAR LOGIC ---
  window.setMpsTool = (t) => {
    currentTool = t;
    document.querySelectorAll('.mps-canvas-layer').forEach(c => {
        // 'auto' = Zeichnen an, Browser-Events aus
        // 'none' = Zeichnen aus, Klicks gehen durch zur Folie
        c.style.pointerEvents = (t === 'none') ? 'none' : 'auto';
    });
    
    document.querySelectorAll('.mps-tool').forEach(b => b.classList.remove('active'));
    if (t === 'black') document.querySelector('.btn-blk').classList.add('active');
    if (t === 'red') document.querySelector('.btn-red').classList.add('active');
    if (t === 'green') document.querySelector('.btn-grn').classList.add('active');
    if (t === 'eraser') document.querySelector('.btn-era').classList.add('active');
  };

  window.toggleMenu = (id) => {
      const el = document.getElementById(id);
      const isVisible = el.style.display === 'flex';
      document.querySelectorAll('.mps-popover').forEach(p => p.style.display = 'none');
      if (!isVisible) el.style.display = 'flex';
  };
  window.setPenWidth = (w) => { penWidth = w; document.getElementById('menu-pen-size').style.display = 'none'; };
  window.setEraserWidth = (w) => { eraserWidth = w; document.getElementById('menu-era-size').style.display = 'none'; };

  document.addEventListener('click', (e) => {
      if (!e.target.closest('#mps-footer')) document.querySelectorAll('.mps-popover').forEach(p => p.style.display = 'none');
  });

  window.clearVisibleSlide = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const hitElement = document.elementFromPoint(centerX, centerY);
    if (hitElement) {
        const sec = hitElement.closest('section');
        if (sec) {
            const c = sec.querySelector('canvas.mps-canvas-layer');
            if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height);
        }
    }
  };
  
  window.toggleMpsFS = () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else if (document.exitFullscreen) document.exitFullscreen();
  };

  // --- TIMER ---
  let timerInterval = null;
  let remainingSeconds = 0;
  let defaultSeconds = 0;
  let isTimerRunning = false;

  const updateTimerDisplay = () => {
      const m = Math.floor(remainingSeconds / 60);
      const s = remainingSeconds % 60;
      const display = document.getElementById('mps-timer-display');
      display.textContent = \`\${m.toString().padStart(2,'0')}:\${s.toString().padStart(2,'0')}\`;
      document.getElementById('btn-timer-toggle').textContent = isTimerRunning ? '⏸' : '▶';
      if (remainingSeconds <= 0 && !isTimerRunning && defaultSeconds > 0) display.classList.add('mps-timer-finished');
      else display.classList.remove('mps-timer-finished');
  };

  const stopTimer = () => {
      if (timerInterval) clearInterval(timerInterval);
      isTimerRunning = false;
      updateTimerDisplay();
  };

  const startTimer = () => {
      if (isTimerRunning) return;
      isTimerRunning = true;
      updateTimerDisplay();
      timerInterval = setInterval(() => {
          if (remainingSeconds > 0) {
              remainingSeconds--;
              updateTimerDisplay();
          } else {
              stopTimer();
              document.getElementById('mps-timer-display').classList.add('mps-timer-finished');
          }
      }, 1000);
  };

  window.timerToggle = () => { isTimerRunning ? stopTimer() : startTimer(); };
  window.timerReset = () => { stopTimer(); remainingSeconds = defaultSeconds; document.getElementById('mps-timer-display').classList.remove('mps-timer-finished'); updateTimerDisplay(); };
  window.timerAdd = (mins) => { remainingSeconds += (mins * 60); updateTimerDisplay(); if(isTimerRunning) document.getElementById('mps-timer-display').classList.remove('mps-timer-finished'); };

  const checkTimer = () => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const hitElement = document.elementFromPoint(centerX, centerY);
    const sec = hitElement ? hitElement.closest('section') : document.querySelector('section');
    const widget = document.getElementById('mps-timer-widget');
    
    stopTimer();
    if (sec) {
        const timerEl = sec.querySelector('[data-timer]');
        if (timerEl) {
            const val = timerEl.getAttribute('data-timer');
            let seconds = 0;
            if (val.includes(':')) {
                const parts = val.split(':');
                seconds = (parseInt(parts[0]) * 60) + parseInt(parts[1]);
            } else {
                seconds = parseInt(val) * 60;
            }
            defaultSeconds = seconds;
            remainingSeconds = seconds;
            widget.style.display = 'flex';
            startTimer(); 
        } else {
            widget.style.display = 'none';
        }
    }
  };

  window.addEventListener('hashchange', () => setTimeout(checkTimer, 50));
  window.addEventListener('keyup', (e) => { if(e.key.startsWith('Arrow') || e.key === 'PageUp' || e.key === 'PageDown') setTimeout(checkTimer, 50); });
  
  setTimeout(initCanvases, 100);
})();
</script>
`;