(function () {
  'use strict';

  /* ===== Existing Portfolio Functionality ===== */
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const navLinksAll = document.querySelectorAll('.nav-link');
  const backToTop = document.getElementById('backToTop');
  const contactForm = document.getElementById('contactForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');
  const successMessage = document.getElementById('successMessage');

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') body.classList.add('light-mode');

  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
  });

  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinksAll.forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));

  const progressBar = document.getElementById('progressBar');
  window.addEventListener('scroll', () => {
    const p = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = 'scaleX(' + (p > 0 ? window.scrollY / p : 0) + ')';
    backToTop.classList.toggle('visible', window.scrollY > 400);
  });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Observe sections for active nav link
  const secObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const link = document.querySelector('.nav-link[href="#' + e.target.id + '"]');
      if (!link) return;
      if (e.isIntersecting) {
        navLinksAll.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { threshold: 0.2, rootMargin: '-68px 0px -40% 0px' });
  document.querySelectorAll('section[id]').forEach(s => secObs.observe(s));

  // Form
  function valName() { const v = nameInput.value.trim(); nameError.textContent = v ? '' : 'Name is required.'; return !!v; }
  function valEmail() { const v = emailInput.value.trim(); if (!v) { emailError.textContent = 'Email is required.'; return false; } if (!v.includes('@') || !v.includes('.')) { emailError.textContent = 'Enter a valid email.'; return false; } emailError.textContent = ''; return true; }
  function valMsg() { const v = messageInput.value.trim(); messageError.textContent = v ? '' : 'Message is required.'; return !!v; }
  nameInput.addEventListener('blur', valName);
  emailInput.addEventListener('blur', valEmail);
  messageInput.addEventListener('blur', valMsg);
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (valName() & valEmail() & valMsg()) {
      successMessage.classList.add('show');
      contactForm.reset();
      setTimeout(() => successMessage.classList.remove('show'), 5000);
    }
  });

  // Scroll Reveal
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => e.isIntersecting ? e.target.classList.add('visible') : e.target.classList.remove('visible'));
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  /* ===== Protocol Sigma: The Fragment Defusal ===== */
  const overlay = document.getElementById('gameOverlay');
  const threeContainer = document.getElementById('threeContainer');
  const gameUI = document.getElementById('gameUI');
  const skipBtn = document.getElementById('globalSkipBtn');

  const sigmaStart = document.getElementById('sigmaStart');
  const sigmaHUD = document.getElementById('sigmaHUD');
  const sigmaPlay = document.getElementById('sigmaPlay');
  const sigmaKeypad = document.getElementById('sigmaKeypad');
  const sigmaReward = document.getElementById('sigmaReward');
  const sigmaModules = document.getElementById('sigmaModules');
  const sigmaPlayContent = document.getElementById('sigmaPlayContent');
  const sigmaPlayName = document.getElementById('sigmaPlayName');
  const sigmaTimer = document.getElementById('sigmaTimer');
  const sigmaKeyGrid = document.getElementById('sigmaKeyGrid');
  const sigmaKeyFeed = document.getElementById('sigmaKeyFeedback');

  const MODULE_DIGITS = ['1', '7', '5', '4'];
  const MODULE_NAMES = ['WIRES', 'CIPHER', 'PATTERN', 'LOGIC GATE'];
  const MODULE_ICONS = ['\u26A1', '\uD83D\uDD10', '\u25C6', '\u229C'];
  const MODULE_HINTS = ['About — find the age', 'Fragments — count the steps', 'Skills — tally the tools', 'Projects — count the builds'];

  let collectedDigits = [null, null, null, null];
  let timeLeft = 300;
  let timerInterval = null;
  let currentModule = -1;
  let scene, camera, renderer;
  let backgroundGroup = null;
  let floatShapes = [];
  let starField = null;
  let hitParticles = null;
  let clock = new THREE.Clock();
  let animFrameId = null;
  let gameActive = false;
  let gameStarted = false;

  function showScreen(el) {
    [sigmaStart, sigmaHUD, sigmaPlay, sigmaKeypad, sigmaReward, document.getElementById('sigmaThemeStudio')].forEach(function(e) {
      if (e) e.style.display = 'none';
    });
    if (el) el.style.display = 'flex';
  }

  function updateTimer() {
    var m = String(Math.floor(timeLeft / 60));
    if (m.length < 2) m = '0' + m;
    var s = String(timeLeft % 60);
    if (s.length < 2) s = '0' + s;
    sigmaTimer.textContent = m + ':' + s;
    sigmaTimer.style.color = timeLeft <= 60 ? (timeLeft <= 15 ? '#ff3355' : '#ffb000') : '#00f0ff';
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(function() {
      timeLeft--;
      updateTimer();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        failMission();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  }

  function failMission() {
    gameStarted = false;
    collectedDigits = [null, null, null, null];
    timeLeft = 300;
    currentModule = -1;
    updateTimer();
    showScreen(sigmaStart);
  }

  function cleanupThree() {
    if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    if (scene) {
      scene.traverse(function(obj) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(function(m) { m.dispose(); });
          else obj.material.dispose();
        }
      });
    }
    if (renderer) { renderer.dispose(); renderer = null; }
    if (threeContainer) threeContainer.innerHTML = '';
  }

  function skipToPortfolio() {
    gameActive = false;
    gameStarted = false;
    stopTimer();
    cleanupThree();
    overlay.classList.remove('active');
    document.querySelectorAll('[data-reveal]').forEach(function(el) { el.classList.add('visible'); });
  }

  skipBtn.addEventListener('click', skipToPortfolio);
  navLinksAll.forEach(function(l) {
    l.addEventListener('click', function() {
      if (overlay.classList.contains('active')) skipToPortfolio();
    });
  });

  function initThree() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07090F);
    camera = new THREE.PerspectiveCamera(60, threeContainer.clientWidth / threeContainer.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 10);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(threeContainer.clientWidth, threeContainer.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    threeContainer.appendChild(renderer.domElement);
    scene.add(new THREE.AmbientLight(0x222244, 0.5));
    var fl = new THREE.DirectionalLight(0x4466ff, 1.0);
    fl.position.set(-5, 5, 10); scene.add(fl);
    var wl = new THREE.DirectionalLight(0xff8844, 0.6);
    wl.position.set(5, -3, 5); scene.add(wl);
    window.addEventListener('resize', onResize);
  }

  function onResize() {
    if (!camera || !renderer) return;
    var w = threeContainer.clientWidth;
    var h = threeContainer.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function buildBackground() {
    backgroundGroup = new THREE.Group();
    scene.add(backgroundGroup);
    var starCount = 800;
    var starGeo = new THREE.BufferGeometry();
    var starPos = new Float32Array(starCount * 3);
    for (var i = 0; i < starCount; i++) {
      starPos[i*3] = (Math.random() - 0.5) * 60;
      starPos[i*3+1] = (Math.random() - 0.5) * 40;
      starPos[i*3+2] = (Math.random() - 0.5) * 30 - 5;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starField = new THREE.Points(starGeo, new THREE.PointsMaterial({
      size: 0.04, color: 0x8888ff, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    backgroundGroup.add(starField);
    var shapes = [
      { geo: new THREE.TorusKnotGeometry(1.0, 0.3, 64, 8), c: 0xf0a818, x: -3.5, y: 1, z: -4, rs: [0.3, 0.5, 0] },
      { geo: new THREE.IcosahedronGeometry(0.7, 0), c: 0x2dd4bf, x: 3.5, y: -1.5, z: -3, rs: [0.4, -0.3, 0.1] },
      { geo: new THREE.OctahedronGeometry(0.6, 0), c: 0xff5599, x: -2.5, y: -2, z: -5, rs: [-0.5, 0.2, 0] },
      { geo: new THREE.TorusGeometry(0.8, 0.25, 16, 32), c: 0x44ddff, x: 3, y: 2.5, z: -6, rs: [0.2, 0.6, 0] },
    ];
    shapes.forEach(function(s) {
      var mat = new THREE.MeshStandardMaterial({ color: s.c, roughness: 0.2, metalness: 0.3, emissive: s.c, emissiveIntensity: 0.2 });
      var mesh = new THREE.Mesh(s.geo, mat);
      mesh.position.set(s.x, s.y, s.z);
      mesh.userData.rotSpeed = s.rs;
      mesh.userData.basePos = new THREE.Vector3(s.x, s.y, s.z);
      backgroundGroup.add(mesh); floatShapes.push(mesh);
      var wireMat = new THREE.MeshBasicMaterial({ color: s.c, wireframe: true, transparent: true, opacity: 0.12 });
      var wire = new THREE.Mesh(s.geo.clone(), wireMat);
      wire.position.copy(mesh.position);
      wire.userData.rotSpeed = s.rs;
      wire.scale.set(1.03, 1.03, 1.03);
      backgroundGroup.add(wire); floatShapes.push(wire);
    });
    var grid = new THREE.GridHelper(14, 24, 0x222244, 0x111833);
    grid.position.y = -3.5;
    backgroundGroup.add(grid);
  }

  function spawnHitParticles(pos, color) {
    if (hitParticles) { scene.remove(hitParticles); hitParticles.geometry.dispose(); }
    var count = 40;
    var geo = new THREE.BufferGeometry();
    var p = new Float32Array(count * 3);
    var v = new Float32Array(count * 3);
    var c = new Float32Array(count * 3);
    for (var i = 0; i < count; i++) {
      p[i*3] = pos.x; p[i*3+1] = pos.y; p[i*3+2] = pos.z;
      var theta = Math.random() * Math.PI * 2;
      var phi = Math.random() * Math.PI;
      var speed = 0.08 + Math.random() * 0.12;
      v[i*3] = Math.sin(phi) * Math.cos(theta) * speed;
      v[i*3+1] = Math.cos(phi) * speed;
      v[i*3+2] = Math.sin(phi) * Math.sin(theta) * speed;
      var col = new THREE.Color(color);
      c[i*3] = col.r; c[i*3+1] = col.g; c[i*3+2] = col.b;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(p, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(c, 3));
    geo.userData.velocities = v; geo.userData.life = 1;
    hitParticles = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.1, vertexColors: true, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    scene.add(hitParticles);
  }

  function animateHitParticles() {
    if (!hitParticles) return;
    var p = hitParticles.geometry.attributes.position.array;
    var v = hitParticles.geometry.userData.velocities;
    var life = hitParticles.geometry.userData.life;
    life -= 0.02; hitParticles.geometry.userData.life = life;
    hitParticles.material.opacity = Math.max(0, life);
    for (var i = 0; i < p.length; i += 3) {
      p[i] += v[i]; p[i+1] += v[i+1]; p[i+2] += v[i+2];
      v[i+1] -= 0.002;
    }
    hitParticles.geometry.attributes.position.needsUpdate = true;
    if (life <= 0) { scene.remove(hitParticles); hitParticles.geometry.dispose(); hitParticles = null; }
  }

  // ===== MODULE RENDERING =====
  function renderModules() {
    sigmaModules.innerHTML = '';
    for (var i = 0; i < 4; i++) {
      var done = collectedDigits[i] !== null;
      var card = document.createElement('div');
      card.className = 'sigma-module' + (done ? ' completed' : '');
      card.innerHTML =
        '<div class="sigma-module-top">' +
          '<span class="sigma-module-icon">' + MODULE_ICONS[i] + '</span>' +
          '<span class="sigma-module-name">' + MODULE_NAMES[i] + '</span>' +
        '</div>' +
        '<div class="sigma-module-status">' + (done ? 'DIGIT: <span class="sigma-digit">' + collectedDigits[i] + '</span>' : '<span class="sigma-hint">' + MODULE_HINTS[i] + '</span>') + '</div>';
      if (!done && gameStarted) {
        card.addEventListener('click', (function(idx) { return function() { launchModule(idx); }; })(i));
      }
      sigmaModules.appendChild(card);
    }
    // Transition to keypad is handled in completeModule
  }

  function launchModule(index) {
    if (collectedDigits[index] !== null) return;
    currentModule = index;
    sigmaPlayName.textContent = 'MODULE ' + (index + 1) + ': ' + MODULE_NAMES[index];
    showScreen(sigmaPlay);
    switch (index) {
      case 0: renderWires(); break;
      case 1: renderCipher(); break;
      case 2: renderPattern(); break;
      case 3: renderGate(); break;
    }
  }

  // ===== MODULE 0: WIRES =====
  function renderWires() {
    var hot = new Set();
    while (hot.size < 2) hot.add(Math.floor(Math.random() * 6));
    var colors = ['#ff3355', '#00c8ff', '#ffb000', '#00ff41', '#aa66ff', '#ffffff'];
    var names = ['RED', 'BLUE', 'AMBER', 'GREEN', 'PURPLE', 'WHITE'];
    var clicked = new Set();
    var locked = false;

    var container = document.createElement('div');
    container.className = 'sigma-wires';
    var info = document.createElement('div');
    info.className = 'sigma-wires-info';
    info.textContent = 'Cut the 2 hot wires to disable the circuit.';
    container.appendChild(info);

    var grid = document.createElement('div');
    grid.className = 'sigma-wires-grid';

    for (var i = 0; i < 6; i++) {
      (function(idx) {
        var wire = document.createElement('button');
        wire.className = 'sigma-wire';
        wire.style.setProperty('--wire-color', colors[idx]);
        wire.innerHTML = '<span class="wire-label">' + names[idx] + '</span><span class="wire-line"><span class="wire-core"></span></span>';
        wire.addEventListener('click', function() {
          if (locked || clicked.has(idx)) return;
          clicked.add(idx);
          wire.classList.add('cut');
          if (hot.has(idx)) wire.classList.add('hot');
          else wire.classList.add('wrong');
          if (clicked.size === 2) {
            locked = true;
            setTimeout(function() {
              var allHot = true;
              clicked.forEach(function(c) { if (!hot.has(c)) allHot = false; });
              if (allHot) completeModule(0);
              else {
                grid.querySelectorAll('.sigma-wire').forEach(function(w) { w.classList.remove('cut', 'hot', 'wrong'); });
                clicked.clear(); locked = false;
              }
            }, 800);
          }
        });
        grid.appendChild(wire);
      })(i);
    }
    container.appendChild(grid);
    sigmaPlayContent.innerHTML = '';
    sigmaPlayContent.appendChild(container);
  }

  // ===== MODULE 1: CIPHER =====
  function renderCipher() {
    var encrypted = 'WKH#VLVWHP#LV#RXUV';
    function caesarShift(str, shift) {
      return str.split('').map(function(ch) {
        var code = ch.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          var c = (code - 65 - shift + 26) % 26;
          return String.fromCharCode(c + 65);
        }
        if (code >= 97 && code <= 122) {
          var c2 = (code - 97 - shift + 26) % 26;
          return String.fromCharCode(c2 + 97);
        }
        return ch;
      }).join('');
    }
    var correctShift = 3;
    var submitted = false;

    var container = document.createElement('div');
    container.className = 'sigma-cipher';
    var label = document.createElement('div');
    label.className = 'sigma-cipher-label';
    label.textContent = 'Decode the intercepted message. Adjust the shift until it reads correctly.';
    container.appendChild(label);

    var textDisplay = document.createElement('div');
    textDisplay.className = 'sigma-cipher-text';
    container.appendChild(textDisplay);

    var sliderWrap = document.createElement('div');
    sliderWrap.className = 'sigma-cipher-slider-wrap';
    var slider = document.createElement('input');
    slider.type = 'range'; slider.min = 1; slider.max = 25; slider.value = 1;
    slider.className = 'sigma-slider';
    var shiftLabel = document.createElement('div');
    shiftLabel.className = 'sigma-cipher-shift';

    function updateText() {
      var s = parseInt(slider.value);
      shiftLabel.textContent = 'Shift: ' + s;
      textDisplay.textContent = caesarShift(encrypted, s);
      textDisplay.className = 'sigma-cipher-text' + (s === correctShift ? ' decoded' : '');
    }
    slider.addEventListener('input', updateText);
    sliderWrap.appendChild(slider); sliderWrap.appendChild(shiftLabel);
    container.appendChild(sliderWrap);

    var btnWrap = document.createElement('div');
    btnWrap.className = 'sigma-cipher-btn';
    var submitBtn = document.createElement('button');
    submitBtn.className = 'sigma-btn primary';
    submitBtn.textContent = 'DECODE';
    submitBtn.addEventListener('click', function() {
      if (submitted) return;
      submitted = true;
      if (parseInt(slider.value) === correctShift) completeModule(1);
      else {
        textDisplay.classList.add('shake');
        setTimeout(function() { textDisplay.classList.remove('shake'); submitted = false; }, 500);
      }
    });
    btnWrap.appendChild(submitBtn);
    container.appendChild(btnWrap);

    sigmaPlayContent.innerHTML = '';
    sigmaPlayContent.appendChild(container);
    updateText();
  }

  // ===== MODULE 2: PATTERN =====
  function renderPattern() {
    var sequence = [];
    for (var i = 0; i < 5; i++) sequence.push(Math.floor(Math.random() * 9));
    var inputStep = 0;
    var playing = false;
    var accepting = false;

    var container = document.createElement('div');
    container.className = 'sigma-pattern';
    var info = document.createElement('div');
    info.className = 'sigma-pattern-info';
    info.textContent = 'Watch the sequence. Repeat it.';
    container.appendChild(info);

    var grid = document.createElement('div');
    grid.className = 'sigma-pattern-grid';
    var cells = [];
    for (var i2 = 0; i2 < 9; i2++) {
      (function(idx) {
        var cell = document.createElement('button');
        cell.className = 'sigma-pattern-cell';
        cell.addEventListener('click', function() {
          if (!accepting || playing) return;
          cell.classList.add('flash');
          setTimeout(function() { cell.classList.remove('flash'); }, 200);
          if (idx === sequence[inputStep]) {
            inputStep++;
            if (inputStep >= sequence.length) { accepting = false; setTimeout(function() { completeModule(2); }, 400); }
          } else {
            grid.querySelectorAll('.sigma-pattern-cell').forEach(function(c) { c.classList.add('wrong'); });
            setTimeout(function() {
              grid.querySelectorAll('.sigma-pattern-cell').forEach(function(c) { c.classList.remove('wrong'); });
              inputStep = 0;
              playSeq();
            }, 600);
          }
        });
        grid.appendChild(cell);
        cells.push(cell);
      })(i2);
    }
    container.appendChild(grid);

    function playSeq() {
      playing = true; accepting = false;
      var i3 = 0;
      function flashNext() {
        if (i3 >= sequence.length) { playing = false; accepting = true; return; }
        cells[sequence[i3]].classList.add('flash');
        setTimeout(function() {
          cells[sequence[i3]].classList.remove('flash');
          i3++; setTimeout(flashNext, 200);
        }, 400);
      }
      setTimeout(flashNext, 300);
    }

    sigmaPlayContent.innerHTML = '';
    sigmaPlayContent.appendChild(container);
    setTimeout(playSeq, 500);
  }

  // ===== MODULE 3: LOGIC GATE =====
  function renderGate() {
    var a = 0, b = 0;
    var container = document.createElement('div');
    container.className = 'sigma-gate';
    var info = document.createElement('div');
    info.className = 'sigma-gate-info';
    info.textContent = 'Set both inputs to 1 to make the AND gate output TRUE.';
    container.appendChild(info);

    var gateVisual = document.createElement('div');
    gateVisual.className = 'sigma-gate-visual';
    gateVisual.innerHTML =
      '<div class="sigma-gate-inputs">' +
        '<div class="sigma-gate-input"><span class="gate-label">A</span><button class="gate-toggle" id="gateA">0</button></div>' +
        '<div class="sigma-gate-input"><span class="gate-label">B</span><button class="gate-toggle" id="gateB">0</button></div>' +
      '</div>' +
      '<div class="sigma-gate-symbol">AND</div>' +
      '<div class="sigma-gate-output"><span class="gate-label">OUT</span><span class="gate-out-val" id="gateOut">0</span></div>';
    container.appendChild(gateVisual);

    var btnWrap = document.createElement('div');
    btnWrap.className = 'sigma-gate-btn';
    var verifyBtn = document.createElement('button');
    verifyBtn.className = 'sigma-btn primary';
    verifyBtn.textContent = 'VERIFY';
    btnWrap.appendChild(verifyBtn);
    container.appendChild(btnWrap);

    sigmaPlayContent.innerHTML = '';
    sigmaPlayContent.appendChild(container);

    function updateGate() {
      document.getElementById('gateA').textContent = a; document.getElementById('gateA').dataset.v = a;
      document.getElementById('gateB').textContent = b; document.getElementById('gateB').dataset.v = b;
      var out = (a && b) ? '1' : '0';
      document.getElementById('gateOut').textContent = out; document.getElementById('gateOut').dataset.v = out;
    }
    document.getElementById('gateA').addEventListener('click', function() { a = a ? 0 : 1; updateGate(); });
    document.getElementById('gateB').addEventListener('click', function() { b = b ? 0 : 1; updateGate(); });
    verifyBtn.addEventListener('click', function() {
      if (a && b) completeModule(3);
      else {
        document.getElementById('gateOut').style.color = '#ff3355';
        setTimeout(function() { document.getElementById('gateOut').style.color = ''; }, 500);
      }
    });
  }

  // ===== GAME STATE PERSISTENCE =====
  function saveGameState() {
    if (!gameActive) return;
    try { localStorage.setItem('sigma_state', JSON.stringify({ collectedDigits: collectedDigits, timeLeft: timeLeft, gameStarted: gameStarted, timestamp: Date.now() })); } catch (e) {}
  }
  function clearGameState() {
    try { localStorage.removeItem('sigma_state'); } catch (e) {}
  }
  function loadGameState() {
    try { var s = localStorage.getItem('sigma_state'); if (s) return JSON.parse(s); } catch (e) {}
    return null;
  }

  // ===== COMPLETE MODULE =====
  function completeModule(index) {
    collectedDigits[index] = MODULE_DIGITS[index];
    spawnHitParticles({ x: (Math.random() - 0.5) * 6, y: (Math.random() - 0.5) * 4, z: -2 }, [0x00f0ff, 0xffb000, 0x00ff41, 0xff5599][index]);
    currentModule = -1;
    saveGameState();
    renderModules();
    showScreen(sigmaHUD);
    if (collectedDigits.every(function(d) { return d !== null; })) {
      setTimeout(showKeypad, 1400);
    }
  }

  // ===== KEYPAD =====
  function showKeypad() {
    stopTimer();
    showScreen(sigmaKeypad);
    var slots = document.querySelectorAll('.key-slot');
    var entered = [];
    slots.forEach(function(s) { s.textContent = '_'; });
    sigmaKeyFeed.textContent = ''; sigmaKeyFeed.className = 'sigma-key-feedback';

    if (sigmaKeyGrid._handler) sigmaKeyGrid.removeEventListener('click', sigmaKeyGrid._handler);
    var handler = function(e) {
      var btn = e.target.closest('.key-btn');
      if (!btn) return;
      var action = btn.dataset.action;
      var n = btn.dataset.n;
      if (action === 'clear') {
        entered.length = 0;
        slots.forEach(function(s) { s.textContent = '_'; });
        sigmaKeyFeed.textContent = ''; sigmaKeyFeed.className = 'sigma-key-feedback';
      } else if (action === 'submit') {
        if (entered.length < 4) { sigmaKeyFeed.textContent = 'ENTER 4 DIGITS'; sigmaKeyFeed.className = 'sigma-key-feedback error'; return; }
        var code = entered.join('');
        if (code === MODULE_DIGITS.join('')) {
          sigmaKeyFeed.textContent = 'ACCESS GRANTED'; sigmaKeyFeed.className = 'sigma-key-feedback success';
          setTimeout(showReward, 800);
        } else {
          sigmaKeyFeed.textContent = 'INVALID CODE - RETRY'; sigmaKeyFeed.className = 'sigma-key-feedback error';
          setTimeout(function() {
            entered.length = 0; slots.forEach(function(s) { s.textContent = '_'; });
            sigmaKeyFeed.textContent = ''; sigmaKeyFeed.className = 'sigma-key-feedback';
          }, 1000);
        }
      } else if (n !== undefined) {
        if (entered.length < 4) { entered.push(n); slots[entered.length - 1].textContent = n; }
      }
    };
    sigmaKeyGrid.addEventListener('click', handler);
    sigmaKeyGrid._handler = handler;
  }

  // ===== REWARD =====
  function showReward() {
    clearGameState();
    try { localStorage.setItem('sigma_unlocked', JSON.stringify({ unlocked: true, timestamp: Date.now() })); } catch (e) {}
    var badge = document.querySelector('.sigma-badge-icon');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'sigma-badge-icon';
      badge.title = 'Systems Architect - Unlocked via Protocol Sigma';
      var logo = document.querySelector('.nav-logo');
      if (logo && logo.parentNode) logo.parentNode.insertBefore(badge, logo.nextSibling);
    }
    setupBadgeClick();
    showScreen(sigmaReward);
    for (var i = 0; i < 8; i++) {
      setTimeout(function(j) {
        return function() {
          spawnHitParticles({ x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 6, z: -3 }, [0x00f0ff, 0xffb000, 0x00ff41, 0xf0a818, 0xff5599, 0x44ddff][j % 6]);
        };
      }(i), i * 200);
    }
  }

  document.getElementById('sigmaRewardBtn').addEventListener('click', skipToPortfolio);

  // ===== THEME ENGINE =====
  const THEMES = [
    { id: 'cipher', name: 'Cipher', primary: '#00F0FF', palette: ['#00F0FF', '#FF3366', '#FF5599'] },
    { id: 'ember', name: 'Ember', primary: '#FF6B35', palette: ['#FF6B35', '#FFB800', '#FF4444'] },
    { id: 'frost', name: 'Frost', primary: '#60A5FA', palette: ['#60A5FA', '#34D399', '#F472B6'] },
    { id: 'matrix', name: 'Matrix', primary: '#00FF41', palette: ['#00FF41', '#00CCFF', '#FF0040'] },
    { id: 'royal', name: 'Royal', primary: '#A855F7', palette: ['#A855F7', '#F59E0B', '#EF4444'] },
  ];

  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1,3), 16);
    var g = parseInt(hex.slice(3,5), 16);
    var b = parseInt(hex.slice(5,7), 16);
    return [r, g, b];
  }
  function rgbToHex(r, g, b) {
    r = Math.max(0, Math.min(255, Math.round(r)));
    g = Math.max(0, Math.min(255, Math.round(g)));
    b = Math.max(0, Math.min(255, Math.round(b)));
    return '#' + [r, g, b].map(function(v) { return v.toString(16).padStart(2, '0'); }).join('');
  }
  function darken(hex, amt) {
    var c = hexToRgb(hex);
    return rgbToHex(c[0] * (1 - amt), c[1] * (1 - amt), c[2] * (1 - amt));
  }
  function lighten(hex, amt) {
    var c = hexToRgb(hex);
    return rgbToHex(c[0] + (255 - c[0]) * amt, c[1] + (255 - c[1]) * amt, c[2] + (255 - c[2]) * amt);
  }
  function alpha(hex, a) {
    var c = hexToRgb(hex);
    return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
  }

  function applyCustomTheme(col) {
    var body = document.body;
    THEMES.forEach(function(t) { body.classList.remove('theme-' + t.id); });
    body.classList.add('theme-custom');
    var style = body.style;
    style.setProperty('--primary', col.primary);
    style.setProperty('--primary-dim', darken(col.primary, 0.25));
    style.setProperty('--primary-glow', alpha(col.primary, 0.15));
    style.setProperty('--secondary', col.secondary);
    style.setProperty('--accent', col.accent);
    style.setProperty('--bg', col.bg);
    style.setProperty('--bg-card', lighten(col.bg, 0.05));
    style.setProperty('--surface', lighten(col.bg, 0.08));
    style.setProperty('--text', col.text);
    style.setProperty('--text-muted', alpha(col.text, 0.55));
    style.setProperty('--text-dim', alpha(col.text, 0.42));
    style.setProperty('--border', lighten(col.bg, 0.10));
    style.setProperty('--shadow', 'rgba(0,0,0,0.4)');
    style.setProperty('--nav-bg', alpha(col.bg, 0.92));
    style.setProperty('--footer-bg', darken(col.bg, 0.15));
    style.setProperty('--badge-bg', alpha(col.primary, 0.12));
    style.setProperty('--badge-text', col.primary);
    style.setProperty('--input-bg', lighten(col.bg, 0.05));
    style.setProperty('--input-border', lighten(col.bg, 0.12));
    style.setProperty('--success-bg', alpha(col.secondary, 0.12));
    style.setProperty('--success-text', col.secondary);
    style.setProperty('--error-color', col.accent);
  }

  function clearCustomTheme() {
    var body = document.body;
    body.classList.remove('theme-custom');
    var style = body.style;
    var props = ['--primary','--primary-dim','--primary-glow','--secondary','--accent','--bg','--bg-card','--surface','--text','--text-muted','--text-dim','--border','--shadow','--nav-bg','--footer-bg','--badge-bg','--badge-text','--input-bg','--input-border','--success-bg','--success-text','--error-color'];
    props.forEach(function(p) { style.removeProperty(p); });
  }

  function getDefaultCustomColors() {
    var s = getComputedStyle(document.body);
    return {
      primary: s.getPropertyValue('--primary').trim() || '#F0A818',
      secondary: s.getPropertyValue('--secondary').trim() || '#2DD4BF',
      accent: s.getPropertyValue('--accent').trim() || '#F05252',
      bg: s.getPropertyValue('--bg').trim() || '#0B0F1A',
      text: s.getPropertyValue('--text').trim() || '#E8EDF5',
    };
  }

  var currentThemeId = null;

  function applyTheme(themeId) {
    currentThemeId = themeId || null;
    clearCustomTheme();
    var body = document.body;
    THEMES.forEach(function(t) { body.classList.remove('theme-' + t.id); });

    if (themeId === 'custom') {
      var saved = loadCustomColors();
      applyCustomTheme(saved);
      localStorage.setItem('sigma_theme', 'custom');
    } else if (themeId && themeId !== 'default') {
      body.classList.add('theme-' + themeId);
      localStorage.setItem('sigma_theme', themeId);
    } else {
      localStorage.removeItem('sigma_theme');
    }
    var cards = document.querySelectorAll('.sigma-theme-card');
    cards.forEach(function(c) { c.classList.toggle('active', c.dataset.theme === themeId); });
    // sync custom picker if visible
    if (themeId === 'custom' && document.getElementById('sigmaThemeCustom').style.display !== 'none') {
      syncCustomPicker();
    }
  }

  function saveCustomColors(col) {
    try { localStorage.setItem('sigma_custom', JSON.stringify(col)); } catch (e) {}
  }
  function loadCustomColors() {
    try {
      var s = localStorage.getItem('sigma_custom');
      if (s) return JSON.parse(s);
    } catch (e) {}
    return getDefaultCustomColors();
  }

  function loadSavedTheme() {
    try {
      var saved = JSON.parse(localStorage.getItem('sigma_unlocked'));
      if (saved && saved.unlocked) {
        var themeId = localStorage.getItem('sigma_theme');
        if (themeId) applyTheme(themeId);
      }
    } catch (e) {}
  }

  function renderThemeGrid() {
    var grid = document.getElementById('sigmaThemeGrid');
    if (!grid) return;
    var activeTheme = localStorage.getItem('sigma_theme');
    grid.innerHTML = '';
    var def = document.createElement('div');
    def.className = 'sigma-theme-card' + (activeTheme ? '' : ' active');
    def.dataset.theme = '';
    def.innerHTML = '<div class="sigma-theme-swatch" style="background:var(--primary,#F0A818)"></div><div><div class="sigma-theme-card-name">Default</div><div class="sigma-theme-card-preview"><div class="sigma-theme-dot" style="background:#F0A818"></div><div class="sigma-theme-dot" style="background:#2DD4BF"></div><div class="sigma-theme-dot" style="background:#F05252"></div></div></div>';
    def.addEventListener('click', function() { applyTheme(''); });
    grid.appendChild(def);
    THEMES.forEach(function(t) {
      var card = document.createElement('div');
      card.className = 'sigma-theme-card' + (activeTheme === t.id ? ' active' : '');
      card.dataset.theme = t.id;
      var dots = t.palette.map(function(c) { return '<div class="sigma-theme-dot" style="background:' + c + '"></div>'; }).join('');
      card.innerHTML = '<div class="sigma-theme-swatch" style="background:' + t.primary + '"></div><div><div class="sigma-theme-card-name">' + t.name + '</div><div class="sigma-theme-card-preview">' + dots + '</div></div>';
      card.addEventListener('click', function() { applyTheme(t.id); });
      grid.appendChild(card);
    });
    // Custom card
    var cus = document.createElement('div');
    cus.className = 'sigma-theme-card' + (activeTheme === 'custom' ? ' active' : '');
    cus.dataset.theme = 'custom';
    cus.innerHTML = '<div class="sigma-theme-swatch" style="background:linear-gradient(135deg,#FF6B35,#A855F7,#00F0FF)"></div><div><div class="sigma-theme-card-name">Custom</div><div class="sigma-theme-card-preview"><div class="sigma-theme-dot" style="background:#888"></div><div class="sigma-theme-dot" style="background:#aaa"></div><div class="sigma-theme-dot" style="background:#ccc"></div></div></div>';
    cus.addEventListener('click', function() { showCustomPicker(); });
    grid.appendChild(cus);
  }

  function syncCustomPicker() {
    var cols = currentThemeId === 'custom' ? loadCustomColors() : getDefaultCustomColors();
    document.getElementById('sigmaPickPrimary').value = cols.primary;
    document.getElementById('sigmaPickSecondary').value = cols.secondary;
    document.getElementById('sigmaPickAccent').value = cols.accent;
    document.getElementById('sigmaPickBg').value = cols.bg;
    document.getElementById('sigmaPickText').value = cols.text;
  }

  function showCustomPicker() {
    document.getElementById('sigmaThemeGrid').style.display = 'none';
    var panel = document.getElementById('sigmaThemeCustom');
    panel.style.display = 'block';
    document.getElementById('sigmaThemeSub').textContent = 'Pick your own colors. Changes apply instantly.';
    // If not already in custom mode, initialize with current defaults
    if (currentThemeId !== 'custom') {
      var initCols = getDefaultCustomColors();
      syncCustomPicker();
      applyCustomTheme(initCols);
      saveCustomColors(initCols);
      localStorage.setItem('sigma_theme', 'custom');
      currentThemeId = 'custom';
      document.querySelectorAll('.sigma-theme-card').forEach(function(c) { c.classList.toggle('active', c.dataset.theme === 'custom'); });
    } else {
      syncCustomPicker();
    }
  }

  function hideCustomPicker() {
    document.getElementById('sigmaThemeGrid').style.display = 'grid';
    document.getElementById('sigmaThemeCustom').style.display = 'none';
    document.getElementById('sigmaThemeSub').textContent = 'Choose an exclusive palette. Your reward for cracking the code.';
    renderThemeGrid();
  }

  function ensureCustomSaved() {
    var cols = {
      primary: document.getElementById('sigmaPickPrimary').value,
      secondary: document.getElementById('sigmaPickSecondary').value,
      accent: document.getElementById('sigmaPickAccent').value,
      bg: document.getElementById('sigmaPickBg').value,
      text: document.getElementById('sigmaPickText').value,
    };
    applyCustomTheme(cols);
    saveCustomColors(cols);
  }

  function showThemeStudio() {
    document.getElementById('sigmaThemeGrid').style.display = 'grid';
    document.getElementById('sigmaThemeCustom').style.display = 'none';
    document.getElementById('sigmaThemeSub').textContent = 'Choose an exclusive palette. Your reward for cracking the code.';
    renderThemeGrid();
    showScreen(document.getElementById('sigmaThemeStudio'));
    if (!overlay.classList.contains('active')) overlay.classList.add('active');
  }

  // Color picker live-update
  document.getElementById('sigmaPickPrimary').addEventListener('input', ensureCustomSaved);
  document.getElementById('sigmaPickSecondary').addEventListener('input', ensureCustomSaved);
  document.getElementById('sigmaPickAccent').addEventListener('input', ensureCustomSaved);
  document.getElementById('sigmaPickBg').addEventListener('input', ensureCustomSaved);
  document.getElementById('sigmaPickText').addEventListener('input', ensureCustomSaved);
  document.getElementById('sigmaCustomBack').addEventListener('click', hideCustomPicker);

  function setupBadgeClick() {
    var badge = document.querySelector('.sigma-badge-icon');
    if (badge && !badge._themeClick) { badge.addEventListener('click', showThemeStudio); badge._themeClick = true; }
  }

  document.getElementById('sigmaThemeRewardBtn').addEventListener('click', showThemeStudio);
  document.getElementById('sigmaThemeClose').addEventListener('click', skipToPortfolio);
  document.getElementById('sigmaThemeBack').addEventListener('click', skipToPortfolio);

  // ===== START / NAV =====
  function startProtocolSigma() {
    gameActive = true;
    initThree(); buildBackground();
    clock = new THREE.Clock(); animate();
    var saved = loadGameState();
    if (saved) {
      collectedDigits = saved.collectedDigits;
      timeLeft = Math.max(0, saved.timeLeft - Math.floor((Date.now() - saved.timestamp) / 1000));
      gameStarted = saved.gameStarted;
      currentModule = -1;
      renderModules();
      if (timeLeft <= 0) { failMission(); return; }
      if (collectedDigits.every(function(d) { return d !== null; })) { showKeypad(); }
      else { showScreen(sigmaHUD); updateTimer(); }
    } else {
      collectedDigits = [null, null, null, null];
      timeLeft = 300; currentModule = -1; gameStarted = false;
      renderModules(); showScreen(sigmaStart); updateTimer();
    }
  }

  // Show previously unlocked badge &amp; theme on page load
  (function() {
    try {
      var saved = JSON.parse(localStorage.getItem('sigma_unlocked'));
      if (saved && saved.unlocked) {
        var badge = document.createElement('div');
        badge.className = 'sigma-badge-icon';
        badge.title = 'Theme Studio - Click to customize';
        var logo = document.querySelector('.nav-logo');
        if (logo && logo.parentNode) logo.parentNode.insertBefore(badge, logo.nextSibling);
        setupBadgeClick();
      }
    } catch (e) {}
    loadSavedTheme();
  })();

  document.getElementById('sigmaPlayBack').addEventListener('click', function() {
    currentModule = -1;
    renderModules();
    if (collectedDigits.every(function(d) { return d !== null; })) showKeypad();
    else showScreen(sigmaHUD);
  });

  document.getElementById('sigmaInitBtn').addEventListener('click', function() {
    gameStarted = true; startTimer(); renderModules(); showScreen(sigmaHUD);
  });

  document.getElementById('sigmaAbort').addEventListener('click', function() {
    stopTimer(); gameStarted = false;
    collectedDigits = [null, null, null, null]; timeLeft = 300; currentModule = -1;
    clearGameState();
    renderModules(); showScreen(sigmaStart); updateTimer();
  });

  document.getElementById('sigmaCodeBtn').addEventListener('click', function() {
    showKeypad();
  });

  document.getElementById('sigmaStartSkip').addEventListener('click', skipToPortfolio);

  // ===== MAIN LOOP =====
  function animate() {
    if (!gameActive) return;
    animFrameId = requestAnimationFrame(animate);
    var delta = clock.getDelta();
    var t = Date.now() * 0.001;
    floatShapes.forEach(function(mesh) {
      var rs = mesh.userData.rotSpeed || [0, 0, 0];
      mesh.rotation.x += rs[0] * delta;
      mesh.rotation.y += rs[1] * delta;
      mesh.rotation.z += rs[2] * delta;
      if (mesh.userData.basePos) {
        var bp = mesh.userData.basePos;
        mesh.position.x = bp.x + Math.sin(t * 0.3 + bp.y) * 0.2;
        mesh.position.y = bp.y + Math.cos(t * 0.4 + bp.x) * 0.2;
      }
    });
    if (starField) starField.rotation.y += delta * 0.015;
    if (hitParticles) animateHitParticles();
    renderer.render(scene, camera);
  }

  // Easter egg triggers
  var eggBtn = document.getElementById('easterEggBtn');
  if (eggBtn) {
    eggBtn.addEventListener('click', function() {
      overlay.classList.add('active');
      if (!gameActive) startProtocolSigma();
    });
  }

  var logoClicks = 0;
  var logo = document.querySelector('.nav-logo');
  if (logo) {
    logo.addEventListener('click', function() {
      logoClicks++;
      if (logoClicks >= 3) { logoClicks = 0; overlay.classList.add('active'); if (!gameActive) startProtocolSigma(); }
      setTimeout(function() { logoClicks = 0; }, 2000);
    });
  }

  // ===== KONAMI TERMINAL =====
  var termOverlay = document.getElementById('terminalOverlay');
  var termOutput = document.getElementById('terminalOutput');
  var termInput = document.getElementById('terminalInput');
  var termEnabled = false;
  var cmdHistory = [];
  var cmdIndex = -1;

  function termWriteln(text, cls) {
    var line = document.createElement('div');
    line.className = 'terminal-line' + (cls ? ' ' + cls : '');
    line.textContent = text;
    termOutput.appendChild(line);
    termOutput.scrollTop = termOutput.scrollHeight;
  }

  function termWrite(text, cls) {
    var line = document.createElement('div');
    line.className = 'terminal-line' + (cls ? ' ' + cls : '');
    line.textContent = text;
    termOutput.appendChild(line);
    termOutput.scrollTop = termOutput.scrollHeight;
  }

  function activateTerminal() {
    if (termEnabled) return;
    termEnabled = true;
    termOverlay.style.display = 'flex';
    termOutput.innerHTML = '';
    termWriteln('Initialising terminal session...', 'dim');
    termWriteln('Connected to jebasingh.github.io', 'success');
    termWriteln('');
    termWriteln('  ██╗███████╗██████╗  █████╗ ███████╗██╗███╗   ██╗ ██████╗ ');
    termWriteln('  ██║██╔════╝██╔══██╗██╔══██╗██╔════╝██║████╗  ██║██╔════╝ ');
    termWriteln('  ██║███████╗██████╔╝███████║█████╗  ██║██╔██╗ ██║██║  ███╗');
    termWriteln('  ██║╚════██║██╔══██╗██╔══██║██╔══╝  ██║██║╚██╗██║██║   ██║');
    termWriteln('  ██║███████║██████╔╝██║  ██║███████╗██║██║ ╚████║╚██████╔╝');
    termWriteln('  ╚═╝╚══════╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ');
    termWriteln('');
    termWriteln('  Systems Architect Portfolio — Terminal Interface', 'highlight');
    termWriteln('  Type help for available commands.', 'info');
    termWriteln('');
    setTimeout(function() { termInput.focus(); }, 100);
  }

  function deactivateTerminal() {
    termEnabled = false;
    termOverlay.style.display = 'none';
    termOutput.innerHTML = '';
    cmdHistory = [];
    cmdIndex = -1;
  }

  function getSectionText(id) {
    var el = document.getElementById(id);
    if (!el) return 'Section not found.';
    var text = el.textContent || el.innerText;
    return text.replace(/\s+/g, ' ').trim();
  }

  function fmtSection(id, label) {
    var el = document.getElementById(id);
    if (!el) return termWriteln('Section not found.', 'error');
    termWriteln('─── ' + label + ' ───', 'highlight');
    var items = el.querySelectorAll('h2, h3, h4, p, li, .skill-header, .project-card h3, .domain-card h3');
    items.forEach(function(item) {
      var t = item.textContent.trim();
      if (t.length > 80) t = t.slice(0, 80) + '...';
      if (item.tagName === 'H2' || item.tagName === 'H3' || item.tagName === 'H4') {
        termWriteln('  ' + t, 'highlight');
      } else {
        termWriteln('    ' + t, 'info');
      }
    });
  }

  function processTermCommand(cmd) {
    cmd = cmd.trim().toLowerCase();
    if (!cmd) return;
    cmdHistory.push(cmd);
    cmdIndex = cmdHistory.length;

    if (cmd === 'help') {
      termWriteln('Available commands:', 'highlight');
      termWriteln('  about        Display About section');
      termWriteln('  skills       Show skill proficiencies');
      termWriteln('  projects     List featured projects');
      termWriteln('  contact      View contact information');
      termWriteln('  help         Show this help message');
      termWriteln('  clear        Clear the terminal');
      termWriteln('  exit         Close terminal and return to site');
      termWriteln('  whoami       Display visitor information');
      termWriteln('  neofetch     Show system information');
      termWriteln('  theme        Open Theme Studio');
      termWriteln('  game         Launch Protocol Sigma');
      termWriteln('  ls           List sections');
      termWriteln('  date         Show current date and time');
      termWriteln('  banner       Show the welcome banner again');
      termWriteln('  sudo         Attempt superuser权限...');
    } else if (cmd === 'ls') {
      termWriteln('about/    skills/    projects/    contact/', 'info');
    } else if (cmd === 'about') {
      fmtSection('about', 'ABOUT');
    } else if (cmd === 'skills') {
      fmtSection('skills', 'PROFICIENCIES');
    } else if (cmd === 'projects') {
      fmtSection('projects', 'PROJECTS');
    } else if (cmd === 'contact') {
      fmtSection('contact', 'CONTACT');
    } else if (cmd === 'clear') {
      termOutput.innerHTML = '';
    } else if (cmd === 'exit') {
      deactivateTerminal();
    } else if (cmd === 'whoami') {
      termWriteln('You are a visitor exploring the Systems Architect portfolio.', 'info');
      termWriteln('Platform: ' + navigator.platform, 'dim');
      termWriteln('User Agent: ' + navigator.userAgent, 'dim');
    } else if (cmd === 'neofetch') {
      try {
        var chromeVer = navigator.appVersion.match(/Chrome\/(\S+)/);
        var kernel = chromeVer ? 'Chromium ' + chromeVer[1] : 'Vanilla JS';
        termWriteln('  OS: Portfolio OS v2.0', 'highlight');
        termWriteln('  Host: jebasingh.github.io', 'info');
        termWriteln('  Kernel: ' + kernel, 'info');
        termWriteln('  Shell: Terminal v1.0', 'info');
        termWriteln('  Resolution: ' + screen.width + 'x' + screen.height, 'dim');
        termWriteln('  Theme: ' + (document.body.classList.contains('light-mode') ? 'Light' : 'Dark'), 'dim');
        var themeName = localStorage.getItem('sigma_theme');
        if (themeName) termWriteln('  Sigma Theme: ' + themeName, 'dim');
      } catch (e) {};
    } else if (cmd === 'date') {
      termWriteln(new Date().toString(), 'info');
    } else if (cmd === 'banner') {
      termWriteln('  ██╗███████╗██████╗  █████╗ ███████╗██╗███╗   ██╗ ██████╗ ');
      termWriteln('  ██║██╔════╝██╔══██╗██╔══██╗██╔════╝██║████╗  ██║██╔════╝ ');
      termWriteln('  ██║███████╗██████╔╝███████║█████╗  ██║██╔██╗ ██║██║  ███╗');
      termWriteln('  ██║╚════██║██╔══██╗██╔══██║██╔══╝  ██║██║╚██╗██║██║   ██║');
      termWriteln('  ██║███████║██████╔╝██║  ██║███████╗██║██║ ╚████║╚██████╔╝');
      termWriteln('  ╚═╝╚══════╝╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ');
    } else if (cmd === 'theme') {
      deactivateTerminal();
      setTimeout(function() {
        var saved = localStorage.getItem('sigma_unlocked');
        if (saved) { showThemeStudio(); }
        else { termWriteln('Theme Studio not yet unlocked. Complete Protocol Sigma first.', 'error'); activateTerminal(); }
      }, 200);
    } else if (cmd === 'game') {
      deactivateTerminal();
      setTimeout(function() {
        overlay.classList.add('active');
        if (!gameActive) startProtocolSigma();
      }, 200);
    } else if (cmd === 'sudo') {
      termWriteln('Permission denied. This incident will be reported.', 'error');
      termWriteln('  You have been logged in the /var/log/audit.log', 'dim');
    } else if (cmd === '') {
      // no-op
    } else {
      termWriteln('Command not found: ' + cmd, 'error');
      termWriteln('Type help for available commands.', 'info');
    }
  }

  // Konami code: ↑ ↑ ↓ ↓ ← → ← → B A
  var konamiSeq = [];
  var konamiTarget = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (termEnabled) return;
    if (konamiTarget.indexOf(e.keyCode) === -1) { konamiSeq = []; return; }
    konamiSeq.push(e.keyCode);
    if (konamiSeq.length > konamiTarget.length) konamiSeq.shift();
    if (konamiSeq.length === konamiTarget.length && konamiSeq.every(function(v, i) { return v === konamiTarget[i]; })) {
      konamiSeq = [];
      activateTerminal();
    }
  });

  termInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      var cmd = termInput.value;
      termWriteln('$ ' + cmd, 'dim');
      processTermCommand(cmd);
      termInput.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdIndex > 0) { cmdIndex--; termInput.value = cmdHistory[cmdIndex]; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cmdIndex < cmdHistory.length - 1) { cmdIndex++; termInput.value = cmdHistory[cmdIndex]; }
      else { cmdIndex = cmdHistory.length; termInput.value = ''; }
    }
  });

  termOverlay.addEventListener('click', function(e) {
    if (e.target === termOverlay || e.target === termOverlay.querySelector('.terminal-wrap')) termInput.focus();
  });

})();
