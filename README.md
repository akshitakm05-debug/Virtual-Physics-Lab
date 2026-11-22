# Virtual Physics Laboratory

> *"Understand Physics Through Experimentation."*

An interactive, zero-dependency, browser-based **Virtual Physics Laboratory** designed for engineering and science students. Built with modular HTML5, CSS3, SVG, Canvas 2D, and pure JavaScript—ready to run locally or deploy directly to **GitHub Pages**.

## Features

1. **6 Configurable Experiment Modules** (`js/experiment-manager.js`)
   - **EXP-01:** Vernier Caliper — Precision Length & Diameter Measurement (with zero-error correction)
   - **EXP-02:** Micrometer Screw Gauge — Wire Thickness Measurement
   - **EXP-03:** Simple Pendulum — Determination of $g$ (with animated bob + digital stopwatch)
   - **EXP-04:** Ohm's Law ($V = IR$) Verification (with live Ammeter/Voltmeter dials & short-circuit protection)
   - **EXP-05:** Laser Optics — Snell's Law & Total Internal Reflection
   - **EXP-06:** Projectile Motion — Trajectory, Height & Range Analysis
2. **Virtual Instrumentation System** (`js/instrument-engine.js`)
   - Interactive SVG Vernier Caliper (External, Internal, Depth modes + Locking Screw)
   - Interactive SVG Screw Gauge (Sleeve + Rotating Thimble + Ratchet)
   - Accurate Digital Stopwatch (Start, Pause, Resume, Reset, Lap Recording)
   - Meter Scale with `mm`/`cm`/`m` conversion
   - Circuit-linked Ammeter & Voltmeter dials with overload indication
   - Optical Ray Diagrams (Convex/Concave Lens, Plane/Concave/Convex Mirror)
3. **Laser Physics Lab** (`js/laser-engine.js`)
   - Reflection Simulator ($\theta_i = \theta_r$)
   - Refraction Simulator ($n_1 \sin\theta_1 = n_2 \sin\theta_2$) with automatic Total Internal Reflection (TIR)
   - Prism Dispersion Simulator using Cauchy's wavelength-dependent refractive index $n(\lambda) = A + B/\lambda^2$
4. **Automatic Graph Generator** (`js/graph-engine.js`)
   - Pure Canvas 2D scientific plotting (Scatter, Linear, Curve)
   - Dynamic X/Y axis selection, Line of Best Fit ($R^2$), and PNG export
5. **Observation, Calculation & Report Engines** (`js/observation-manager.js`, `js/calculation-engine.js`)
   - Step-by-step Formula → Substitution → Intermediate → Result display
   - `localStorage` persistence, CSV export, and printable HTML/PDF Experiment Report Generator
6. **Physics Playground & Knowledge Assessment** (`js/main.js`, `js/quiz-engine.js`)
   - Real-time Wave Motion simulator ($v = f\lambda$) and per-experiment MCQ quizzes with explanations

## Project Structure

```text
virtual-physics-lab/
├── css/
│   ├── style.css
│   ├── laboratory.css
│   ├── simulator.css
│   └── responsive.css
├── js/
│   ├── calculation-engine.js
│   ├── physics-engine.js
│   ├── observation-manager.js
│   ├── graph-engine.js
│   ├── instrument-engine.js
│   ├── laser-engine.js
│   ├── experiment-manager.js
│   ├── quiz-engine.js
│   └── main.js
├── tests/
│   └── physics-tests.js
├── index.html
└── README.md
```

## Setup & Usage

### Run Locally
1. Clone or download this repository.
2. Open `index.html` directly in any modern browser (Chrome, Firefox, Edge, Safari)—no build step or server required!

### Deploy to GitHub Pages
1. Push the contents of `virtual-physics-lab/` to your GitHub repository.
2. Go to **Settings → Pages**, select your branch (`main`) and root folder (`/`), and click **Save**.

### Run Automated Unit Tests
```bash
node tests/physics-tests.js
```
