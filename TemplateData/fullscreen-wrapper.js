// Fullscreen + resize wrapper
// Assumptions:
// - The game exposes an initialization method that accepts a canvas or has global hooks named `initGame(canvas)`
// - If the game uses Three.js or WebGL, it should expose renderer and camera or accept resize params.
// If the repo's game is structured differently, adapt the calls below to invoke the game's init/resize API.

(function () {
  const canvas = document.getElementById('gameCanvas');
  const overlay = document.getElementById('overlay');
  const startBtn = document.getElementById('startBtn');

  // Example API hooks the game should provide; replace these with the actual game functions.
  // If the repo produces a single self-contained script that finds the canvas by id, you can omit explicit init.
  const game = window.SlopeGame || {
    // If your game has an initializer that accepts a canvas element, it can be used here:
    init: function (canvasEl) {
      // placeholder if game.js already does initialization automatically, leave blank
      console.warn('SlopeGame.init not found. Ensure the game script is loaded and exposes an init method or uses #gameCanvas id.');
    },
    onResize: function (w, h) {
      // placeholder to be overridden by the actual game (e.g., renderer.setSize)
    }
  };

  function resizeCanvasToWindow() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.floor(window.innerWidth);
    const height = Math.floor(window.innerHeight);

    // Set canvas CSS full size (already via CSS) — set actual pixel buffer to DPR-scaled size
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    // If the game's renderer needs explicit size or camera aspect update, call hook
    if (typeof game.onResize === 'function') {
      try {
        game.onResize(width, height, dpr);
      } catch (err) {
        console.warn('game.onResize error:', err);
      }
    }
  }

  function enterFullscreen() {
    // overlay hides after entering fullscreen
    if (document.fullscreenElement == null && canvas.requestFullscreen) {
      canvas.requestFullscreen({ navigationUI: 'hide' }).catch(err => {
        console.warn('requestFullscreen failed:', err);
      });
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
  }

  function requestPointerLock() {
    // pointer lock (desktop): click to lock
    if (canvas.requestPointerLock) {
      canvas.requestPointerLock();
    } else if (canvas.mozRequestPointerLock) {
      canvas.mozRequestPointerLock();
    }
  }

  function onUserStart() {
    // Hide overlay
    overlay.style.display = 'none';

    // initialize the game if an API is available
    try {
      if (typeof game.init === 'function') {
        game.init(canvas);
      }
    } catch (err) {
      console.warn('game.init error:', err);
    }

    // Resize to current window
    resizeCanvasToWindow();

    // Request fullscreen (must be user gesture)
    enterFullscreen();

    // On desktop, optionally request pointer lock after click
    requestPointerLock();
  }

  // Start button only used to get a user gesture (browsers require it)
  startBtn.addEventListener('click', onUserStart, { once: true });

  // Also support clicking anywhere on overlay to start (touch)
  overlay.addEventListener('click', function onOverlayClick(e) {
    if (e.target === startBtn) return;
    onUserStart();
  }, { once: true });

  // Resize handling
  window.addEventListener('resize', () => {
    // Debounce could be added if needed
    resizeCanvasToWindow();
  });

  // Listen for fullscreenchange to re-run resize when entering/exiting fullscreen
  document.addEventListener('fullscreenchange', () => {
    resizeCanvasToWindow();
  });

  // If the game's script is synchronous and expects a canvas with a particular id,
  // initialization may already have occurred. Ensure a resize call still occurs.
  window.addEventListener('load', () => {
    // small delay to allow game to set up global hooks
    setTimeout(() => {
      resizeCanvasToWindow();
    }, 50);
  });

  // Visibility / focus handling to pause/unpause (hook into game if available)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (typeof game.onPause === 'function') game.onPause();
    } else {
      if (typeof game.onResume === 'function') game.onResume();
    }
  });

  // Optional: handle pointer lock change
  document.addEventListener('pointerlockchange', () => {
    const locked = document.pointerLockElement === canvas;
    if (!locked) {
      // user released pointer lock, optionally show overlay to re-lock
      // overlay.style.display = ''; // uncomment if you want to show overlay again
    }
  });
})();
