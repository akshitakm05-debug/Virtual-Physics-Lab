/**
 * Virtual Physics Laboratory — Virtual Instrumentation System
 * Interactive SVG/Canvas instruments synchronized 1:1 with CalculationEngine.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./calculation-engine.js'));
  } else {
    root.VPL = root.VPL || {};
    root.VPL.InstrumentEngine = factory(root.VPL.CalculationEngine);
  }
}(typeof self !== 'undefined' ? self : this, function (Calc) {
  'use strict';

  // --- A. VERNIER CALIPER SVG RENDERER ---
  function renderVernierSVG(container, state) {
    if (!container) return;
    // readingCm is the true jaw opening in cm (0.00 to 6.00 cm)
    var readingCm = Math.max(0, Math.min(6, Number(state.jawOpeningCm || 0)));
    var zeroError = Number(state.zeroError || 0);
    var mode = state.mode || 'external';
    var locked = !!state.locked;

    // Observed reading = true opening + zeroError (clamped >= 0)
    var observedCm = Math.max(0, Calc.roundTo(readingCm + zeroError, 2));
    var totalHundredths = Math.round(observedCm * 100);
    var msrMm = Math.floor(totalHundredths / 10); // each MSD = 0.1 cm = 1 mm
    var msrCm = Calc.roundTo(msrMm * 0.1, 2);
    var vsd = totalHundredths % 10;

    // Pixel mapping: 1 cm = 70 px, origin at x = 80
    var pxPerCm = 70;
    var originX = 80;
    var jawShiftPx = observedCm * pxPerCm;

    var mainTicks = '';
    for (var mm = 0; mm <= 70; mm++) {
      var tx = originX + (mm / 10) * pxPerCm;
      var isCm = mm % 10 === 0;
      var isHalf = mm % 5 === 0 && !isCm;
      var tickH = isCm ? 18 : (isHalf ? 13 : 8);
      mainTicks += '<line x1="' + tx + '" y1="95" x2="' + tx + '" y2="' + (95 + tickH) + '" stroke="#0f172a" stroke-width="' + (isCm ? 1.5 : 1) + '"/>';
      if (isCm) {
        mainTicks += '<text x="' + tx + '" y="89" text-anchor="middle" font-size="11" font-family="monospace" fill="#0f172a">' + (mm / 10) + '</text>';
      }
    }

    // Vernier scale: 10 divisions = 9 mm = 0.9 cm
    var vernierTicks = '';
    var vOriginX = originX + jawShiftPx;
    for (var v = 0; v <= 10; v++) {
      var vx = vOriginX + (v * 0.09) * pxPerCm;
      var isCoinciding = (v === vsd);
      var strokeColor = isCoinciding ? '#dc2626' : '#1e3a8a';
      vernierTicks += '<line x1="' + vx + '" y1="120" x2="' + vx + '" y2="136" stroke="' + strokeColor + '" stroke-width="' + (isCoinciding ? 2.2 : 1.2) + '"/>';
      if (v % 2 === 0 || isCoinciding) {
        vernierTicks += '<text x="' + vx + '" y="149" text-anchor="middle" font-size="10" font-family="monospace" fill="' + strokeColor + '">' + v + '</text>';
      }
    }

    // Highlight object being measured based on mode
    var objectMarkup = '';
    if (readingCm > 0.05) {
      if (mode === 'external') {
        objectMarkup = '<rect x="' + originX + '" y="168" width="' + jawShiftPx + '" height="34" rx="4" fill="#93c5fd" stroke="#2563eb" stroke-width="1.5" opacity="0.85"/>' +
          '<text x="' + (originX + jawShiftPx / 2) + '" y="189" text-anchor="middle" font-size="11" fill="#1e3a8a" font-weight="bold">Ø ' + Calc.roundTo(readingCm, 2) + ' cm</text>';
      } else if (mode === 'internal') {
        objectMarkup = '<rect x="' + originX + '" y="44" width="' + jawShiftPx + '" height="20" fill="none" stroke="#059669" stroke-width="2" stroke-dasharray="4 2"/>' +
          '<text x="' + (originX + jawShiftPx / 2) + '" y="38" text-anchor="middle" font-size="10" fill="#059669" font-weight="bold">ID ' + Calc.roundTo(readingCm, 2) + ' cm</text>';
      } else {
        objectMarkup = '<rect x="' + (originX + 490) + '" y="102" width="' + jawShiftPx + '" height="16" fill="#fde68a" stroke="#d97706" stroke-width="1.5"/>';
      }
    }

    var svg = '' +
      '<svg viewBox="0 0 680 230" class="instrument-svg" role="img" aria-label="Interactive Vernier Caliper">' +
      '  <rect x="0" y="0" width="680" height="230" rx="8" fill="#f8fafc"/>' +
      '  <!-- Fixed Main Scale Beam -->' +
      '  <rect x="65" y="95" width="510" height="28" fill="#e2e8f0" stroke="#64748b" stroke-width="1.5"/>' +
      '  <!-- Fixed External Jaw -->' +
      '  <polygon points="65,123 80,123 80,210 68,195 65,165" fill="#cbd5e1" stroke="#475569" stroke-width="1.5"/>' +
      '  <!-- Fixed Internal Jaw -->' +
      '  <polygon points="65,95 80,95 80,45 70,55 65,75" fill="#cbd5e1" stroke="#475569" stroke-width="1.5"/>' +
      mainTicks +
      '  <!-- Depth Rod -->' +
      '  <rect x="' + (vOriginX + 120) + '" y="106" width="' + (380 + jawShiftPx - 120) + '" height="5" fill="#94a3b8"/>' +
      objectMarkup +
      '  <!-- Movable Vernier Carriage -->' +
      '  <g opacity="0.95">' +
      '    <rect x="' + vOriginX + '" y="118" width="115" height="36" rx="2" fill="#dbeafe" stroke="#1d4ed8" stroke-width="1.5"/>' +
      '    <!-- Movable External Jaw -->' +
      '    <polygon points="' + vOriginX + ',154 ' + (vOriginX + 15) + ',154 ' + (vOriginX + 15) + ',195 ' + vOriginX + ',210" fill="#bfdbfe" stroke="#1d4ed8" stroke-width="1.5"/>' +
      '    <!-- Movable Internal Jaw -->' +
      '    <polygon points="' + vOriginX + ',95 ' + (vOriginX + 12) + ',95 ' + (vOriginX + 12) + ',55 ' + vOriginX + ',45" fill="#bfdbfe" stroke="#1d4ed8" stroke-width="1.5"/>' +
      '    <!-- Locking Screw -->' +
      '    <rect x="' + (vOriginX + 52) + '" y="79" width="12" height="16" rx="2" fill="' + (locked ? '#dc2626' : '#475569') + '"/>' +
      '    <circle cx="' + (vOriginX + 58) + '" cy="77" r="6" fill="' + (locked ? '#ef4444' : '#64748b') + '"/>' +
      vernierTicks +
      '  </g>' +
      '  <text x="16" y="220" font-size="11" fill="#475569">Mode: ' + mode.toUpperCase() + ' | Coinciding VSD (red): ' + vsd + ' | Lock: ' + (locked ? 'LOCKED' : 'UNLOCKED') + '</text>' +
      '</svg>';

    container.innerHTML = svg;

    return Calc.calculateVernierReading({
      msr: msrCm,
      vsd: vsd,
      leastCount: 0.01,
      zeroError: zeroError,
      unit: 'cm'
    });
  }

  // --- B. SCREW GAUGE SVG RENDERER ---
  function renderScrewGaugeSVG(container, state) {
    if (!container) return;
    var pitch = Number(state.pitch || 0.5); // mm
    var circularDivs = Number(state.circularDivisions || 50);
    var lc = Calc.calculateScrewLeastCount(pitch, circularDivs);
    var openingMm = Math.max(0, Math.min(10, Number(state.openingMm || 0)));
    var zeroError = Number(state.zeroError || 0);

    var observedMm = Math.max(0, Calc.roundTo(openingMm + zeroError, 2));
    var totalSteps = Math.round(observedMm / lc);
    var stepsPerPitch = Math.round(pitch / lc);
    var halfSteps = Math.floor(totalSteps / stepsPerPitch);
    var msrMm = Calc.roundTo(halfSteps * pitch, 2);
    var csr = totalSteps % stepsPerPitch;

    // Visual positions: 1 mm = 20 px on sleeve
    var sleeveStartX = 210;
    var spindleGapPx = openingMm * 14;
    var anvilRightX = 110;
    var spindleLeftX = anvilRightX + spindleGapPx;
    var thimbleX = sleeveStartX + observedMm * 20;

    var sleeveTicks = '';
    for (var m = 0; m <= 20; m++) {
      var mmVal = m * 0.5;
      var sx = sleeveStartX + mmVal * 20;
      var isWhole = m % 2 === 0;
      if (isWhole) {
        sleeveTicks += '<line x1="' + sx + '" y1="90" x2="' + sx + '" y2="108" stroke="#0f172a" stroke-width="1.4"/>';
        if ((m / 2) % 5 === 0) {
          sleeveTicks += '<text x="' + sx + '" y="84" text-anchor="middle" font-size="10" font-family="monospace">' + (m / 2) + '</text>';
        }
      } else {
        sleeveTicks += '<line x1="' + sx + '" y1="108" x2="' + sx + '" y2="122" stroke="#475569" stroke-width="1"/>';
      }
    }

    // Thimble circular ticks centered around datum line y = 108
    var thimbleTicks = '';
    for (var d = -6; d <= 6; d++) {
      var divNum = (csr + d + circularDivs) % circularDivs;
      var ty = 108 - d * 7;
      var isCurrent = d === 0;
      thimbleTicks += '<line x1="' + thimbleX + '" y1="' + ty + '" x2="' + (thimbleX + (isCurrent ? 18 : 12)) + '" y2="' + ty + '" stroke="' + (isCurrent ? '#dc2626' : '#1e3a8a') + '" stroke-width="' + (isCurrent ? 2 : 1) + '"/>';
      if (divNum % 5 === 0 || isCurrent) {
        thimbleTicks += '<text x="' + (thimbleX + 24) + '" y="' + (ty + 3) + '" font-size="9" font-family="monospace" fill="' + (isCurrent ? '#dc2626' : '#1e293b') + '">' + divNum + '</text>';
      }
    }

    var objMarkup = openingMm > 0.05
      ? '<circle cx="' + (anvilRightX + spindleGapPx / 2) + '" cy="108" r="' + Math.min(28, spindleGapPx / 2) + '" fill="#93c5fd" stroke="#2563eb" stroke-width="1.5" opacity="0.8"/>'
      : '';

    container.innerHTML = '' +
      '<svg viewBox="0 0 640 210" class="instrument-svg" role="img" aria-label="Micrometer Screw Gauge">' +
      '  <rect x="0" y="0" width="640" height="210" rx="8" fill="#f8fafc"/>' +
      '  <!-- U-Frame -->' +
      '  <path d="M 85,120 C 70,195 215,195 210,125 L 195,125 C 195,175 90,175 100,120 Z" fill="#64748b" stroke="#334155" stroke-width="1.5"/>' +
      '  <!-- Anvil -->' +
      '  <rect x="85" y="98" width="25" height="20" fill="#cbd5e1" stroke="#475569"/>' +
      objMarkup +
      '  <!-- Spindle -->' +
      '  <rect x="' + spindleLeftX + '" y="100" width="' + (sleeveStartX - spindleLeftX) + '" height="16" fill="#cbd5e1" stroke="#475569"/>' +
      '  <!-- Sleeve -->' +
      '  <rect x="' + sleeveStartX + '" y="88" width="230" height="40" fill="#e2e8f0" stroke="#475569"/>' +
      '  <line x1="' + sleeveStartX + '" y1="108" x2="440" y2="108" stroke="#0f172a" stroke-width="1.5"/>' +
      sleeveTicks +
      '  <!-- Thimble -->' +
      '  <rect x="' + thimbleX + '" y="62" width="110" height="92" rx="4" fill="#dbeafe" stroke="#1d4ed8" stroke-width="1.5" opacity="0.93"/>' +
      thimbleTicks +
      '  <!-- Ratchet -->' +
      '  <rect x="' + (thimbleX + 110) + '" y="92" width="28" height="32" rx="3" fill="#94a3b8" stroke="#475569"/>' +
      '  <text x="16" y="200" font-size="11" fill="#475569">Pitch: ' + pitch + ' mm | LC: ' + lc + ' mm | MSR: ' + msrMm + ' mm | CSR: ' + csr + '</text>' +
      '</svg>';

    return Calc.calculateScrewReading({
      msr: msrMm,
      csr: csr,
      pitch: pitch,
      circularDivisions: circularDivs,
      leastCount: lc,
      zeroError: zeroError,
      unit: 'mm'
    });
  }

  // --- C. ACCURATE DIGITAL STOPWATCH ---
  function createStopwatch() {
    var running = false;
    var startTime = 0;
    var accumulatedMs = 0;
    var laps = [];

    return {
      start: function () {
        if (!running) {
          startTime = Date.now();
          running = true;
        }
      },
      pause: function () {
        if (running) {
          accumulatedMs += Date.now() - startTime;
          running = false;
        }
      },
      resume: function () {
        if (!running) {
          startTime = Date.now();
          running = true;
        }
      },
      reset: function () {
        running = false;
        startTime = 0;
        accumulatedMs = 0;
        laps = [];
      },
      getElapsedMs: function () {
        return running ? accumulatedMs + (Date.now() - startTime) : accumulatedMs;
      },
      getElapsedSeconds: function () {
        return Calc.roundTo(this.getElapsedMs() / 1000, 3);
      },
      recordLap: function () {
        var sec = this.getElapsedSeconds();
        laps.push(sec);
        return laps.slice();
      },
      getLaps: function () { return laps.slice(); },
      getAverageLap: function () { return Calc.average(laps); },
      isRunning: function () { return running; }
    };
  }

  // --- D. METER SCALE SVG RENDERER ---
  function renderMeterScaleSVG(container, state) {
    if (!container) return null;
    var startCm = Math.max(0, Math.min(100, Number(state.startCm || 10)));
    var endCm = Math.max(0, Math.min(100, Number(state.endCm || 45)));
    var unit = state.unit || 'cm';
    var lengthCm = Calc.roundTo(Math.abs(endCm - startCm), 2);
    var converted = Calc.roundTo(Calc.convertLength(lengthCm, 'cm', unit), 4);

    var scaleX = 40;
    var scaleW = 560; // 100 cm = 560 px -> 5.6 px/cm
    var pxPerCm = scaleW / 100;

    var ticks = '';
    for (var cm = 0; cm <= 100; cm += 2) {
      var tx = scaleX + cm * pxPerCm;
      var major = cm % 10 === 0;
      ticks += '<line x1="' + tx + '" y1="70" x2="' + tx + '" y2="' + (major ? 95 : 82) + '" stroke="#0f172a" stroke-width="' + (major ? 1.5 : 0.8) + '"/>';
      if (major) {
        ticks += '<text x="' + tx + '" y="110" text-anchor="middle" font-size="10" font-family="monospace">' + cm + '</text>';
      }
    }

    var x1 = scaleX + Math.min(startCm, endCm) * pxPerCm;
    var x2 = scaleX + Math.max(startCm, endCm) * pxPerCm;

    container.innerHTML = '' +
      '<svg viewBox="0 0 640 150" class="instrument-svg" role="img" aria-label="Meter Scale">' +
      '  <rect x="0" y="0" width="640" height="150" rx="8" fill="#f8fafc"/>' +
      '  <rect x="' + x1 + '" y="36" width="' + Math.max(2, x2 - x1) + '" height="22" rx="3" fill="#93c5fd" stroke="#2563eb" stroke-width="1.5"/>' +
      '  <text x="' + ((x1 + x2) / 2) + '" y="51" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e3a8a">' + converted + ' ' + unit + '</text>' +
      '  <rect x="30" y="70" width="580" height="50" rx="3" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>' +
      ticks +
      '  <line x1="' + (scaleX + startCm * pxPerCm) + '" y1="25" x2="' + (scaleX + startCm * pxPerCm) + '" y2="125" stroke="#16a34a" stroke-width="2" stroke-dasharray="3 2"/>' +
      '  <line x1="' + (scaleX + endCm * pxPerCm) + '" y1="25" x2="' + (scaleX + endCm * pxPerCm) + '" y2="125" stroke="#dc2626" stroke-width="2" stroke-dasharray="3 2"/>' +
      '</svg>';

    return { startCm: startCm, endCm: endCm, lengthCm: lengthCm, converted: converted, unit: unit };
  }

  // --- E. AMMETER / VOLTMETER DIAL RENDERER ---
  function renderMeterDialSVG(container, spec) {
    if (!container) return;
    var label = spec.label || 'A';
    var title = spec.title || 'Ammeter';
    var value = Number(spec.value || 0);
    var maxRange = Number(spec.maxRange || 5);
    var unit = spec.unit || 'A';
    var overload = !Number.isFinite(value) || value > maxRange;
    var ratio = overload ? 1.06 : Math.max(0, Math.min(1, value / maxRange));
    var angleDeg = -60 + ratio * 120; // -60° to +60°
    var rad = Calc.toRadians(angleDeg - 90);
    var nx = 110 + Math.cos(rad) * 58;
    var ny = 105 + Math.sin(rad) * 58;

    container.innerHTML = '' +
      '<svg viewBox="0 0 220 150" class="instrument-svg" role="img" aria-label="' + title + '">' +
      '  <rect x="4" y="4" width="212" height="142" rx="10" fill="#ffffff" stroke="' + (overload ? '#dc2626' : '#cbd5e1') + '" stroke-width="2"/>' +
      '  <path d="M 50 105 A 60 60 0 0 1 170 105" fill="none" stroke="#94a3b8" stroke-width="3"/>' +
      '  <line x1="110" y1="105" x2="' + nx + '" y2="' + ny + '" stroke="' + (overload ? '#dc2626' : '#2563eb') + '" stroke-width="2.5" stroke-linecap="round"/>' +
      '  <circle cx="110" cy="105" r="5" fill="#0f172a"/>' +
      '  <text x="110" y="74" text-anchor="middle" font-size="16" font-weight="bold" fill="#0f172a">' + label + '</text>' +
      '  <text x="110" y="132" text-anchor="middle" font-size="13" font-family="monospace" fill="' + (overload ? '#dc2626' : '#0f172a') + '">' +
           (Number.isFinite(value) ? Calc.roundTo(value, 3) + ' ' + unit : 'SHORT!') + (overload ? ' [OVERLOAD]' : '') + '</text>' +
      '  <text x="36" y="114" font-size="10" fill="#64748b">0</text>' +
      '  <text x="172" y="114" font-size="10" fill="#64748b">' + maxRange + unit + '</text>' +
      '</svg>';
  }

  // --- F. OPTICAL INSTRUMENTS RAY DIAGRAM ---
  function renderOpticalInstrumentSVG(container, state) {
    if (!container) return null;
    var type = state.type || 'convex-lens';
    var f = Number(state.focalLength || 15); // cm (magnitude)
    var u = -Math.abs(Number(state.objectDistance || 30)); // negative by sign convention
    var hObj = 38;
    var cx = 320;
    var cy = 130;
    var scale = 3.5; // px per cm

    var v = null;
    var m = 1;
    var isLens = type === 'convex-lens' || type === 'concave-lens';
    var signedF = (type === 'convex-lens' || type === 'concave-mirror') ? f : -f;

    if (type === 'plane-mirror') {
      v = -u;
      m = 1;
    } else if (isLens) {
      // 1/v = 1/f + 1/u
      var invV = (1 / signedF) + (1 / u);
      v = invV === 0 ? Infinity : 1 / invV;
      m = Number.isFinite(v) ? v / u : Infinity;
    } else {
      // Mirror: 1/v = 1/f - 1/u
      var invVm = (1 / signedF) - (1 / u);
      v = invVm === 0 ? Infinity : 1 / invVm;
      m = Number.isFinite(v) ? -v / u : Infinity;
    }

    var objX = cx + u * scale;
    var imgX = Number.isFinite(v) ? Math.max(20, Math.min(620, cx + v * scale)) : 620;
    var hImg = Number.isFinite(m) ? Math.max(-95, Math.min(95, hObj * m)) : 0;

    var elementSvg = '';
    if (type === 'convex-lens') {
      elementSvg = '<path d="M ' + cx + ' 40 Q ' + (cx + 22) + ' 130 ' + cx + ' 220 Q ' + (cx - 22) + ' 130 ' + cx + ' 40 Z" fill="#bae6fd" stroke="#0284c7" stroke-width="2" opacity="0.7"/>';
    } else if (type === 'concave-lens') {
      elementSvg = '<path d="M ' + (cx - 14) + ' 40 L ' + (cx + 14) + ' 40 Q ' + (cx + 2) + ' 130 ' + (cx + 14) + ' 220 L ' + (cx - 14) + ' 220 Q ' + (cx - 2) + ' 130 ' + (cx - 14) + ' 40 Z" fill="#bae6fd" stroke="#0284c7" stroke-width="2" opacity="0.7"/>';
    } else if (type === 'plane-mirror') {
      elementSvg = '<line x1="' + cx + '" y1="40" x2="' + cx + '" y2="220" stroke="#0f172a" stroke-width="4"/>';
    } else if (type === 'concave-mirror') {
      elementSvg = '<path d="M ' + (cx - 10) + ' 40 Q ' + (cx + 15) + ' 130 ' + (cx - 10) + ' 220" fill="none" stroke="#0f172a" stroke-width="4"/>';
    } else {
      elementSvg = '<path d="M ' + (cx + 10) + ' 40 Q ' + (cx - 15) + ' 130 ' + (cx + 10) + ' 220" fill="none" stroke="#0f172a" stroke-width="4"/>';
    }

    var raySvg = '';
    if (Number.isFinite(v)) {
      raySvg =
        '<line x1="' + objX + '" y1="' + (cy - hObj) + '" x2="' + cx + '" y2="' + (cy - hObj) + '" stroke="#dc2626" stroke-width="1.8"/>' +
        '<line x1="' + cx + '" y1="' + (cy - hObj) + '" x2="' + imgX + '" y2="' + (cy - hImg) + '" stroke="#dc2626" stroke-width="1.8"/>' +
        '<line x1="' + objX + '" y1="' + (cy - hObj) + '" x2="' + imgX + '" y2="' + (cy - hImg) + '" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="4 3"/>';
    }

    container.innerHTML = '' +
      '<svg viewBox="0 0 640 260" class="instrument-svg" role="img" aria-label="Optical Ray Diagram">' +
      '  <rect x="0" y="0" width="640" height="260" rx="8" fill="#f8fafc"/>' +
      '  <line x1="20" y1="' + cy + '" x2="620" y2="' + cy + '" stroke="#64748b" stroke-dasharray="6 4"/>' +
      elementSvg +
      '  <!-- Object Arrow -->' +
      '  <line x1="' + objX + '" y1="' + cy + '" x2="' + objX + '" y2="' + (cy - hObj) + '" stroke="#16a34a" stroke-width="3"/>' +
      '  <circle cx="' + objX + '" cy="' + (cy - hObj) + '" r="4" fill="#16a34a"/>' +
      '  <text x="' + objX + '" y="' + (cy + 16) + '" text-anchor="middle" font-size="11" fill="#16a34a">Object</text>' +
      raySvg +
      (Number.isFinite(v)
        ? '<line x1="' + imgX + '" y1="' + cy + '" x2="' + imgX + '" y2="' + (cy - hImg) + '" stroke="#7c3aed" stroke-width="3" stroke-dasharray="' + ((isLens && v < 0) || (!isLens && v > 0) ? '4 2' : 'none') + '"/>' +
          '<text x="' + imgX + '" y="' + (cy + 16) + '" text-anchor="middle" font-size="11" fill="#7c3aed">Image</text>'
        : '<text x="480" y="70" font-size="12" fill="#dc2626">Image at Infinity (parallel rays)</text>') +
      '</svg>';

    return {
      u: u,
      f: signedF,
      v: Number.isFinite(v) ? Calc.roundTo(v, 2) : Infinity,
      magnification: Number.isFinite(m) ? Calc.roundTo(m, 2) : Infinity,
      nature: !Number.isFinite(v) ? 'At Infinity' : ((isLens ? v > 0 : v < 0) ? 'Real & Inverted' : 'Virtual & Erect')
    };
  }

  return {
    renderVernierSVG: renderVernierSVG,
    renderScrewGaugeSVG: renderScrewGaugeSVG,
    createStopwatch: createStopwatch,
    renderMeterScaleSVG: renderMeterScaleSVG,
    renderMeterDialSVG: renderMeterDialSVG,
    renderOpticalInstrumentSVG: renderOpticalInstrumentSVG
  };
}));
