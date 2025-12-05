module.exports = `
<style>
  /* === UI === */
  /* Z-Index auf Maximum (2147483647), damit es sicher über allen Slides liegt */
  #mps-footer { position: fixed; bottom: 0; left: 0; width: 100%; height: 60px; background: #2c3e50; display: flex; align-items: center; justify-content: center; z-index: 2147483647; gap: 10px; font-family: sans-serif; border-top: 2px solid #34495e; }
  .mps-btn { background: #3498db; color: white; border: none; padding: 0 14px; cursor: pointer; border-radius: 8px; font-weight: bold; font-size: 14px; transition: transform 0.1s; height: 40px; display: flex; align-items: center; justify-content: center;}
  .mps-btn:active { transform: scale(0.95); }
  .mps-drop-btn { min-width: 80px; justify-content: space-between; }
  
  /* CANVAS LAYER - iOS OPTIMIZED */
  .mps-canvas-layer { 
      position: fixed !important;
      top: 0 !important; 
      left: 0 !important; 
      width: 100vw !important; 
      height: 100vh !important; 
      z-index: 2147483646; 
      touch-action: none !important; 
      -webkit-touch-callout: none !important;
      -webkit-user-select: none !important;
      user-select: none !important;
      -webkit-tap-highlight-color: transparent !important;
      pointer-events: none; 
  }
  
  .mps-canvas-layer.active { pointer-events: auto !important; }
  
  /* Icons & Popovers */
  .mps-tool { width: 40px; padding: 0; border-radius: 50%; border: 3px solid transparent; font-size: 18px; }
  .mps-tool.active { border-color: white; box-shadow: 0 0 8px rgba(255,255,255,0.6); transform: scale(1.1); }
  
  .mps-popover { position: absolute; bottom: 70px; background: #1f2a36; border: 2px solid #34495e; border-radius: 10px; padding: 8px; display: none; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 2147483647; }
  
  /* Spezieller Style für das Slide-Menü (vertikal + scrollbar) */
  .mps-menu-vertical { flex-direction: column; max-height: 60vh; overflow-y: auto; width: 220px; align-items: stretch; }
  .mps-menu-vertical button { text-align: left; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  .mps-popover button { background: #3498db; color: white; border: none; border-radius: 6px; padding: 6px 12px; font-weight: bold; cursor: pointer; font-size: 12px; }
  .mps-popover button:hover { background: #2980b9; }

  /* Timer */
  #mps-timer-widget {
      position: fixed; top: 20px; right: 20px;
      background: rgba(31, 42, 54, 0.95); border: 2px solid #3498db;
      border-radius: 12px; padding: 10px 15px;
      display: none; flex-direction: column; align-items: center; gap: 5px;
      z-index: 2147483647; box-shadow: 0 8px 20px rgba(0,0,0,0.4);
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
  <button class="mps-btn" onclick="navigateSlide('prev')">←</button>
  <button class="mps-btn" onclick="navigateSlide('next')">→</button>
  
  <div style="position: relative; margin-left: 5px;">
      <button class="mps-btn mps-drop-btn" id="btn-slide-nav" onclick="toggleMenu('menu-slide-nav')">Gehe zu ▾</button>
      <div id="menu-slide-nav" class="mps-popover mps-menu-vertical">
          </div>
  </div>

  <div style="width:15px"></div>
  
  <button class="mps-btn mps-tool btn-blk" onclick="setMpsTool('black')">✏️</button>
  <button class="mps-btn mps-tool btn-red" onclick="setMpsTool('red')">✏️</button>
  <button class="mps-btn mps-tool btn-grn" onclick="setMpsTool('green')">✏️</button>
  
  <div style="position: relative;">
      <button class="mps-btn mps-drop-btn" id="btn-pen-size" onclick="toggleMenu('menu-pen-size')">Größe ▾</button>
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
      <button class="mps-btn mps-drop-btn" id="btn-era-size" onclick="toggleMenu('menu-era-size')">Größe ▾</button>
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
  let activePointerId = null;
  let isDrawing = false;
  
  let penWidth = 5;
  let eraserWidth = 30;
  
  let globalCanvas = null;
  let globalCtx = null;

  // --- INIT ---
  const initCanvas = () => {
    if (globalCanvas) return;
    
    globalCanvas = document.createElement('canvas');
    globalCanvas.className = 'mps-canvas-layer';
    globalCanvas.id = 'mps-global-canvas';
    document.body.appendChild(globalCanvas);
    
    globalCtx = globalCanvas.getContext('2d', { willReadFrequently: false });
    
    resizeCanvas();
    attachEvents();
    initSlideMenu(); // Menü aufbauen
    
    setTimeout(checkTimer, 500);
  };

  // --- SLIDE NAVIGATION BUILDER ---
  const initSlideMenu = () => {
    const sections = document.querySelectorAll('section');
    const menu = document.getElementById('menu-slide-nav');
    if(!menu) return;
    
    menu.innerHTML = ''; // Reset
    
    sections.forEach((sec, idx) => {
       const slideNum = idx + 1;
       // Titel suchen: Erst data-title, dann h1, dann h2, sonst Fallback
       let title = sec.getAttribute('data-title');
       if (!title) {
           const h1 = sec.querySelector('h1');
           if(h1) title = h1.innerText;
           else {
               const h2 = sec.querySelector('h2');
               if(h2) title = h2.innerText;
           }
       }
       if (!title) title = 'Folie ' + slideNum;
       
       // Zu langen Text kürzen für Anzeige
       if(title.length > 25) title = title.substring(0, 25) + '...';

       const btn = document.createElement('button');
       btn.innerText = slideNum + '. ' + title;
       btn.onclick = () => {
           // Hash Navigation (funktioniert bei Marp/Reveal meistens)
           window.location.hash = slideNum;
           toggleMenu('menu-slide-nav');
           // Timer-Check erzwingen
           setTimeout(checkTimer, 200);
       };
       menu.appendChild(btn);
    });
  };

  // --- RESIZE ---
  const resizeCanvas = () => {
    if (!globalCanvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    
    globalCanvas.width = Math.round(w * dpr);
    globalCanvas.height = Math.round(h * dpr);
    globalCanvas.style.width = w + 'px';
    globalCanvas.style.height = h + 'px';
    globalCanvas.style.position = 'fixed';
    globalCanvas.style.top = '0';
    globalCanvas.style.left = '0';
  };
  
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', resizeCanvas);
  } else {
    window.addEventListener('resize', resizeCanvas);
  }

  // --- INPUT / DRAWING ---
  const getPos = (e) => {
    const dpr = window.devicePixelRatio || 1;
    let cx = e.clientX;
    let cy = e.clientY;
    if (cx === undefined && e.touches && e.touches.length > 0) {
        cx = e.touches[0].clientX;
        cy = e.touches[0].clientY;
    }
    return { x: cx * dpr, y: cy * dpr };
  };

  const attachEvents = () => {
    const start = (e) => {
      if (currentTool === 'none') return;
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();

      if (isDrawing || activePointerId !== null) return;
      isDrawing = true;
      activePointerId = e.pointerId;
      
      const p = getPos(e);
      globalCtx.beginPath(); 
      globalCtx.moveTo(p.x, p.y);
      
      setTimeout(() => {
        try { 
          if (globalCanvas.hasPointerCapture && !globalCanvas.hasPointerCapture(e.pointerId)) {
            globalCanvas.setPointerCapture(e.pointerId); 
          }
        } catch(err){}
      }, 0);
    };
    
    const move = (e) => {
      if (currentTool === 'none' || !isDrawing) return;
      if (activePointerId !== e.pointerId) return;
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      
      const p = getPos(e);
      globalCtx.lineCap = 'round'; 
      globalCtx.lineJoin = 'round';
      const dpr = window.devicePixelRatio || 1;
      globalCtx.lineWidth = (currentTool === 'eraser' ? eraserWidth : penWidth) * dpr;
      globalCtx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
      globalCtx.strokeStyle = currentTool === 'black' ? '#2c3e50' : currentTool;
      
      globalCtx.lineTo(p.x, p.y); 
      globalCtx.stroke();
    };
    
    const end = (e) => { 
      if (activePointerId !== e.pointerId) return;
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      isDrawing = false;
      activePointerId = null;
      try { 
        if (globalCanvas.hasPointerCapture && globalCanvas.hasPointerCapture(e.pointerId)) {
          globalCanvas.releasePointerCapture(e.pointerId); 
        }
      } catch(err){}
    };
    
    globalCanvas.addEventListener('pointerdown', start, { passive: false }); 
    globalCanvas.addEventListener('pointermove', move, { passive: false });
    globalCanvas.addEventListener('pointerup', end, { passive: false }); 
    globalCanvas.addEventListener('pointercancel', end, { passive: false });
    globalCanvas.addEventListener('touchstart', (e) => { if (currentTool !== 'none') e.preventDefault(); }, { passive: false });
  };

  // --- UI ACTIONS ---
  window.setMpsTool = (t) => {
    currentTool = t;
    isDrawing = false;
    activePointerId = null;
    if (!globalCanvas) return;
    if (t === 'none') globalCanvas.classList.remove('active');
    else globalCanvas.classList.add('active');
    
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

  window.navigateSlide = (dir) => {
      const key = dir === 'next' ? 'ArrowRight' : 'ArrowLeft';
      document.dispatchEvent(new KeyboardEvent('keydown',{'key': key}));
      setTimeout(checkTimer, 100);
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#mps-footer')) {
      document.querySelectorAll('.mps-popover').forEach(p => p.style.display = 'none');
    }
  });

  window.clearVisibleSlide = () => { if (globalCtx) globalCtx.clearRect(0, 0, globalCanvas.width, globalCanvas.height); };
  
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
    if(display) {
        display.textContent = m.toString().padStart(2,'0') + ':' + s.toString().padStart(2,'0');
        document.getElementById('btn-timer-toggle').textContent = isTimerRunning ? '⏸' : '▶';
        if (remainingSeconds <= 0 && !isTimerRunning && defaultSeconds > 0) display.classList.add('mps-timer-finished');
        else display.classList.remove('mps-timer-finished');
    }
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
        const display = document.getElementById('mps-timer-display');
        if(display) display.classList.add('mps-timer-finished');
      }
    }, 1000);
  };

  window.timerToggle = () => isTimerRunning ? stopTimer() : startTimer();
  window.timerReset = () => { stopTimer(); remainingSeconds = defaultSeconds; const d = document.getElementById('mps-timer-display'); if(d) d.classList.remove('mps-timer-finished'); updateTimerDisplay(); };
  window.timerAdd = (mins) => { remainingSeconds += (mins * 60); updateTimerDisplay(); if(isTimerRunning) { const d = document.getElementById('mps-timer-display'); if(d) d.classList.remove('mps-timer-finished'); }};

  const checkTimer = () => {
    if (globalCanvas) globalCanvas.style.display = 'none'; // Hack für elementFromPoint
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const hitElement = document.elementFromPoint(centerX, centerY);
    if (globalCanvas) globalCanvas.style.display = '';

    const sec = hitElement ? hitElement.closest('section') : document.querySelector('section');
    const widget = document.getElementById('mps-timer-widget');
    if(!widget) return;

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
        
        if (seconds !== defaultSeconds) {
            stopTimer();
            defaultSeconds = seconds;
            remainingSeconds = seconds;
            widget.style.display = 'flex';
            startTimer();
        } else {
             widget.style.display = 'flex';
        }
      } else {
        widget.style.display = 'none';
        stopTimer();
      }
    }
  };

  window.addEventListener('hashchange', () => setTimeout(checkTimer, 100));
  window.addEventListener('popstate', () => setTimeout(checkTimer, 100));
  window.addEventListener('touchend', () => setTimeout(checkTimer, 300));
  window.addEventListener('keyup', (e) => { if(e.key.startsWith('Arrow') || e.key === ' ' || e.key === 'PageDown' || e.key === 'PageUp') setTimeout(checkTimer, 100); });
  
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(initCanvas, 300));
  else setTimeout(initCanvas, 300);
})();
</script>
`;