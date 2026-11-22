/**
 * Virtual Physics Laboratory — Calculation Engine
 * Pure, unit-aware, independently testable mathematical functions.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.VPL = root.VPL || {};
    root.VPL.CalculationEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function roundTo(value, decimals) {
    if (!Number.isFinite(value)) return NaN;
    var factor = Math.pow(10, decimals || 4);
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  function toRadians(deg) {
    return (deg * Math.PI) / 180;
  }

  function toDegrees(rad) {
    return (rad * 180) / Math.PI;
  }

  function convertLength(value, fromUnit, toUnit) {
    var factorsToMeters = { mm: 0.001, cm: 0.01, m: 1 };
    if (!factorsToMeters[fromUnit] || !factorsToMeters[toUnit]) {
      throw new Error('Unsupported length unit: ' + fromUnit + ' -> ' + toUnit);
    }
    var meters = value * factorsToMeters[fromUnit];
    return meters / factorsToMeters[toUnit];
  }

  function safeDivide(numerator, denominator) {
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {
      return { valid: false, value: null, error: 'Non-finite input' };
    }
    if (denominator === 0) {
      return { valid: false, value: null, error: 'Division by zero is undefined' };
    }
    return { valid: true, value: numerator / denominator, error: null };
  }

  // --- A. VERNIER CALIPER ---
  function calculateVernierLeastCount(mainScaleDivCm, vernierDivisions) {
    if (mainScaleDivCm <= 0 || vernierDivisions <= 0) {
      throw new Error('Scale divisions must be positive');
    }
    return roundTo(mainScaleDivCm / vernierDivisions, 6);
  }

  function calculateVernierReading(params) {
    var msr = Number(params.msr);
    var vsd = Number(params.vsd);
    var leastCount = params.leastCount !== undefined
      ? Number(params.leastCount)
      : calculateVernierLeastCount(Number(params.mainScaleDiv || 0.1), Number(params.vernierDivisions || 10));
    var zeroError = Number(params.zeroError || 0);

    if (!Number.isFinite(msr) || !Number.isFinite(vsd) || !Number.isFinite(leastCount) || !Number.isFinite(zeroError)) {
      throw new Error('Invalid Vernier Caliper input');
    }
    if (vsd < 0) throw new Error('Coinciding Vernier division cannot be negative');

    var vsr = roundTo(vsd * leastCount, 5);
    var observed = roundTo(msr + vsr, 5);
    var corrected = roundTo(observed - zeroError, 5);

    return {
      msr: roundTo(msr, 4),
      vsd: vsd,
      leastCount: leastCount,
      vsr: vsr,
      observed: observed,
      zeroError: roundTo(zeroError, 4),
      corrected: corrected,
      unit: params.unit || 'cm'
    };
  }

  // --- B. SCREW GAUGE ---
  function calculateScrewPitch(distanceMovedMm, rotations) {
    if (rotations <= 0 || distanceMovedMm <= 0) {
      throw new Error('Distance and rotations must be positive');
    }
    return roundTo(distanceMovedMm / rotations, 6);
  }

  function calculateScrewLeastCount(pitchMm, circularDivisions) {
    if (pitchMm <= 0 || circularDivisions <= 0) {
      throw new Error('Pitch and circular divisions must be positive');
    }
    return roundTo(pitchMm / circularDivisions, 6);
  }

  function calculateScrewReading(params) {
    var msr = Number(params.msr);
    var csr = Number(params.csr);
    var pitch = Number(params.pitch || 0.5);
    var circularDivisions = Number(params.circularDivisions || 50);
    var leastCount = params.leastCount !== undefined
      ? Number(params.leastCount)
      : calculateScrewLeastCount(pitch, circularDivisions);
    var zeroError = Number(params.zeroError || 0);

    if (!Number.isFinite(msr) || !Number.isFinite(csr) || !Number.isFinite(leastCount)) {
      throw new Error('Invalid Screw Gauge input');
    }
    if (csr < 0 || csr >= circularDivisions) {
      throw new Error('Circular scale reading must be within [0, ' + (circularDivisions - 1) + ']');
    }

    var csrValue = roundTo(csr * leastCount, 5);
    var observed = roundTo(msr + csrValue, 5);
    var corrected = roundTo(observed - zeroError, 5);

    return {
      msr: roundTo(msr, 4),
      csr: csr,
      pitch: pitch,
      circularDivisions: circularDivisions,
      leastCount: leastCount,
      csrValue: csrValue,
      observed: observed,
      zeroError: roundTo(zeroError, 4),
      corrected: corrected,
      unit: params.unit || 'mm'
    };
  }

  // --- C. SIMPLE PENDULUM ---
  function calculatePendulumPeriod(lengthM, g) {
    var L = Number(lengthM);
    var grav = Number(g !== undefined ? g : 9.81);
    if (L <= 0) throw new Error('Pendulum length must be greater than 0');
    if (grav <= 0) throw new Error('Gravitational acceleration must be greater than 0');
    var T = 2 * Math.PI * Math.sqrt(L / grav);
    return roundTo(T, 4);
  }

  function calculateGFromPendulum(lengthM, periodS) {
    var L = Number(lengthM);
    var T = Number(periodS);
    if (L <= 0 || T <= 0) throw new Error('Length and period must be positive');
    return roundTo((4 * Math.PI * Math.PI * L) / (T * T), 4);
  }

  // --- D. OHM'S LAW ---
  function calculateOhmsLaw(params) {
    var V = Number(params.voltage);
    var R = Number(params.resistance);
    var switchClosed = params.switchClosed !== false;

    if (!Number.isFinite(V) || !Number.isFinite(R)) {
      return { valid: false, error: 'Voltage and resistance must be finite numbers', current: 0, power: 0 };
    }
    if (V < 0 || R < 0) {
      return { valid: false, error: 'Voltage and resistance cannot be negative', current: 0, power: 0 };
    }
    if (!switchClosed) {
      return { valid: true, switchClosed: false, voltage: V, resistance: R, current: 0, power: 0, overload: false, warning: 'Circuit open — current is 0 A' };
    }
    if (R === 0) {
      return { valid: false, switchClosed: true, voltage: V, resistance: 0, current: Infinity, power: Infinity, overload: true, error: 'Short circuit! Resistance cannot be 0 Ω when switch is closed.' };
    }
    var I = roundTo(V / R, 4);
    var P = roundTo(V * I, 4);
    return {
      valid: true,
      switchClosed: true,
      voltage: V,
      resistance: R,
      current: I,
      power: P,
      overload: false,
      error: null
    };
  }

  // --- E. PROJECTILE MOTION (Ideal, no air resistance) ---
  function calculateProjectile(params) {
    var u = Number(params.u);
    var angleDeg = Number(params.angleDeg);
    var g = Number(params.g !== undefined ? params.g : 9.81);

    if (u < 0) throw new Error('Initial velocity cannot be negative');
    if (angleDeg < 0 || angleDeg > 90) throw new Error('Launch angle must be between 0° and 90°');
    if (g <= 0) throw new Error('Gravity must be positive');

    var theta = toRadians(angleDeg);
    var vx = u * Math.cos(theta);
    var vy = u * Math.sin(theta);
    var timeOfFlight = (2 * vy) / g;
    var maxHeight = (vy * vy) / (2 * g);
    var range = (u * u * Math.sin(2 * theta)) / g;

    return {
      u: u,
      angleDeg: angleDeg,
      g: g,
      vx: roundTo(vx, 4),
      vy: roundTo(vy, 4),
      timeOfFlight: roundTo(timeOfFlight, 4),
      maxHeight: roundTo(maxHeight, 4),
      range: roundTo(range, 4),
      pointAt: function (t) {
        return {
          x: vx * t,
          y: Math.max(0, vy * t - 0.5 * g * t * t)
        };
      }
    };
  }

  // --- F. WAVE MOTION ---
  function calculateWave(params) {
    var f = Number(params.frequency);
    var lambda = Number(params.wavelength);
    var A = Number(params.amplitude);
    if (f <= 0 || lambda <= 0 || A < 0) {
      throw new Error('Frequency and wavelength must be positive; amplitude non-negative');
    }
    return {
      frequency: f,
      wavelength: lambda,
      amplitude: A,
      velocity: roundTo(f * lambda, 4),
      period: roundTo(1 / f, 4),
      angularFrequency: roundTo(2 * Math.PI * f, 4),
      waveNumber: roundTo((2 * Math.PI) / lambda, 4)
    };
  }

  // --- G. LASER REFLECTION & REFRACTION ---
  function calculateReflection(incidentAngleDeg) {
    var i = Number(incidentAngleDeg);
    if (i < 0 || i > 90) throw new Error('Incident angle must be between 0° and 90°');
    return {
      incidentAngle: roundTo(i, 2),
      reflectedAngle: roundTo(i, 2)
    };
  }

  function calculateRefraction(params) {
    var i = Number(params.incidentAngleDeg);
    var n1 = Number(params.n1);
    var n2 = Number(params.n2);
    if (i < 0 || i >= 90) throw new Error('Incident angle must be in [0°, 90°)');
    if (n1 < 1 || n2 < 1) throw new Error('Refractive indices must be >= 1.0');

    var criticalAngle = null;
    if (n1 > n2) {
      criticalAngle = roundTo(toDegrees(Math.asin(n2 / n1)), 3);
    }

    var sinTheta2 = (n1 / n2) * Math.sin(toRadians(i));
    if (sinTheta2 > 1) {
      return {
        incidentAngle: roundTo(i, 2),
        n1: n1,
        n2: n2,
        criticalAngle: criticalAngle,
        isTIR: true,
        refractedAngle: null,
        reflectedAngle: roundTo(i, 2)
      };
    }

    var r = toDegrees(Math.asin(sinTheta2));
    return {
      incidentAngle: roundTo(i, 2),
      n1: n1,
      n2: n2,
      criticalAngle: criticalAngle,
      isTIR: false,
      refractedAngle: roundTo(r, 3),
      reflectedAngle: roundTo(i, 2)
    };
  }

  // --- H. PRISM DISPERSION (Cauchy Equation + Snell's Law) ---
  function cauchyRefractiveIndex(wavelengthNm, A, B) {
    var lambdaUm = wavelengthNm / 1000;
    return roundTo(A + B / (lambdaUm * lambdaUm), 5);
  }

  function calculatePrismRay(params) {
    var i1 = Number(params.incidentAngleDeg);
    var apex = Number(params.apexAngleDeg || 60);
    var n = Number(params.n);

    var sinR1 = Math.sin(toRadians(i1)) / n;
    if (Math.abs(sinR1) > 1) {
      return { valid: false, tirInside: true };
    }
    var r1 = toDegrees(Math.asin(sinR1));
    var r2 = apex - r1;
    var sinE = n * Math.sin(toRadians(r2));
    if (Math.abs(sinE) > 1) {
      return {
        valid: true,
        tirInside: true,
        i1: roundTo(i1, 3),
        r1: roundTo(r1, 3),
        r2: roundTo(r2, 3),
        emergentAngle: null,
        deviation: null
      };
    }
    var e = toDegrees(Math.asin(sinE));
    var deviation = i1 + e - apex;
    return {
      valid: true,
      tirInside: false,
      i1: roundTo(i1, 3),
      r1: roundTo(r1, 3),
      r2: roundTo(r2, 3),
      emergentAngle: roundTo(e, 3),
      deviation: roundTo(deviation, 3)
    };
  }

  // --- I. STATISTICS & LINEAR REGRESSION ---
  function average(arr) {
    if (!arr || arr.length === 0) return null;
    var sum = 0;
    for (var i = 0; i < arr.length; i++) sum += Number(arr[i]);
    return roundTo(sum / arr.length, 4);
  }

  function linearRegression(points) {
    if (!points || points.length < 2) return null;
    var n = points.length;
    var sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
    for (var i = 0; i < n; i++) {
      var x = Number(points[i].x);
      var y = Number(points[i].y);
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
      sumYY += y * y;
    }
    var denom = n * sumXX - sumX * sumX;
    if (denom === 0) return null;
    var slope = (n * sumXY - sumX * sumY) / denom;
    var intercept = (sumY - slope * sumX) / n;

    var ssTot = 0, ssRes = 0, meanY = sumY / n;
    for (var j = 0; j < n; j++) {
      var pred = slope * Number(points[j].x) + intercept;
      ssRes += Math.pow(Number(points[j].y) - pred, 2);
      ssTot += Math.pow(Number(points[j].y) - meanY, 2);
    }
    var rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
    return {
      slope: roundTo(slope, 4),
      intercept: roundTo(intercept, 4),
      rSquared: roundTo(rSquared, 4)
    };
  }

  function formatCalculationSteps(spec) {
    return {
      title: spec.title || 'Calculation',
      given: spec.given || [],
      formula: spec.formula || '',
      substitution: spec.substitution || '',
      intermediate: spec.intermediate || '',
      result: spec.result || '',
      unit: spec.unit || '',
      explanation: spec.explanation || ''
    };
  }

  return {
    roundTo: roundTo,
    toRadians: toRadians,
    toDegrees: toDegrees,
    convertLength: convertLength,
    safeDivide: safeDivide,
    calculateVernierLeastCount: calculateVernierLeastCount,
    calculateVernierReading: calculateVernierReading,
    calculateScrewPitch: calculateScrewPitch,
    calculateScrewLeastCount: calculateScrewLeastCount,
    calculateScrewReading: calculateScrewReading,
    calculatePendulumPeriod: calculatePendulumPeriod,
    calculateGFromPendulum: calculateGFromPendulum,
    calculateOhmsLaw: calculateOhmsLaw,
    calculateProjectile: calculateProjectile,
    calculateWave: calculateWave,
    calculateReflection: calculateReflection,
    calculateRefraction: calculateRefraction,
    cauchyRefractiveIndex: cauchyRefractiveIndex,
    calculatePrismRay: calculatePrismRay,
    average: average,
    linearRegression: linearRegression,
    formatCalculationSteps: formatCalculationSteps
  };
}));
