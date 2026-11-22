/**
 * Virtual Physics Laboratory — Experiment Management System
 * Contains 6 complete, scientifically accurate experiment modules.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.VPL = root.VPL || {};
    root.VPL.ExperimentManager = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var EXPERIMENTS = [
    {
      id: 'exp-01',
      number: 'EXP-01',
      title: 'Vernier Caliper — Precision Length & Diameter Measurement',
      category: 'Mechanics & Metrology',
      objective: 'To measure the external diameter, internal diameter, or depth of an object using a virtual Vernier caliper and apply zero-error correction.',
      theory: 'A Vernier caliper uses a main scale and a sliding Vernier scale to measure lengths to a fraction of the smallest main scale division. When 10 Vernier divisions equal 9 mm (9 MSD), the Least Count (LC) is 1 MSD − 1 VSD = 0.1 cm − 0.09 cm = 0.01 cm.',
      apparatus: ['Virtual Vernier Caliper (LC = 0.01 cm)', 'Cylindrical / Hollow Test Specimen', 'Locking Screw & Depth Rod'],
      setup: 'Select the measurement mode (External, Internal, or Depth), set any instrument Zero Error, and slide the movable jaw to clamp the specimen.',
      formula: 'Corrected Reading = [MSR + (VSD × LC)] − Zero Error',
      precautions: [
        'Check and record the zero error before taking any measurement.',
        'Ensure the coinciding Vernier division is read perpendicular to the scale to avoid parallax.',
        'Do not over-tighten the jaws on the specimen.'
      ],
      conclusion: 'The Vernier caliper accurately resolves dimensions down to 0.01 cm, and zero-error correction eliminates systematic offset.',
      columns: [
        { key: 'trial', label: 'Trial', unit: '#' },
        { key: 'mode', label: 'Mode', unit: '' },
        { key: 'msr', label: 'MSR', unit: 'cm' },
        { key: 'vsd', label: 'VSD', unit: 'div' },
        { key: 'observed', label: 'Observed', unit: 'cm' },
        { key: 'zeroError', label: 'Zero Error', unit: 'cm' },
        { key: 'corrected', label: 'Corrected', unit: 'cm' }
      ],
      graphConfig: { defaultX: 'trial', defaultY: 'corrected', chartType: 'scatter', allowBestFit: false },
      quiz: [
        {
          question: 'If 1 MSD = 0.1 cm and 10 Vernier divisions coincide with 9 main scale divisions, what is the Least Count?',
          options: ['0.1 cm', '0.01 cm', '0.001 cm', '0.05 cm'],
          answer: 1,
          explanation: 'LC = 1 MSD / N = 0.1 cm / 10 = 0.01 cm.'
        },
        {
          question: 'If MSR = 2.3 cm, VSD = 5, LC = 0.01 cm, and Zero Error = +0.02 cm, what is the Corrected Reading?',
          options: ['2.35 cm', '2.37 cm', '2.33 cm', '2.30 cm'],
          answer: 2,
          explanation: 'Observed = 2.3 + (5 × 0.01) = 2.35 cm. Corrected = 2.35 − (+0.02) = 2.33 cm.'
        },
        {
          question: 'Which part of a Vernier caliper is used to measure the depth of a narrow cylinder?',
          options: ['External jaws', 'Internal jaws', 'Depth rod', 'Locking screw'],
          answer: 2,
          explanation: 'The thin sliding depth rod extends from the rear of the main scale beam to measure depths.'
        }
      ]
    },
    {
      id: 'exp-02',
      number: 'EXP-02',
      title: 'Micrometer Screw Gauge — Wire Thickness Measurement',
      category: 'Mechanics & Metrology',
      objective: 'To measure the diameter of a thin wire or small sphere using a micrometer screw gauge and apply zero-error correction.',
      theory: 'A screw gauge converts small rotational motion of a precision screw into linear displacement along a sleeve. With pitch = 0.5 mm and 50 circular scale divisions, Least Count = 0.5 mm / 50 = 0.01 mm.',
      apparatus: ['Virtual Micrometer Screw Gauge (Pitch = 0.5 mm, 50 div)', 'Test Wire / Sphere Specimen', 'Ratchet Stop'],
      setup: 'Adjust the thimble rotation to position the spindle against the specimen, observe the sleeve (MSR) and circular (CSR) readings, and apply zero-error correction.',
      formula: 'Corrected Reading = [MSR + (CSR × LC)] − Zero Error',
      precautions: [
        'Always turn the ratchet rather than the thimble directly to avoid excessive pressure.',
        'Account for the sign of the zero error (+ or −) carefully.',
        'Take readings at multiple points along the wire to check uniformity.'
      ],
      conclusion: 'The micrometer screw gauge achieves 0.01 mm precision, making it suitable for thin wires and sheet thicknesses.',
      columns: [
        { key: 'trial', label: 'Trial', unit: '#' },
        { key: 'msr', label: 'MSR', unit: 'mm' },
        { key: 'csr', label: 'CSR', unit: 'div' },
        { key: 'observed', label: 'Observed', unit: 'mm' },
        { key: 'zeroError', label: 'Zero Error', unit: 'mm' },
        { key: 'corrected', label: 'Corrected', unit: 'mm' }
      ],
      graphConfig: { defaultX: 'trial', defaultY: 'corrected', chartType: 'scatter', allowBestFit: false },
      quiz: [
        {
          question: 'A screw gauge has a pitch of 0.5 mm and 50 divisions on its circular scale. Its Least Count is:',
          options: ['0.05 mm', '0.01 mm', '0.005 mm', '0.1 mm'],
          answer: 1,
          explanation: 'LC = Pitch / Circular Divisions = 0.5 mm / 50 = 0.01 mm.'
        },
        {
          question: 'What is the purpose of the ratchet on a screw gauge?',
          options: ['To lock the spindle', 'To apply uniform gentle pressure and prevent backlash', 'To zero the sleeve scale', 'To measure depth'],
          answer: 1,
          explanation: 'The ratchet slips once uniform contact pressure is reached, preventing deformation of the object or screw threads.'
        },
        {
          question: 'If MSR = 2.5 mm, CSR = 24, LC = 0.01 mm, and Zero Error = 0, what is the reading?',
          options: ['2.74 mm', '2.24 mm', '2.524 mm', '2.98 mm'],
          answer: 0,
          explanation: 'Observed = 2.5 + (24 × 0.01) = 2.74 mm.'
        }
      ]
    },
    {
      id: 'exp-03',
      number: 'EXP-03',
      title: 'Simple Pendulum — Determination of Acceleration Due to Gravity (g)',
      category: 'Oscillations & Gravity',
      objective: 'To determine the time period T of a simple pendulum for various lengths L, plot T² vs L, and verify T = 2π√(L/g).',
      theory: 'For small angular displacements (θ < 15°), a simple pendulum executes simple harmonic motion with period T = 2π√(L/g). Squaring both sides gives T² = (4π²/g)L, a linear relationship between T² and L.',
      apparatus: ['Bob & Inextensible String', 'Adjustable Length Support', 'Digital Stopwatch'],
      setup: 'Set the pendulum length L (in meters) and gravitational acceleration g. Start the oscillation and use the integrated digital stopwatch to measure the time period, or record the simulated period.',
      formula: 'T = 2π √(L / g)   ⇒   g = 4π²L / T²',
      precautions: [
        'Keep the initial angular amplitude small (≤ 10°) so the small-angle approximation holds.',
        'Measure length L from the point of suspension to the center of mass of the bob.',
        'Avoid conical motion; ensure oscillation stays in a vertical plane.'
      ],
      conclusion: 'The graph of T² versus L is a straight line passing through the origin, confirming T ∝ √L and yielding g ≈ 9.81 m/s².',
      columns: [
        { key: 'lengthM', label: 'Length L', unit: 'm' },
        { key: 'gInput', label: 'g (Set)', unit: 'm/s²' },
        { key: 'measuredT', label: 'Measured T', unit: 's' },
        { key: 'tSquared', label: 'T²', unit: 's²' },
        { key: 'theoreticalT', label: 'Theory T', unit: 's' },
        { key: 'calculatedG', label: 'Calc g', unit: 'm/s²' }
      ],
      graphConfig: { defaultX: 'lengthM', defaultY: 'tSquared', chartType: 'scatter', allowBestFit: true },
      quiz: [
        {
          question: 'For a simple pendulum of length L = 1.0 m at g = 9.81 m/s², what is the theoretical time period T?',
          options: ['1.000 s', '2.006 s', '3.142 s', '4.012 s'],
          answer: 1,
          explanation: 'T = 2π√(1.0 / 9.81) ≈ 2.006 s.'
        },
        {
          question: 'If the length of a simple pendulum is quadrupled (4L), how does its time period change?',
          options: ['Halves', 'Doubles', 'Quadruples', 'Remains unchanged'],
          answer: 1,
          explanation: 'Since T ∝ √L, √4 = 2, so the time period doubles.'
        },
        {
          question: 'What is the slope of the T² vs L graph for a simple pendulum?',
          options: ['g / 4π²', '4π² / g', '2π / √g', '√(g / L)'],
          answer: 1,
          explanation: 'T² = (4π²/g)L, so the slope m = 4π²/g.'
        }
      ]
    },
    {
      id: 'exp-04',
      number: 'EXP-04',
      title: "Ohm's Law — Voltage, Current & Resistance Relationship",
      category: 'Electricity & Circuits',
      objective: "To verify Ohm's Law (V = IR) by measuring current I across a resistor for varying applied voltages V and plotting V vs I.",
      theory: "Ohm's Law states that at constant temperature, the current I flowing through an ohmic conductor is directly proportional to the potential difference V across its ends: V = I·R.",
      apparatus: ['DC Voltage Source (0–24 V)', 'Variable Ohmic Resistor', 'Ammeter (0–5 A)', 'Voltmeter (0–25 V)', 'Circuit Switch'],
      setup: 'Set the resistance R and source voltage V, close the circuit switch, read the Ammeter and Voltmeter dials, and record observations across multiple voltages.',
      formula: 'V = I × R   ⇒   I = V / R',
      precautions: [
        'Keep the switch open while changing circuit parameters to prevent heating.',
        'Never set resistance to 0 Ω with the switch closed (short circuit).',
        'Ensure Ammeter is in series and Voltmeter is in parallel.'
      ],
      conclusion: "The V vs I graph is a straight line through the origin whose slope equals the circuit resistance R, verifying Ohm's Law.",
      columns: [
        { key: 'voltage', label: 'Voltage V', unit: 'V' },
        { key: 'resistance', label: 'Resistance R', unit: 'Ω' },
        { key: 'current', label: 'Current I', unit: 'A' },
        { key: 'power', label: 'Power P', unit: 'W' }
      ],
      graphConfig: { defaultX: 'current', defaultY: 'voltage', chartType: 'scatter', allowBestFit: true },
      quiz: [
        {
          question: 'With V = 12 V and R = 6 Ω (switch closed), what current does the ammeter read?',
          options: ['0.5 A', '2.0 A', '6.0 A', '72 A'],
          answer: 1,
          explanation: 'By Ohm’s Law, I = V / R = 12 / 6 = 2.0 A.'
        },
        {
          question: 'What is the current in the circuit when the switch is open?',
          options: ['V / R', 'Infinite', '0 A', 'Depends on voltage'],
          answer: 2,
          explanation: 'An open switch breaks the conducting path, so current I = 0 A.'
        },
        {
          question: 'In a V (y-axis) vs I (x-axis) graph for an ohmic resistor, the slope represents:',
          options: ['Conductance (1/R)', 'Resistance (R)', 'Power (P)', 'Charge (Q)'],
          answer: 1,
          explanation: 'Since V = R·I, the slope ΔV/ΔI equals the resistance R.'
        }
      ]
    },
    {
      id: 'exp-05',
      number: 'EXP-05',
      title: "Laser Optics — Snell's Law & Total Internal Reflection",
      category: 'Optics & Lasers',
      objective: "To verify Snell's Law of refraction across optical media and observe Total Internal Reflection (TIR) above the critical angle.",
      theory: "When light crosses a boundary between media of refractive indices n₁ and n₂, n₁ sin(θ₁) = n₂ sin(θ₂). When n₁ > n₂ and θ₁ > θc = arcsin(n₂/n₁), all light undergoes Total Internal Reflection.",
      apparatus: ['Monochromatic Laser Source', 'Selectable Optical Media (Air, Water, Crown/Flint Glass, Diamond)', 'Angular Protractor'],
      setup: 'Choose Medium 1 and Medium 2, turn ON the laser, vary the incident angle θ₁, and record θ₁ and θ₂ (or TIR status).',
      formula: 'n₁ sin(θ₁) = n₂ sin(θ₂)   |   θc = arcsin(n₂ / n₁)',
      precautions: [
        'Measure all angles with respect to the normal, not the interface surface.',
        'Check whether n₁ > n₂ before expecting a critical angle.',
        'Avoid looking directly into the laser beam in real lab settings.'
      ],
      conclusion: "Refracted angles follow Snell's Law exactly, and Total Internal Reflection occurs whenever θ₁ exceeds θc in a denser-to-rarer transition.",
      columns: [
        { key: 'n1', label: 'n₁', unit: '' },
        { key: 'n2', label: 'n₂', unit: '' },
        { key: 'incidentAngle', label: 'θ₁', unit: '°' },
        { key: 'refractedAngle', label: 'θ₂', unit: '°' },
        { key: 'tir', label: 'TIR?', unit: '' }
      ],
      graphConfig: { defaultX: 'incidentAngle', defaultY: 'refractedAngle', chartType: 'curve', allowBestFit: false },
      quiz: [
        {
          question: 'Light travels from Air (n₁ = 1.0) into Glass (n₂ = 1.5) at θ₁ = 30°. What is sin(θ₂)?',
          options: ['0.333', '0.500', '0.750', '0.866'],
          answer: 0,
          explanation: 'sin(θ₂) = (n₁/n₂) sin(30°) = (1.0/1.5) × 0.5 = 0.333 (θ₂ ≈ 19.47°).'
        },
        {
          question: 'When does Total Internal Reflection (TIR) occur?',
          options: [
            'Light goes from rarer to denser medium at any angle',
            'Light goes from denser to rarer medium with θ₁ > θc',
            'Light strikes at 0° incidence',
            'n₁ equals n₂'
          ],
          answer: 1,
          explanation: 'TIR requires n₁ > n₂ and an incident angle greater than the critical angle θc = arcsin(n₂/n₁).'
        },
        {
          question: 'In the Law of Reflection, if the incident angle is 30°, the reflected angle is:',
          options: ['15°', '30°', '60°', '90°'],
          answer: 1,
          explanation: 'The angle of reflection always equals the angle of incidence (θᵣ = θᵢ = 30°).'
        }
      ]
    },
    {
      id: 'exp-06',
      number: 'EXP-06',
      title: 'Projectile Motion — Trajectory, Height & Range Analysis',
      category: 'Kinematics',
      objective: 'To study two-dimensional projectile motion by varying launch angle θ and initial speed u, and verifying maximum range at 45°.',
      theory: 'Neglecting air resistance, horizontal velocity u cos(θ) is constant while vertical motion experiences constant downward acceleration g. Range R = u² sin(2θ) / g.',
      apparatus: ['Virtual Projectile Launcher', '2D Trajectory Canvas', 'Angle & Velocity Controls'],
      setup: 'Configure initial velocity u (m/s), launch angle θ (degrees), and gravity g (m/s²). Launch the projectile to trace its parabolic path and record the results.',
      formula: 'T = 2u sin(θ)/g   |   H = u² sin²(θ)/(2g)   |   R = u² sin(2θ)/g',
      precautions: [
        'Ensure angles are converted to radians before trigonometric evaluation.',
        'Remember this ideal model ignores air resistance and wind.',
        'Compare complementary angles (e.g., 30° and 60°) which yield equal range.'
      ],
      conclusion: 'Horizontal range peaks at θ = 45° for level ground, while maximum height and time of flight increase monotonically up to 90°.',
      columns: [
        { key: 'u', label: 'Speed u', unit: 'm/s' },
        { key: 'angleDeg', label: 'Angle θ', unit: '°' },
        { key: 'timeOfFlight', label: 'Flight Time', unit: 's' },
        { key: 'maxHeight', label: 'Max Height', unit: 'm' },
        { key: 'range', label: 'Range R', unit: 'm' }
      ],
      graphConfig: { defaultX: 'angleDeg', defaultY: 'range', chartType: 'curve', allowBestFit: false },
      quiz: [
        {
          question: 'On level ground (ignoring air resistance), which launch angle produces maximum horizontal range?',
          options: ['30°', '45°', '60°', '90°'],
          answer: 1,
          explanation: 'R = u² sin(2θ)/g is maximized when sin(2θ) = 1, i.e., 2θ = 90° ⇒ θ = 45°.'
        },
        {
          question: 'With u = 20 m/s, θ = 45°, and g = 9.81 m/s², what is the horizontal range R?',
          options: ['20.39 m', '40.77 m', '81.55 m', '10.19 m'],
          answer: 1,
          explanation: 'R = 20² × sin(90°) / 9.81 = 400 / 9.81 ≈ 40.77 m.'
        },
        {
          question: 'Which pair of launch angles gives the exact same horizontal range for the same speed u?',
          options: ['20° and 50°', '30° and 60°', '45° and 90°', '15° and 45°'],
          answer: 1,
          explanation: 'Complementary angles (θ and 90° − θ) have identical values of sin(2θ), so 30° and 60° yield the same range.'
        }
      ]
    }
  ];

  function getAllExperiments() {
    return EXPERIMENTS;
  }

  function getExperimentById(id) {
    for (var i = 0; i < EXPERIMENTS.length; i++) {
      if (EXPERIMENTS[i].id === id) return EXPERIMENTS[i];
    }
    return EXPERIMENTS[0];
  }

  return {
    getAllExperiments: getAllExperiments,
    getExperimentById: getExperimentById
  };
}));
