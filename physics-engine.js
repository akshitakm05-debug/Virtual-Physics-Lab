/**
 * Virtual Physics Laboratory — Physics Simulation Engine
 * Validates parameters, separates input/calculated/measured/theoretical outputs,
 * and provides optical media constants.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./calculation-engine.js'));
  } else {
    root.VPL = root.VPL || {};
    root.VPL.PhysicsEngine = factory(root.VPL.CalculationEngine);
  }
}(typeof self !== 'undefined' ? self : this, function (Calc) {
  'use strict';

  var OPTICAL_MEDIA = {
    air: { name: 'Air', n: 1.0003, cauchyA: 1.00027, cauchyB: 0.000001, color: '#e0f2fe' },
    water: { name: 'Water', n: 1.333, cauchyA: 1.324, cauchyB: 0.0031, color: '#bae6fd' },
    acrylic: { name: 'Acrylic (PMMA)', n: 1.49, cauchyA: 1.478, cauchyB: 0.0042, color: '#ddd6fe' },
    crownGlass: { name: 'Crown Glass (BK7)', n: 1.52, cauchyA: 1.5046, cauchyB: 0.0042, color: '#c7d2fe' },
    flintGlass: { name: 'Flint Glass (SF10)', n: 1.62, cauchyA: 1.592, cauchyB: 0.0098, color: '#a5b4fc' },
    diamond: { name: 'Diamond', n: 2.417, cauchyA: 2.378, cauchyB: 0.0135, color: '#e2e8f0' }
  };

  var SPECTRUM_BANDS = [
    { name: 'Violet', wavelengthNm: 410, color: '#7c3aed' },
    { name: 'Blue', wavelengthNm: 470, color: '#2563eb' },
    { name: 'Cyan', wavelengthNm: 505, color: '#0891b2' },
    { name: 'Green', wavelengthNm: 545, color: '#16a34a' },
    { name: 'Yellow', wavelengthNm: 580, color: '#eab308' },
    { name: 'Orange', wavelengthNm: 615, color: '#ea580c' },
    { name: 'Red', wavelengthNm: 670, color: '#dc2626' }
  ];

  function percentError(measured, theoretical) {
    if (!Number.isFinite(measured) || !Number.isFinite(theoretical) || theoretical === 0) return null;
    return Calc.roundTo((Math.abs(measured - theoretical) / Math.abs(theoretical)) * 100, 2);
  }

  function simulatePendulum(params) {
    var lengthM = Number(params.lengthM);
    var g = Number(params.g || 9.81);
    var amplitudeDeg = Number(params.amplitudeDeg || 10);
    var theoreticalT = Calc.calculatePendulumPeriod(lengthM, g);
    // Small-angle correction factor (2nd order): T_actual ≈ T0 * (1 + theta^2 / 16)
    var thetaRad = Calc.toRadians(amplitudeDeg);
    var simulatedT = Calc.roundTo(theoreticalT * (1 + (thetaRad * thetaRad) / 16), 4);

    return {
      userInput: { lengthM: lengthM, g: g, amplitudeDeg: amplitudeDeg },
      theoreticalOutput: { periodS: theoreticalT },
      calculatedOutput: { periodS: simulatedT, frequencyHz: Calc.roundTo(1 / simulatedT, 4) },
      measuredOutput: params.measuredPeriodS ? { periodS: Number(params.measuredPeriodS) } : null,
      errorPercent: params.measuredPeriodS ? percentError(Number(params.measuredPeriodS), theoreticalT) : null,
      assumptionNote: 'Assumes inextensible, massless string and no air drag. Small-angle formula T = 2π√(L/g) is exact as θ → 0.'
    };
  }

  function simulateOhmsLaw(params) {
    var result = Calc.calculateOhmsLaw(params);
    return {
      userInput: {
        voltageV: Number(params.voltage),
        resistanceOhm: Number(params.resistance),
        switchClosed: params.switchClosed !== false
      },
      theoreticalOutput: result.valid ? { currentA: result.current, powerW: result.power } : null,
      calculatedOutput: result,
      measuredOutput: result.valid ? { ammeterA: result.current, voltmeterV: result.switchClosed ? Number(params.voltage) : 0 } : null,
      assumptionNote: 'Ideal DC voltage source (zero internal resistance) and ohmic resistor (constant R independent of temperature).'
    };
  }

  function simulateProjectile(params) {
    var res = Calc.calculateProjectile(params);
    return {
      userInput: { u: res.u, angleDeg: res.angleDeg, g: res.g },
      theoreticalOutput: { timeOfFlight: res.timeOfFlight, maxHeight: res.maxHeight, range: res.range },
      calculatedOutput: res,
      assumptionNote: 'Air resistance is ignored in this ideal projectile model; gravitational acceleration g is assumed constant.'
    };
  }

  function simulateWave(params) {
    var res = Calc.calculateWave(params);
    return {
      userInput: { frequencyHz: res.frequency, wavelengthM: res.wavelength, amplitudeM: res.amplitude },
      theoreticalOutput: { velocityMs: res.velocity, periodS: res.period },
      calculatedOutput: res,
      assumptionNote: 'Models a non-dispersive transverse sinusoidal wave y(x,t) = A sin(kx − ωt).'
    };
  }

  return {
    OPTICAL_MEDIA: OPTICAL_MEDIA,
    SPECTRUM_BANDS: SPECTRUM_BANDS,
    percentError: percentError,
    simulatePendulum: simulatePendulum,
    simulateOhmsLaw: simulateOhmsLaw,
    simulateProjectile: simulateProjectile,
    simulateWave: simulateWave
  };
}));
