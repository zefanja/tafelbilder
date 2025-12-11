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
  // === CONFIG ===
  let penWidth = 5;
  let eraserWidth = 30;
  const HOLD_DELAY = 500;
  const JITTER_THRESHOLD = 5;
  
  // === STATE ===
  let currentTool = 'none';
  let isDrawing = false;
  let activePointerId = null;
  let useShapeDetection = false;

  // Shape / Straight Line State
  let shapeTimer = null;
  let isSnapMode = false;
  let detectedType = null;
  let strokePoints = [];
  let lastPos = {x:0, y:0};
  let lastStablePos = {x:0, y:0}; 
  let snapState = { pointerStart: {x:0, y:0}, bounds: {x:0, y:0, w:0, h:0}, startPoint: {x:0, y:0} };
  let normalizedShapePoints = []; 

  // === LASSO STATE ===
  let lassoPath = []; // Punkte der Lasso-Linie
  let isLassoSelecting = false; // User zeichnet gerade die Auswahl
  let isLassoDragging = false;  // User verschiebt die Auswahl
  let selectionImg = null;      // Der ausgeschnittene Canvas-Teil (Offscreen Canvas)
  let selectionState = null;    // { x, y, w, h } Position der Auswahl
  let dragOffset = {x:0, y:0};  // Wo wurde die Auswahl angefasst?

  // Canvas Refs
  let globalCanvas = null;
  let globalCtx = null;
  let canvasSnapshot = null; // Speichert den Basis-Zustand (ohne schwebende Auswahl)

  // --- INIT ---
  const initCanvas = () => {
    if (globalCanvas) return;
    globalCanvas = document.createElement('canvas');
    globalCanvas.className = 'mps-canvas-layer';
    globalCanvas.id = 'mps-global-canvas';
    document.body.appendChild(globalCanvas);
    globalCtx = globalCanvas.getContext('2d', { willReadFrequently: true });
    
    injectButtons();
    resizeCanvas();
    attachEvents();
    initSlideMenu();
    setTimeout(checkTimer, 500);
  };

  const injectButtons = () => {
      const footer = document.getElementById('mps-footer');
      if(!footer) return;

      // 1. Lasso Button (vor dem Radierer einfügen oder danach)
      if(!document.getElementById('btn-lasso')) {
          const btnLasso = document.createElement('button');
          btnLasso.className = 'mps-btn mps-tool btn-lasso';
          btnLasso.innerHTML = '🤠'; // Cowboy Icon für Lasso
          btnLasso.onclick = () => setMpsTool('lasso');
          btnLasso.style.marginRight = '10px';
          
          // Einfügen vor dem Eraser (wir suchen den Eraser Button)
          const eraserBtn = document.querySelector('.btn-era');
          if(eraserBtn) footer.insertBefore(btnLasso, eraserBtn);
          else footer.appendChild(btnLasso);
      }
      
      // 2. Shape Toggle
      if(!document.getElementById('btn-shape-toggle')) {
          const btn = document.createElement('button');
          btn.id = 'btn-shape-toggle';
          btn.className = 'mps-btn';
          btn.innerText = 'Shapes: OFF';
          btn.style.marginLeft = '10px';
          btn.style.minWidth = '100px';
          btn.onclick = toggleShapeDetection;
          footer.insertBefore(btn, footer.lastElementChild); // Vor Fullscreen
      }
  };

  window.toggleShapeDetection = () => {
      useShapeDetection = !useShapeDetection;
      const btn = document.getElementById('btn-shape-toggle');
      if(btn) {
          btn.innerText = useShapeDetection ? 'Shapes: ON' : 'Shapes: OFF';
          btn.style.background = useShapeDetection ? '#27ae60' : '#3498db';
      }
  };

  // --- MATH HELPERS ---
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

  const dist = (p1, p2) => Math.sqrt((p1.x - p2.x)**2 + (p1.y - p2.y)**2);
  
  const getBounds = (points) => {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      points.forEach(p => {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
      });
      return { x: minX, y: minY, w: maxX - minX, h: maxY - minY, minX, minY, maxX, maxY, centerX: minX+(maxX-minX)/2, centerY: minY+(maxY-minY)/2 };
  };

  const getPolygonArea = (points) => {
      let area = 0;
      for (let i = 0; i < points.length; i++) {
          let j = (i + 1) % points.length;
          area += points[i].x * points[j].y;
          area -= points[j].x * points[i].y;
      }
      return Math.abs(area) / 2;
  };

  // Point in Rect Check
  const isPointInRect = (p, rect) => {
      return p.x >= rect.x && p.x <= rect.x + rect.w && p.y >= rect.y && p.y <= rect.y + rect.h;
  };

  // --- LASSO LOGIC ---

  // 1. Auswahl auf den Canvas "kleben" (Commit)
  const commitSelection = () => {
      if (!selectionImg || !selectionState) return;
      
      // Zeichne das schwebende Bild permanent auf den Main Canvas
      globalCtx.drawImage(selectionImg, selectionState.x, selectionState.y);
      
      selectionImg = null;
      selectionState = null;
      lassoPath = [];
      canvasSnapshot = null; // Snapshot veraltet
  };

  // 2. Bereich ausschneiden (Lift)
  const liftSelection = () => {
      if (lassoPath.length < 3) return;

      const bounds = getBounds(lassoPath);
      if (bounds.w < 5 || bounds.h < 5) return; // Zu klein

      // Snapshot vom aktuellen Ganzen (wird zum Hintergrund)
      const fullCanvasSnap = globalCtx.getImageData(0, 0, globalCanvas.width, globalCanvas.height);

      // A. Offscreen Canvas für die Auswahl erstellen (Masking)
      const selCanvas = document.createElement('canvas');
      selCanvas.width = globalCanvas.width;
      selCanvas.height = globalCanvas.height;
      const selCtx = selCanvas.getContext('2d');

      // Pfad auf Offscreen zeichnen
      selCtx.beginPath();
      selCtx.moveTo(lassoPath[0].x, lassoPath[0].y);
      for (let i = 1; i < lassoPath.length; i++) selCtx.lineTo(lassoPath[i].x, lassoPath[i].y);
      selCtx.closePath();
      selCtx.fillStyle = '#000';
      selCtx.fill();

      // Source-In: Behält nur Pixel, wo der Pfad ist
      selCtx.globalCompositeOperation = 'source-in';
      selCtx.drawImage(globalCanvas, 0, 0);

      // B. Auswahl zuschneiden auf Bounding Box (Performance & Handling)
      const finalSelCanvas = document.createElement('canvas');
      finalSelCanvas.width = bounds.w;
      finalSelCanvas.height = bounds.h;
      finalSelCanvas.getContext('2d').drawImage(selCanvas, bounds.x, bounds.y, bounds.w, bounds.h, 0, 0, bounds.w, bounds.h);
      
      selectionImg = finalSelCanvas;
      selectionState = { x: bounds.x, y: bounds.y, w: bounds.w, h: bounds.h };

      // C. Original löschen (Loch schneiden)
      globalCtx.save();
      globalCtx.beginPath();
      globalCtx.moveTo(lassoPath[0].x, lassoPath[0].y);
      for (let i = 1; i < lassoPath.length; i++) globalCtx.lineTo(lassoPath[i].x, lassoPath[i].y);
      globalCtx.closePath();
      globalCtx.globalCompositeOperation = 'destination-out';
      globalCtx.fillStyle = '#000';
      globalCtx.fill();
      globalCtx.restore();

      // D. Neuen Hintergrund-Snapshot speichern (mit Loch)
      canvasSnapshot = globalCtx.getImageData(0, 0, globalCanvas.width, globalCanvas.height);

      // E. Sofort rendern (damit man Auswahlrahmen sieht)
      renderLassoOverlay();
  };

  const renderLassoOverlay = () => {
      // 1. Hintergrund (mit Loch) wiederherstellen
      if (canvasSnapshot) globalCtx.putImageData(canvasSnapshot, 0, 0);

      // 2. Schwebende Auswahl zeichnen
      if (selectionImg && selectionState) {
          globalCtx.drawImage(selectionImg, selectionState.x, selectionState.y);
          
          // Rahmen zeichnen
          globalCtx.save();
          globalCtx.strokeStyle = '#3498db';
          globalCtx.lineWidth = 2;
          globalCtx.setLineDash([5, 5]);
          globalCtx.strokeRect(selectionState.x, selectionState.y, selectionState.w, selectionState.h);
          globalCtx.restore();
      }

      // 3. Wenn gerade selektiert wird: Linie zeichnen
      if (isLassoSelecting && lassoPath.length > 0) {
          globalCtx.save();
          globalCtx.beginPath();
          globalCtx.strokeStyle = '#3498db';
          globalCtx.lineWidth = 2;
          globalCtx.setLineDash([5, 5]);
          globalCtx.moveTo(lassoPath[0].x, lassoPath[0].y);
          for(let i=1; i<lassoPath.length; i++) globalCtx.lineTo(lassoPath[i].x, lassoPath[i].y);
          globalCtx.stroke();
          globalCtx.restore();
      }
  };


  // --- SHAPE RECOGNITION LOGIC (Legacy support) ---
  const analyzeShape = () => {
      if (strokePoints.length < 5) return 'line';
      const start = strokePoints[0];
      const end = strokePoints[strokePoints.length - 1];
      const totalLen = strokePoints.reduce((acc, p, i) => i > 0 ? acc + dist(p, strokePoints[i-1]) : 0, 0);
      
      if (dist(start, end) > 0.85 * totalLen) return 'line';
      if (!useShapeDetection) return null;

      const bounds = getBounds(strokePoints);
      if ((bounds.w * bounds.h) < 100) return 'line';
      
      const fillRatio = getPolygonArea([...strokePoints, strokePoints[0]]) / (bounds.w * bounds.h);
      if (fillRatio > 0.80) return 'rect';
      if (fillRatio < 0.60) { calculateTrianglePoints(bounds); return 'triangle'; }
      
      // Circle detection
      const center = {x: bounds.centerX, y: bounds.centerY};
      let radiusSum = 0; strokePoints.forEach(p => radiusSum += dist(p, center));
      const avgRad = radiusSum / strokePoints.length;
      let varSum = 0; strokePoints.forEach(p => varSum += (dist(p, center) - avgRad)**2);
      if ((Math.sqrt(varSum/strokePoints.length)/avgRad) < 0.22) return 'circle';
      return 'rect';
  };

  const calculateTrianglePoints = (bounds) => {
      const center = {x: bounds.centerX, y: bounds.centerY};
      let pA = strokePoints[0], maxD = -1;
      strokePoints.forEach(p => { const d = dist(p, center); if(d>maxD){maxD=d; pA=p;} });
      let pB = pA; maxD = -1; strokePoints.forEach(p => { const d = dist(p, pA); if(d>maxD){maxD=d; pB=p;} });
      let pC = pA; maxD = -1;
      const distToLine = (p, l1, l2) => Math.abs((l2.x-l1.x)*(l1.y-p.y)-(l1.x-p.x)*(l2.y-l1.y))/dist(l1,l2);
      strokePoints.forEach(p => { const d = distToLine(p, pA, pB); if(d>maxD){maxD=d; pC=p;} });
      const norm = (p) => ({ x: (p.x - bounds.minX)/bounds.w, y: (p.y - bounds.minY)/bounds.h });
      normalizedShapePoints = [norm(pA), norm(pB), norm(pC)];
  };

  const drawSnappedShape = (currentPos) => {
      globalCtx.putImageData(canvasSnapshot, 0, 0);
      const dpr = window.devicePixelRatio || 1;
      globalCtx.lineWidth = penWidth * dpr;
      globalCtx.lineCap = 'round';
      globalCtx.lineJoin = 'round';
      globalCtx.strokeStyle = currentTool === 'black' ? '#2c3e50' : currentTool;
      globalCtx.beginPath();

      if (detectedType === 'line') {
          globalCtx.moveTo(snapState.startPoint.x, snapState.startPoint.y);
          globalCtx.lineTo(currentPos.x, currentPos.y);
          globalCtx.stroke();
          return;
      }
      
      const dx = currentPos.x - snapState.pointerStart.x;
      const dy = currentPos.y - snapState.pointerStart.y;
      let x = snapState.bounds.x;
      let y = snapState.bounds.y;
      let w = snapState.bounds.w + dx;
      let h = snapState.bounds.h + dy;

      if (detectedType === 'rect') globalCtx.rect(x, y, w, h);
      else if (detectedType === 'circle') globalCtx.ellipse(x+w/2, y+h/2, Math.abs(w/2), Math.abs(h/2), 0, 0, 2*Math.PI);
      else if (detectedType === 'triangle') {
          const p1 = { x: x + normalizedShapePoints[0].x * w, y: y + normalizedShapePoints[0].y * h };
          const p2 = { x: x + normalizedShapePoints[1].x * w, y: y + normalizedShapePoints[1].y * h };
          const p3 = { x: x + normalizedShapePoints[2].x * w, y: y + normalizedShapePoints[2].y * h };
          globalCtx.moveTo(p1.x, p1.y); globalCtx.lineTo(p2.x, p2.y); globalCtx.lineTo(p3.x, p3.y); globalCtx.closePath();
      }
      globalCtx.stroke();
  };

  const triggerSnap = () => {
      if (!isDrawing || currentTool === 'eraser' || isSnapMode || currentTool === 'lasso') return;
      const type = analyzeShape();
      if (!type) return;
      detectedType = type; isSnapMode = true;
      snapState = { pointerStart: { ...lastPos }, bounds: getBounds(strokePoints), startPoint: strokePoints[0] };
      if (navigator.vibrate) navigator.vibrate(20);
      drawSnappedShape(lastPos);
  };

  // --- EVENTS ---
  const attachEvents = () => {
    const start = (e) => {
      if (currentTool === 'none') return;
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();

      const p = getPos(e);
      lastPos = p;

      // === LASSO START LOGIK ===
      if (currentTool === 'lasso') {
          // Fall A: Klick IN bestehende Auswahl -> Verschieben starten
          if (selectionState && isPointInRect(p, selectionState)) {
              isLassoDragging = true;
              dragOffset = { x: p.x - selectionState.x, y: p.y - selectionState.y };
              activePointerId = e.pointerId;
              return;
          }
          
          // Fall B: Klick AUSSERHALB -> Auswahl committen (ablegen)
          if (selectionState) {
              commitSelection();
              // Wir machen hier NICHT return, sondern starten direkt eine neue Auswahl
          }

          // Start neue Auswahl
          isLassoSelecting = true;
          lassoPath = [p];
          // Snapshot für Overlay Rendering (zeigt aktuellen Canvas während Selektion)
          canvasSnapshot = globalCtx.getImageData(0, 0, globalCanvas.width, globalCanvas.height);
          activePointerId = e.pointerId;
          return;
      }

      // === DRAWING START LOGIK ===
      if (isDrawing) return;
      isDrawing = true;
      activePointerId = e.pointerId;
      
      lastStablePos = p;
      strokePoints = [p];
      isSnapMode = false; detectedType = null;

      try { globalCanvas.setPointerCapture(e.pointerId); } catch(err){}

      if (currentTool !== 'eraser') {
        canvasSnapshot = globalCtx.getImageData(0, 0, globalCanvas.width, globalCanvas.height);
        shapeTimer = setTimeout(triggerSnap, HOLD_DELAY);
      } else {
        canvasSnapshot = null;
      }
      globalCtx.beginPath(); globalCtx.moveTo(p.x, p.y);
    };
    
    const move = (e) => {
      if (currentTool === 'none') return;
      if (activePointerId !== e.pointerId) return;
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      const p = getPos(e);
      lastPos = p;

      // === LASSO MOVE ===
      if (currentTool === 'lasso') {
          if (isLassoDragging && selectionState) {
              selectionState.x = p.x - dragOffset.x;
              selectionState.y = p.y - dragOffset.y;
              renderLassoOverlay();
          } else if (isLassoSelecting) {
              lassoPath.push(p);
              renderLassoOverlay();
          }
          return;
      }

      // === DRAWING MOVE ===
      if (!isDrawing) return;
      if (isSnapMode) { drawSnappedShape(p); return; }

      strokePoints.push(p);
      globalCtx.lineCap = 'round'; globalCtx.lineJoin = 'round';
      const dpr = window.devicePixelRatio || 1;
      globalCtx.lineWidth = (currentTool === 'eraser' ? eraserWidth : penWidth) * dpr;
      globalCtx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
      globalCtx.strokeStyle = currentTool === 'black' ? '#2c3e50' : currentTool;
      globalCtx.lineTo(p.x, p.y); globalCtx.stroke();

      if (currentTool !== 'eraser' && dist(p, lastStablePos) > JITTER_THRESHOLD) {
          clearTimeout(shapeTimer); shapeTimer = setTimeout(triggerSnap, HOLD_DELAY); lastStablePos = p;
      }
    };
    
    const end = (e) => { 
      if (activePointerId !== e.pointerId) return;
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
      
      // === LASSO END ===
      if (currentTool === 'lasso') {
          if (isLassoSelecting) {
              isLassoSelecting = false;
              liftSelection(); // Versucht, den Bereich auszuschneiden
          }
          isLassoDragging = false;
          activePointerId = null;
          return;
      }

      // === DRAWING END ===
      isDrawing = false;
      activePointerId = null;
      if (shapeTimer) clearTimeout(shapeTimer);
      canvasSnapshot = null; isSnapMode = false;
      try { globalCanvas.releasePointerCapture(e.pointerId); } catch(err){}
    };
    
    globalCanvas.addEventListener('pointerdown', start, { passive: false }); 
    globalCanvas.addEventListener('pointermove', move, { passive: false });
    globalCanvas.addEventListener('pointerup', end, { passive: false }); 
    globalCanvas.addEventListener('pointercancel', end, { passive: false });
    globalCanvas.addEventListener('touchstart', (e) => { if (currentTool !== 'none') e.preventDefault(); }, { passive: false });
  };

  // --- UI API ---
  window.setMpsTool = (t) => {
    // Wenn wir Lasso verlassen und noch eine Auswahl schwebt -> Committen!
    if (currentTool === 'lasso' && selectionImg) {
        commitSelection();
    }

    currentTool = t;
    isDrawing = false; isLassoSelecting = false; isLassoDragging = false;
    activePointerId = null;
    
    if (!globalCanvas) return;
    if (t === 'none') { globalCanvas.classList.remove('active'); globalCanvas.style.pointerEvents = 'none'; } 
    else { globalCanvas.classList.add('active'); globalCanvas.style.pointerEvents = 'auto'; }
    
    document.querySelectorAll('.mps-tool').forEach(b => b.classList.remove('active'));
    if (t === 'black') document.querySelector('.btn-blk')?.classList.add('active');
    if (t === 'red') document.querySelector('.btn-red')?.classList.add('active');
    if (t === 'green') document.querySelector('.btn-grn')?.classList.add('active');
    if (t === 'eraser') document.querySelector('.btn-era')?.classList.add('active');
    if (t === 'lasso') document.querySelector('.btn-lasso')?.classList.add('active');
  };

  // --- BOILERPLATE ---
  window.toggleMenu = (id) => {
    const el = document.getElementById(id);
    const isVisible = el.style.display === 'flex';
    document.querySelectorAll('.mps-popover').forEach(p => p.style.display = 'none');
    if (!isVisible) el.style.display = 'flex';
  };
  window.setPenWidth = (w) => { penWidth = w; document.getElementById('menu-pen-size').style.display = 'none'; };
  window.setEraserWidth = (w) => { eraserWidth = w; document.getElementById('menu-era-size').style.display = 'none'; };
  window.clearVisibleSlide = () => { if (globalCtx) globalCtx.clearRect(0, 0, globalCanvas.width, globalCanvas.height); };
  window.toggleMpsFS = () => { if (!document.fullscreenElement) document.documentElement.requestFullscreen(); else if (document.exitFullscreen) document.exitFullscreen(); };
  
  const resizeCanvas = () => {
      if (!globalCanvas) return;
      const dpr = window.devicePixelRatio || 1;
      const w = window.visualViewport ? window.visualViewport.width : window.innerWidth;
      const h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      
      // Beim Resizen bestehenden Inhalt retten
      let temp;
      try { temp = globalCtx.getImageData(0,0,globalCanvas.width, globalCanvas.height); } catch(e){}
      
      globalCanvas.width = Math.round(w * dpr); globalCanvas.height = Math.round(h * dpr);
      globalCanvas.style.width = w + 'px'; globalCanvas.style.height = h + 'px';
      
      if(temp) globalCtx.putImageData(temp, 0, 0);
  };
  if (window.visualViewport) window.visualViewport.addEventListener('resize', resizeCanvas); else window.addEventListener('resize', resizeCanvas);

  const initSlideMenu = () => {
    const sections = document.querySelectorAll('section');
    const menu = document.getElementById('menu-slide-nav');
    if(!menu) return;
    menu.innerHTML = ''; 
    sections.forEach((sec, idx) => {
       const slideNum = idx + 1;
       let title = sec.getAttribute('data-title') || 'Folie ' + slideNum;
       if(title.length > 25) title = title.substring(0, 25) + '...';
       const btn = document.createElement('button');
       btn.innerText = slideNum + '. ' + title;
       btn.onclick = () => { window.location.hash = slideNum; toggleMenu('menu-slide-nav'); setTimeout(checkTimer, 200); };
       menu.appendChild(btn);
    });
  };

  window.navigateSlide = (dir) => {
      const key = dir === 'next' ? 'ArrowRight' : 'ArrowLeft';
      document.dispatchEvent(new KeyboardEvent('keydown',{'key': key}));
      setTimeout(checkTimer, 100);
  }

  // --- TIMER ---
  let timerInterval = null; let remainingSeconds = 0; let defaultSeconds = 0; let isTimerRunning = false;
  const updateTimerDisplay = () => {
    const m = Math.floor(remainingSeconds / 60); const s = remainingSeconds % 60;
    const display = document.getElementById('mps-timer-display');
    if(display) {
        display.textContent = m.toString().padStart(2,'0') + ':' + s.toString().padStart(2,'0');
        document.getElementById('btn-timer-toggle').textContent = isTimerRunning ? '⏸' : '▶';
        if (remainingSeconds <= 0 && !isTimerRunning && defaultSeconds > 0) display.classList.add('mps-timer-finished'); else display.classList.remove('mps-timer-finished');
    }
  };
  const stopTimer = () => { if (timerInterval) clearInterval(timerInterval); isTimerRunning = false; updateTimerDisplay(); };
  const startTimer = () => {
    if (isTimerRunning) return; isTimerRunning = true; updateTimerDisplay();
    timerInterval = setInterval(() => { if (remainingSeconds > 0) { remainingSeconds--; updateTimerDisplay(); } else { stopTimer(); const d = document.getElementById('mps-timer-display'); if(d) d.classList.add('mps-timer-finished'); } }, 1000);
  };
  window.timerToggle = () => isTimerRunning ? stopTimer() : startTimer();
  window.timerReset = () => { stopTimer(); remainingSeconds = defaultSeconds; const d = document.getElementById('mps-timer-display'); if(d) d.classList.remove('mps-timer-finished'); updateTimerDisplay(); };
  window.timerAdd = (mins) => { remainingSeconds += (mins * 60); updateTimerDisplay(); if(isTimerRunning) { const d = document.getElementById('mps-timer-display'); if(d) d.classList.remove('mps-timer-finished'); }};
  const checkTimer = () => {
    if (globalCanvas) globalCanvas.style.display = 'none';
    const hitElement = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    if (globalCanvas) globalCanvas.style.display = '';
    const sec = hitElement ? hitElement.closest('section') : document.querySelector('section');
    const widget = document.getElementById('mps-timer-widget');
    if(!widget) return;
    if (sec && sec.querySelector('[data-timer]')) {
      const val = sec.querySelector('[data-timer]').getAttribute('data-timer');
      let seconds = val.includes(':') ? (parseInt(val.split(':')[0]) * 60) + parseInt(val.split(':')[1]) : parseInt(val) * 60;
      if (seconds !== defaultSeconds) { stopTimer(); defaultSeconds = seconds; remainingSeconds = seconds; widget.style.display = 'flex'; startTimer(); } else { widget.style.display = 'flex'; }
    } else { widget.style.display = 'none'; stopTimer(); }
  };
  window.addEventListener('hashchange', () => setTimeout(checkTimer, 100));
  window.addEventListener('popstate', () => setTimeout(checkTimer, 100));
  document.addEventListener('click', (e) => { if (!e.target.closest('#mps-footer')) document.querySelectorAll('.mps-popover').forEach(p => p.style.display = 'none'); });
  window.addEventListener('keyup', (e) => { if(['ArrowRight','ArrowLeft',' '].includes(e.key)) setTimeout(checkTimer, 100); });
  
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(initCanvas, 300)); else setTimeout(initCanvas, 300);
})();
</script>
`;