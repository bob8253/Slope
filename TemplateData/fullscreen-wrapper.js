// fullscreen-wrapper.js
// Initialize UnityLoader.instantiate only after a user gesture. Attempt to enter fullscreen and keep the container sized to the viewport.

(function () {
  const startBtn = document.getElementById('startBtn');
  const splash = document.getElementById('splashOverlay');
  const gameContainer = document.getElementById('gameContainer');

  function styleContainer() {
    gameContainer.style.width = window.innerWidth + 'px';
    gameContainer.style.height = window.innerHeight + 'px';
  }

  styleContainer();
  window.addEventListener('resize', styleContainer);

  let gameInstance = null;
  let unityLoaded = false;

  function enterFullscreenIfPossible(element) {
    if (!element) return;
    if (element.requestFullscreen) {
      element.requestFullscreen({ navigationUI: 'hide' }).catch(()=>{});
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    }
  }

  function startUnity() {
    if (unityLoaded) return;
    try {
      gameInstance = UnityLoader.instantiate("gameContainer", "Build/slope.json", {
        onProgress: function(gI, progress) {
          if (typeof UnityProgress === 'function') {
            try { UnityProgress(gI, progress); } catch(e) {}
          }
          if (progress === 1) {
            hideSplash();
          }
        },
        Module: {
          onRuntimeInitialized: function () {
            // runtime ready
          }
        }
      });
      unityLoaded = true;
    } catch (err) {
      console.error('UnityLoader.instantiate failed:', err);
      hideSplash();
      return;
    }

    enterFullscreenIfPossible(document.documentElement);
  }

  function hideSplash() {
    if (splash) splash.classList.add('hidden');
  }

  startBtn.addEventListener('click', function onStartClick(e) {
    startUnity();
    hideSplash();
  }, { once: true });

  splash.addEventListener('click', function (e) {
    if (e.target === startBtn) return;
    startUnity();
    hideSplash();
  }, { once: true });

  document.addEventListener('fullscreenchange', function () {
    styleContainer();
  });

  document.addEventListener('visibilitychange', function () {
    if (!gameInstance || !gameInstance.SendMessage) return;
    try {
      if (document.hidden) {
        // gameInstance.SendMessage('GameManager','OnPause');
      } else {
        // gameInstance.SendMessage('GameManager','OnResume');
      }
    } catch (e) {}
  });
})();
