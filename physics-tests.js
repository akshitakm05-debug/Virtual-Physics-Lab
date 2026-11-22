/**
 * Virtual Physics Laboratory — Automated Unit Test Suite
 * Run with: node tests/physics-tests.js
 */
'use strict';

var assert = require('assert');
var Calc = require('../js/calculation-engine.js');
var Physics = require('../js/physics-engine.js');

var passed = 0;
var failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('PASS:', name);
  } catch (err) {
    failed++;
    console.error('FAIL:', name, '-', err.message);
  }
}

function approxEqual(actual, expected, tol, msg) {
  assert(Math.abs(actual - expected) <= tol, (msg || '') + ' expected ~' + expected + ', got ' + actual);
}

// 1. Vernier Caliper
test('Vernier Caliper known-value reading (2.3 cm + 5 * 0.01 cm)', function () {
  var lc = Calc.calculateVernierLeastCount(0.1, 10);
  assert.strictEqual(lc, 0.01);
  var res = Calc.calculateVernierReading({ msr: 2.3, vsd: 5, leastCount: lc, zeroError: 0 });
  assert.strictEqual(res.observed, 2.35);
  assert.strictEqual(res.corrected, 2.35);
});

// 2. Screw Gauge
test('Screw Gauge pitch, least count, and reading', function () {
  var lc = Calc.calculateScrewLeastCount(0.5, 50);
  assert.strictEqual(lc, 0.01);
  var res = Calc.calculateScrewReading({ msr: 2.5, csr: 24, pitch: 0.5, circularDivisions: 50, zeroError: 0 });
  assert.strictEqual(res.observed, 2.74);
  assert.strictEqual(res.corrected, 2.74);
});

// 3. Simple Pendulum
test('Simple Pendulum L=1m, g=9.81 m/s^2 -> T ≈ 2.006 s', function () {
  var T = Calc.calculatePendulumPeriod(1.0, 9.81);
  approxEqual(T, 2.006, 0.002, 'Pendulum period');
});

// 4. Ohm's Law
test("Ohm's Law V=12V, R=6Ω -> I=2A, open switch -> 0A, R=0 -> invalid", function () {
  var closed = Calc.calculateOhmsLaw({ voltage: 12, resistance: 6, switchClosed: true });
  assert.strictEqual(closed.valid, true);
  assert.strictEqual(closed.current, 2);

  var open = Calc.calculateOhmsLaw({ voltage: 12, resistance: 6, switchClosed: false });
  assert.strictEqual(open.valid, true);
  assert.strictEqual(open.current, 0);

  var shortCircuit = Calc.calculateOhmsLaw({ voltage: 12, resistance: 0, switchClosed: true });
  assert.strictEqual(shortCircuit.valid, false);
  assert.strictEqual(shortCircuit.overload, true);
});

// 5. Projectile Motion
test('Projectile Motion u=20 m/s, angle=45 deg, g=9.81 m/s^2 -> R ≈ 40.77 m', function () {
  var res = Calc.calculateProjectile({ u: 20, angleDeg: 45, g: 9.81 });
  approxEqual(res.range, 40.7747, 0.01, 'Projectile range');
  approxEqual(res.maxHeight, 10.1937, 0.01, 'Max height');
  approxEqual(res.timeOfFlight, 2.8834, 0.01, 'Time of flight');
});

// 6. Laser Reflection
test('Laser Reflection angle i=30 deg -> r=30 deg', function () {
  var res = Calc.calculateReflection(30);
  assert.strictEqual(res.incidentAngle, 30);
  assert.strictEqual(res.reflectedAngle, 30);
});

// 7. Laser Refraction & TIR
test('Laser Refraction Snell Law n1=1.0, n2=1.5, theta1=30 -> theta2 ≈ 19.471 deg', function () {
  var res = Calc.calculateRefraction({ incidentAngleDeg: 30, n1: 1.0, n2: 1.5 });
  assert.strictEqual(res.isTIR, false);
  approxEqual(res.refractedAngle, 19.471, 0.01, 'Refracted angle');
});

test('Laser Total Internal Reflection n1=1.5, n2=1.0, theta1=60 -> TIR', function () {
  var res = Calc.calculateRefraction({ incidentAngleDeg: 60, n1: 1.5, n2: 1.0 });
  assert.strictEqual(res.isTIR, true);
  approxEqual(res.criticalAngle, 41.81, 0.02, 'Critical angle');
});

// 8. Wave Motion & Linear Regression
test('Wave velocity v = f * lambda and linear regression', function () {
  var w = Calc.calculateWave({ frequency: 2, wavelength: 4, amplitude: 1 });
  assert.strictEqual(w.velocity, 8);
  var reg = Calc.linearRegression([{ x: 1, y: 3 }, { x: 2, y: 5 }, { x: 3, y: 7 }]);
  assert.strictEqual(reg.slope, 2);
  assert.strictEqual(reg.intercept, 1);
  assert.strictEqual(reg.rSquared, 1);
});

// 9. PhysicsEngine simulation wrapper
test('PhysicsEngine pendulum simulation separates theoretical & simulated outputs', function () {
  var sim = Physics.simulatePendulum({ lengthM: 1, g: 9.81, amplitudeDeg: 10 });
  approxEqual(sim.theoreticalOutput.periodS, 2.006, 0.002);
  assert(sim.calculatedOutput.periodS >= sim.theoreticalOutput.periodS);
});

console.log('\nTotal: ' + (passed + failed) + ' | Passed: ' + passed + ' | Failed: ' + failed);
if (failed > 0) process.exit(1);
