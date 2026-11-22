/**
 * Virtual Physics Laboratory — Laser Physics Simulation System
 * Supports Laser Reflection, Snell's Law Refraction + TIR, and Cauchy Prism Dispersion.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./calculation-engine.js'), require('./physics-engine.js'));
  } else {
    root.VPL = root.VPL || {};
    root.VPL.LaserEngine = factory(root.VPL.CalculationEngine, root.VPL.PhysicsEngine);
  }
}(typeof self !== 'undefined' ? self : this, function (Calc, Physics) {
  'use strict';

  function renderLaserLabSVG(container, state) {
    if (!container) return null;
    var mode = state.mode || 'refraction'; // 'reflection' | 'refraction' | 'prism'
    var laserOn = state.laserOn !== false;
    var angleDeg = Number(state.incidentAngleDeg !== undefined ? state.incidentAngleDeg : 30);
    var m1 = Physics.OPTICAL_MEDIA[state.medium1 || 'air'] || Physics.OPTICAL_MEDIA.air;
    var m2 = Physics.OPTICAL_MEDIA[state.medium2 || 'crownGlass'] || Physics.OPTICAL_MEDIA.crownGlass;

    var w = 640, h = 340;
    var cx = 320, cy = 170;
    var rayLen = 145;

    if (mode === 'reflection') {
      var refl = Calc.calculateReflection(angleDeg);
      var radI = Calc.toRadians(refl.incidentAngle);
      var sx = cx - Math.sin(radI) * rayLen;
      var sy = cy - Math.cos(radI) * rayLen;
      var rx = cx + Math.sin(radI) * rayLen;
      var ry = cy - Math.cos(radI) * rayLen;

      container.innerHTML = '' +
        '<svg viewBox="0 0 640 340" class="instrument-svg" role="img" aria-label="Laser Reflection Simulator">' +
        '  <rect x="0" y="0" width="640" height="340" rx="8" fill="#0f172a"/>' +
        '  <rect x="40" y="' + cy + '" width="560" height="16" fill="#94a3b8"/>' +
        '  <line x1="' + cx + '" y1="30" x2="' + cx + '" y2="290" stroke="#64748b" stroke-dasharray="6 4"/>' +
        '  <text x="' + (cx + 8) + '" y="45" font-size="11" fill="#94a3b8">Normal (0°)</text>' +
        (laserOn
          ? '<line x1="' + sx + '" y1="' + sy + '" x2="' + cx + '" y2="' + cy + '" stroke="#ef4444" stroke-width="3"/>' +
            '<line x1="' + cx + '" y1="' + cy + '" x2="' + rx + '" y2="' + ry + '" stroke="#f87171" stroke-width="3"/>' +
            '<text x="' + (sx - 10) + '" y="' + (sy - 8) + '" font-size="11" fill="#fca5a5">θᵢ = ' + refl.incidentAngle + '°</text>' +
            '<text x="' + (rx + 10) + '" y="' + (ry - 8) + '" font-size="11" fill="#fca5a5">θᵣ = ' + refl.reflectedAngle + '°</text>'
          : '<text x="320" y="120" text-anchor="middle" font-size="14" fill="#94a3b8">Laser Source OFF</text>') +
        '  <circle cx="' + sx + '" cy="' + sy + '" r="8" fill="' + (laserOn ? '#ef4444' : '#475569') + '" stroke="#e2e8f0" stroke-width="2"/>' +
        '</svg>';

      return {
        mode: 'reflection',
        incidentAngle: refl.incidentAngle,
        reflectedAngle: refl.reflectedAngle,
        refractedAngle: null,
        n1: 1.0,
        n2: 1.0,
        criticalAngle: null,
        isTIR: false,
        explanation: 'Law of Reflection: Angle of incidence (' + refl.incidentAngle + '°) equals angle of reflection (' + refl.reflectedAngle + '°).'
      };
    }

    if (mode === 'refraction') {
      var refr = Calc.calculateRefraction({ incidentAngleDeg: angleDeg, n1: m1.n, n2: m2.n });
      var radI2 = Calc.toRadians(refr.incidentAngle);
      var sx2 = cx - Math.sin(radI2) * rayLen;
      var sy2 = cy - Math.cos(radI2) * rayLen;

      var emergentSvg = '';
      if (laserOn) {
        if (refr.isTIR) {
          var tirX = cx + Math.sin(radI2) * rayLen;
          var tirY = cy - Math.cos(radI2) * rayLen;
          emergentSvg =
            '<line x1="' + cx + '" y1="' + cy + '" x2="' + tirX + '" y2="' + tirY + '" stroke="#fbbf24" stroke-width="3"/>' +
            '<text x="' + (tirX - 20) + '" y="' + (tirY - 8) + '" font-size="11" fill="#fde68a">TIR θᵣ = ' + refr.reflectedAngle + '°</text>';
        } else {
          var radR = Calc.toRadians(refr.refractedAngle);
          var tx2 = cx + Math.sin(radR) * rayLen;
          var ty2 = cy + Math.cos(radR) * rayLen;
          emergentSvg =
            '<line x1="' + cx + '" y1="' + cy + '" x2="' + tx2 + '" y2="' + ty2 + '" stroke="#38bdf8" stroke-width="3"/>' +
            '<text x="' + (tx2 + 8) + '" y="' + (ty2 + 4) + '" font-size="11" fill="#7dd3fc">θ₂ = ' + refr.refractedAngle + '°</text>';
        }
      }

      container.innerHTML = '' +
        '<svg viewBox="0 0 640 340" class="instrument-svg" role="img" aria-label="Laser Refraction Simulator">' +
        '  <rect x="0" y="0" width="640" height="' + cy + '" fill="#0f172a"/>' +
        '  <rect x="0" y="' + cy + '" width="640" height="' + (h - cy) + '" fill="#1e293b"/>' +
        '  <line x1="0" y1="' + cy + '" x2="640" y2="' + cy + '" stroke="#94a3b8" stroke-width="1.5"/>' +
        '  <line x1="' + cx + '" y1="20" x2="' + cx + '" y2="320" stroke="#64748b" stroke-dasharray="6 4"/>' +
        '  <text x="16" y="26" font-size="12" fill="#e2e8f0">Medium 1: ' + m1.name + ' (n₁ = ' + m1.n + ')</text>' +
        '  <text x="16" y="' + (cy + 24) + '" font-size="12" fill="#bae6fd">Medium 2: ' + m2.name + ' (n₂ = ' + m2.n + ')</text>' +
        (laserOn
          ? '<line x1="' + sx2 + '" y1="' + sy2 + '" x2="' + cx + '" y2="' + cy + '" stroke="#ef4444" stroke-width="3"/>' +
            '<text x="' + (sx2 - 10) + '" y="' + (sy2 - 8) + '" font-size="11" fill="#fca5a5">θ₁ = ' + refr.incidentAngle + '°</text>' +
            emergentSvg
          : '<text x="320" y="100" text-anchor="middle" font-size="14" fill="#94a3b8">Laser Source OFF</text>') +
        '  <circle cx="' + sx2 + '" cy="' + sy2 + '" r="8" fill="' + (laserOn ? '#ef4444' : '#475569') + '" stroke="#e2e8f0" stroke-width="2"/>' +
        '</svg>';

      var expText = refr.isTIR
        ? 'Total Internal Reflection occurred! Since n₁ (' + m1.n + ') > n₂ (' + m2.n + ') and θ₁ (' + refr.incidentAngle + '°) > θc (' + refr.criticalAngle + '°), light reflects completely back into ' + m1.name + '.'
        : "Snell's Law: n₁ sin(θ₁) = n₂ sin(θ₂) → " + m1.n + ' × sin(' + refr.incidentAngle + '°) = ' + m2.n + ' × sin(' + refr.refractedAngle + '°).';

      return {
        mode: 'refraction',
        incidentAngle: refr.incidentAngle,
        reflectedAngle: refr.reflectedAngle,
        refractedAngle: refr.refractedAngle,
        n1: m1.n,
        n2: m2.n,
        criticalAngle: refr.criticalAngle,
        isTIR: refr.isTIR,
        explanation: expText
      };
    }

    // Mode: Prism Dispersion (Cauchy wavelength-dependent refractive index)
    var prismMat = Physics.OPTICAL_MEDIA[state.medium2 || 'flintGlass'] || Physics.OPTICAL_MEDIA.flintGlass;
    var apexDeg = 60;
    // Equilateral prism vertices
    var top = { x: 320, y: 75 };
    var left = { x: 220, y: 250 };
    var right = { x: 420, y: 250 };
    var hitX = 270, hitY = 162;

    var radInc = Calc.toRadians(angleDeg);
    var srcX = hitX - Math.cos(radInc - 0.52) * 140;
    var srcY = hitY + Math.sin(radInc - 0.52) * 140;

    var dispersedRays = '';
    var redDev = null, violetDev = null;

    if (laserOn) {
      Physics.SPECTRUM_BANDS.forEach(function (band, idx) {
        var nLambda = Calc.cauchyRefractiveIndex(band.wavelengthNm, prismMat.cauchyA, prismMat.cauchyB);
        var prismRes = Calc.calculatePrismRay({ incidentAngleDeg: angleDeg, apexAngleDeg: apexDeg, n: nLambda });
        if (idx === 0) violetDev = prismRes;
        if (idx === Physics.SPECTRUM_BANDS.length - 1) redDev = prismRes;

        var exitX = 365 + idx * 1.5;
        var exitY = 155 + idx * 5.5;
        if (!prismRes.tirInside && prismRes.deviation !== null) {
          var devRad = Calc.toRadians(prismRes.deviation * 0.65);
          var endX = exitX + Math.cos(devRad) * 190;
          var endY = exitY + Math.sin(devRad) * 190;
          dispersedRays +=
            '<line x1="' + hitX + '" y1="' + hitY + '" x2="' + exitX + '" y2="' + exitY + '" stroke="' + band.color + '" stroke-width="1.6" opacity="0.75"/>' +
            '<line x1="' + exitX + '" y1="' + exitY + '" x2="' + endX + '" y2="' + endY + '" stroke="' + band.color + '" stroke-width="2.2"/>';
        }
      });
    }

    container.innerHTML = '' +
      '<svg viewBox="0 0 640 340" class="instrument-svg" role="img" aria-label="Prism Dispersion Simulator">' +
      '  <rect x="0" y="0" width="640" height="340" rx="8" fill="#0f172a"/>' +
      '  <polygon points="' + top.x + ',' + top.y + ' ' + left.x + ',' + left.y + ' ' + right.x + ',' + right.y + '" fill="#38bdf8" fill-opacity="0.18" stroke="#7dd3fc" stroke-width="2"/>' +
      (laserOn
        ? '<line x1="' + srcX + '" y1="' + srcY + '" x2="' + hitX + '" y2="' + hitY + '" stroke="#ffffff" stroke-width="3"/>' + dispersedRays
        : '<text x="320" y="50" text-anchor="middle" font-size="14" fill="#94a3b8">White Light Source OFF</text>') +
      '  <text x="18" y="28" font-size="12" fill="#e2e8f0">Prism: ' + prismMat.name + ' (Apex 60°) | Cauchy Dispersion Model</text>' +
      '</svg>';

    return {
      mode: 'prism',
      incidentAngle: angleDeg,
      reflectedAngle: null,
      refractedAngle: redDev && !redDev.tirInside ? redDev.emergentAngle : null,
      n1: 1.0,
      n2: prismMat.n,
      criticalAngle: null,
      isTIR: redDev ? redDev.tirInside : false,
      explanation: 'Dispersion via Cauchy equation n(λ) = A + B/λ²: Violet (410 nm) bends more than Red (670 nm).' +
        (redDev && violetDev && !redDev.tirInside && !violetDev.tirInside
          ? ' Red deviation: ' + redDev.deviation + '°, Violet deviation: ' + violetDev.deviation + '°.'
          : ' (Internal TIR at exit face for this incident angle.)')
    };
  }

  return {
    renderLaserLabSVG: renderLaserLabSVG
  };
}));
