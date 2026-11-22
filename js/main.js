/**
 * Virtual Physics Laboratory — Main UI Controller
 */
(function () {
  'use strict';

  var Calc = window.VPL.CalculationEngine;
  var Physics = window.VPL.PhysicsEngine;
  var Obs = window.VPL.ObservationManager;
  var Graph = window.VPL.GraphEngine;
  var Inst = window.VPL.InstrumentEngine;
  var Laser = window.VPL.LaserEngine;
  var ExpMgr = window.VPL.ExperimentManager;
  var Quiz = window.VPL.QuizEngine;

  var appRoot = document.getElementById('appRoot');
  var currentView = 'experiments';
  var currentExpId = 'exp-01';
  var animFrameIds = [];

  function stopAnimations() {
    animFrameIds.forEach(function (id) { cancelAnimationFrame(id); });
    animFrameIds = [];
  }

  // Navigation tabs
  document.querySelectorAll('.nav-tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.nav-tab').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentView = btn.getAttribute('data-view');
      renderCurrentView();
    });
  });

  function renderCurrentView() {
    stopAnimations();
    if (currentView === 'experiments') renderExperimentsView();
    else if (currentView === 'instruments') renderInstrumentsView();
    else if (currentView === 'laser') renderLaserView();
    else if (currentView === 'playground') renderPlaygroundView();
    else renderProgressView();
  }

  // =========================================================================
  // 1. EXPERIMENTS VIEW (6 MODULES)
  // =========================================================================
  function renderExperimentsView() {
    var exps = ExpMgr.getAllExperiments();
    var exp = ExpMgr.getExperimentById(currentExpId);
    var completed = Obs.getCompletedMap();

    var sidebarHtml = exps.map(function (e) {
      var isDone = completed[e.id];
      return '<button type="button" class="exp-list-item ' + (e.id === exp.id ? 'active' : '') + '" data-exp="' + e.id + '">' +
        '<span class="exp-num">' + e.number + (isDone ? ' ✓' : '') + '</span>' +
        '<span class="exp-name">' + e.title + '</span>' +
        '</button>';
    }).join('');

    var workflowHtml = [
      '1. Select', '2. Theory', '3. Apparatus', '4. Configure', '5. Simulate',
      '6. Measure', '7. Record', '8. Calculate', '9. Graph', '10. Report'
    ].map(function (s, idx) {
      return '<span class="workflow-step ' + (idx < 6 ? 'active' : '') + '">' + s + '</span>';
    }).join('');

    appRoot.innerHTML = '' +
      '<div class="workspace-grid">' +
      '  <aside class="exp-sidebar">' +
      '    <h3>Experiment Library</h3>' +
      sidebarHtml +
      '  </aside>' +
      '  <section>' +
      '    <div class="card">' +
      '      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">' +
      '        <div><span class="badge">' + exp.number + ' · ' + exp.category + '</span><h2>' + exp.title + '</h2></div>' +
      '        <div style="display:flex;gap:0.5rem;">' +
      '          <button type="button" class="btn btn-success btn-sm" id="btnMarkComplete">' + (completed[exp.id] ? 'Completed ✓' : 'Mark Completed') + '</button>' +
      '          <button type="button" class="btn btn-primary btn-sm" id="btnGenReport">Generate Report</button>' +
      '        </div>' +
      '      </div>' +
      '      <div class="workflow-steps">' + workflowHtml + '</div>' +
      '      <p><strong>Objective:</strong> ' + exp.objective + '</p>' +
      '      <p><strong>Scientific Theory:</strong> ' + exp.theory + '</p>' +
      '      <div class="formula-box">Formula: ' + exp.formula + '</div>' +
      '      <p><strong>Apparatus:</strong> ' + exp.apparatus.join(' · ') + '</p>' +
      '      <p><strong>Setup:</strong> ' + exp.setup + '</p>' +
      '    </div>' +
      '    <div class="card">' +
      '      <h3>Interactive Apparatus &amp; Simulation</h3>' +
      '      <div id="expSimArea"></div>' +
      '    </div>' +
      '    <div class="two-col">' +
      '      <div class="card">' +
      '        <h3>Step-by-Step Calculation Engine</h3>' +
      '        <div id="expCalcArea"></div>' +
      '      </div>' +
      '      <div class="card">' +
      '        <h3>Automatic Graph Generator</h3>' +
      '        <div id="expGraphControls" class="controls-grid"></div>' +
      '        <canvas id="expGraphCanvas" width="540" height="300" class="sim-canvas"></canvas>' +
      '        <div style="margin-top:0.5rem;display:flex;gap:0.5rem;">' +
      '          <button type="button" class="btn btn-sm" id="btnDownloadGraph">Download PNG</button>' +
      '          <button type="button" class="btn btn-sm" id="btnResetGraph">Reset Graph</button>' +
      '        </div>' +
      '      </div>' +
      '    </div>' +
      '    <div class="card">' +
      '      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.5rem;">' +
      '        <h3>Observation Table</h3>' +
      '        <div style="display:flex;gap:0.4rem;">' +
      '          <button type="button" class="btn btn-sm" id="btnExportCSV">Export CSV</button>' +
      '          <button type="button" class="btn btn-danger btn-sm" id="btnClearObs">Clear Observations</button>' +
      '        </div>' +
      '      </div>' +
      '      <div id="expObsTable" class="table-scroll"></div>' +
      '    </div>' +
      '    <div class="two-col">' +
      '      <div class="card">' +
      '        <h3>Precautions &amp; Conclusion</h3>' +
      '        <ul>' + exp.precautions.map(function (p) { return '<li>' + p + '</li>'; }).join('') + '</ul>' +
      '        <p><strong>Conclusion:</strong> ' + exp.conclusion + '</p>' +
      '      </div>' +
      '      <div class="card">' +
      '        <h3>Knowledge Assessment Quiz</h3>' +
      '        <div id="expQuizArea"></div>' +
      '      </div>' +
      '    </div>' +
      '  </section>' +
      '</div>';

    document.querySelectorAll('.exp-list-item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        currentExpId = btn.getAttribute('data-exp');
        renderExperimentsView();
      });
    });

    document.getElementById('btnMarkComplete').addEventListener('click', function () {
      var map = Obs.getCompletedMap();
      Obs.markCompleted(exp.id, !map[exp.id]);
      renderExperimentsView();
    });

    document.getElementById('btnExportCSV').addEventListener('click', function () {
      Obs.downloadCSV(exp.id + '-observations.csv', exp.columns, Obs.getObservations(exp.id));
    });

    document.getElementById('btnClearObs').addEventListener('click', function () {
      Obs.clearObservations(exp.id);
      refreshObsAndGraph(exp);
    });

    document.getElementById('btnDownloadGraph').addEventListener('click', function () {
      Graph.downloadPNG(document.getElementById('expGraphCanvas'), exp.id + '-graph.png');
    });

    document.getElementById('btnResetGraph').addEventListener('click', function () {
      setupGraphControls(exp);
      refreshObsAndGraph(exp);
    });

    document.getElementById('btnGenReport').addEventListener('click', function () {
      openExperimentReport(exp);
    });

    mountExperimentSimulator(exp);
    setupGraphControls(exp);
    refreshObsAndGraph(exp);

    Quiz.renderQuiz(document.getElementById('expQuizArea'), exp.id, exp.quiz, function (score, total) {
      Obs.saveQuizScore(exp.id, score, total);
    });
  }

  function renderCalculationBox(container, spec) {
    if (!container) return;
    container.innerHTML = '' +
      '<div class="calc-steps">' +
      '  <div><strong>Given:</strong> ' + spec.given.join(' | ') + '</div>' +
      '  <div><strong>Formula:</strong> <code>' + spec.formula + '</code></div>' +
      '  <div><strong>Substitution:</strong> <code>' + spec.substitution + '</code></div>' +
      (spec.intermediate ? '  <div><strong>Intermediate:</strong> ' + spec.intermediate + '</div>' : '') +
      '  <div class="calc-final">Result: ' + spec.result + ' ' + spec.unit + '</div>' +
      '  <div style="color:#475569;margin-top:0.35rem;">' + spec.explanation + '</div>' +
      '</div>';
  }

  function setupGraphControls(exp) {
    var numericCols = exp.columns.filter(function (c) {
      return c.key !== 'mode' && c.key !== 'tir';
    });
    var xOpts = numericCols.map(function (c) {
      return '<option value="' + c.key + '" ' + (c.key === exp.graphConfig.defaultX ? 'selected' : '') + '>' + c.label + '</option>';
    }).join('');
    var yOpts = numericCols.map(function (c) {
      return '<option value="' + c.key + '" ' + (c.key === exp.graphConfig.defaultY ? 'selected' : '') + '>' + c.label + '</option>';
    }).join('');

    document.getElementById('expGraphControls').innerHTML = '' +
      '<div class="control-group"><label>X-Axis</label><select id="gxSel">' + xOpts + '</select></div>' +
      '<div class="control-group"><label>Y-Axis</label><select id="gySel">' + yOpts + '</select></div>' +
      '<div class="control-group"><label>Chart Type</label><select id="gTypeSel">' +
      '  <option value="scatter" ' + (exp.graphConfig.chartType === 'scatter' ? 'selected' : '') + '>Scatter</option>' +
      '  <option value="line" ' + (exp.graphConfig.chartType === 'line' ? 'selected' : '') + '>Linear</option>' +
      '  <option value="curve" ' + (exp.graphConfig.chartType === 'curve' ? 'selected' : '') + '>Curve</option>' +
      '</select></div>' +
      '<div class="control-group"><label>Best Fit Line</label><select id="gFitSel">' +
      '  <option value="no">Off</option>' +
      '  <option value="yes" ' + (exp.graphConfig.allowBestFit ? 'selected' : '') + '>On (Linear Fit)</option>' +
      '</select></div>';

    ['gxSel', 'gySel', 'gTypeSel', 'gFitSel'].forEach(function (id) {
      document.getElementById(id).addEventListener('change', function () {
        refreshObsAndGraph(exp);
      });
    });
  }

  function refreshObsAndGraph(exp) {
    var rows = Obs.getObservations(exp.id);
    var tableWrap = document.getElementById('expObsTable');

    if (rows.length === 0) {
      tableWrap.innerHTML = '<p style="color:#64748b;">No observations recorded yet. Run the simulation and click <strong>Record Observation</strong>.</p>';
    } else {
      var ths = exp.columns.map(function (c) {
        return '<th>' + c.label + (c.unit ? ' (' + c.unit + ')' : '') + '</th>';
      }).join('') + '<th>Action</th>';

      var trs = rows.map(function (r) {
        var tds = exp.columns.map(function (c) {
          return '<td>' + (r[c.key] !== undefined && r[c.key] !== null ? r[c.key] : '—') + '</td>';
        }).join('');
        return '<tr>' + tds + '<td><button type="button" class="btn btn-danger btn-sm del-obs" data-id="' + r._id + '">Delete</button></td></tr>';
      }).join('');

      // Averages row
      var avgRow = exp.columns.map(function (c, idx) {
        if (idx === 0) return '<td><strong>Average</strong></td>';
        var nums = rows.map(function (r) { return Number(r[c.key]); }).filter(Number.isFinite);
        if (nums.length === 0 || c.key === 'trial') return '<td>—</td>';
        return '<td><strong>' + Calc.average(nums) + '</strong></td>';
      }).join('') + '<td></td>';

      tableWrap.innerHTML = '<table class="obs-table"><thead><tr>' + ths + '</tr></thead><tbody>' + trs + '<tr>' + avgRow + '</tr></tbody></table>';
      tableWrap.querySelectorAll('.del-obs').forEach(function (btn) {
        btn.addEventListener('click', function () {
          Obs.deleteObservation(exp.id, btn.getAttribute('data-id'));
          refreshObsAndGraph(exp);
        });
      });
    }

    // Graph
    var gx = document.getElementById('gxSel').value;
    var gy = document.getElementById('gySel').value;
    var gType = document.getElementById('gTypeSel').value;
    var showFit = document.getElementById('gFitSel').value === 'yes';

    var xCol = exp.columns.find(function (c) { return c.key === gx; }) || { label: gx, unit: '' };
    var yCol = exp.columns.find(function (c) { return c.key === gy; }) || { label: gy, unit: '' };

    var pts = rows.map(function (r, idx) {
      return {
        x: gx === 'trial' ? (idx + 1) : Number(r[gx]),
        y: Number(r[gy])
      };
    });

    Graph.renderGraph(document.getElementById('expGraphCanvas'), {
      points: pts,
      xLabel: xCol.label + (xCol.unit ? ' (' + xCol.unit + ')' : ''),
      yLabel: yCol.label + (yCol.unit ? ' (' + yCol.unit + ')' : ''),
      title: exp.number + ': ' + yCol.label + ' vs ' + xCol.label,
      chartType: gType,
      showBestFit: showFit
    });
  }

  function mountExperimentSimulator(exp) {
    var area = document.getElementById('expSimArea');
    var calcArea = document.getElementById('expCalcArea');

    if (exp.id === 'exp-01') {
      var vState = { jawOpeningCm: 2.35, zeroError: 0, mode: 'external', locked: false };
      area.innerHTML = '' +
        '<div id="vcSvg"></div>' +
        '<div class="controls-grid">' +
        '  <div class="control-group"><label>Jaw Opening (cm): <span id="vcVal">2.35</span></label><input type="range" id="vcSlider" min="0" max="5.5" step="0.01" value="2.35"/></div>' +
        '  <div class="control-group"><label>Zero Error (cm)</label><input type="number" id="vcZE" step="0.01" min="-0.2" max="0.2" value="0"/></div>' +
        '  <div class="control-group"><label>Mode</label><select id="vcMode"><option value="external">External</option><option value="internal">Internal</option><option value="depth">Depth</option></select></div>' +
        '</div>' +
        '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;">' +
        '  <button type="button" class="btn btn-primary" id="vcRecord">Record Observation</button>' +
        '  <button type="button" class="btn" id="vcLock">Toggle Lock</button>' +
        '  <button type="button" class="btn" id="vcReset">Reset</button>' +
        '</div>';

      var lastReading = null;
      var updateVC = function () {
        document.getElementById('vcVal').textContent = Number(vState.jawOpeningCm).toFixed(2);
        lastReading = Inst.renderVernierSVG(document.getElementById('vcSvg'), vState);
        renderCalculationBox(calcArea, {
          given: ['MSR = ' + lastReading.msr + ' cm', 'VSD = ' + lastReading.vsd, 'LC = ' + lastReading.leastCount + ' cm', 'Zero Error = ' + lastReading.zeroError + ' cm'],
          formula: 'Corrected = [MSR + (VSD × LC)] − Zero Error',
          substitution: '[' + lastReading.msr + ' + (' + lastReading.vsd + ' × ' + lastReading.leastCount + ')] − (' + lastReading.zeroError + ')',
          intermediate: 'Observed = ' + lastReading.observed + ' cm',
          result: lastReading.corrected,
          unit: 'cm',
          explanation: 'Vernier scale reading agrees with the coinciding division #' + lastReading.vsd + '.'
        });
      };
      document.getElementById('vcSlider').addEventListener('input', function (e) {
        if (!vState.locked) { vState.jawOpeningCm = Number(e.target.value); updateVC(); }
        else e.target.value = vState.jawOpeningCm;
      });
      document.getElementById('vcZE').addEventListener('input', function (e) { vState.zeroError = Number(e.target.value || 0); updateVC(); });
      document.getElementById('vcMode').addEventListener('change', function (e) { vState.mode = e.target.value; updateVC(); });
      document.getElementById('vcLock').addEventListener('click', function () { vState.locked = !vState.locked; updateVC(); });
      document.getElementById('vcReset').addEventListener('click', function () {
        vState = { jawOpeningCm: 0, zeroError: 0, mode: 'external', locked: false };
        document.getElementById('vcSlider').value = 0;
        document.getElementById('vcZE').value = 0;
        updateVC();
      });
      document.getElementById('vcRecord').addEventListener('click', function () {
        var count = Obs.getObservations(exp.id).length + 1;
        Obs.addObservation(exp.id, {
          trial: count, mode: vState.mode, msr: lastReading.msr, vsd: lastReading.vsd,
          observed: lastReading.observed, zeroError: lastReading.zeroError, corrected: lastReading.corrected
        });
        refreshObsAndGraph(exp);
      });
      updateVC();
    } else if (exp.id === 'exp-02') {
      var sState = { openingMm: 2.74, zeroError: 0, pitch: 0.5, circularDivisions: 50 };
      area.innerHTML = '' +
        '<div id="sgSvg"></div>' +
        '<div class="controls-grid">' +
        '  <div class="control-group"><label>Spindle Opening (mm): <span id="sgVal">2.74</span></label><input type="range" id="sgSlider" min="0" max="8" step="0.01" value="2.74"/></div>' +
        '  <div class="control-group"><label>Zero Error (mm)</label><input type="number" id="sgZE" step="0.01" min="-0.5" max="0.5" value="0"/></div>' +
        '</div>' +
        '<div style="display:flex;gap:0.5rem;">' +
        '  <button type="button" class="btn btn-primary" id="sgRecord">Record Observation</button>' +
        '  <button type="button" class="btn" id="sgReset">Reset</button>' +
        '</div>';
      var lastSG = null;
      var updateSG = function () {
        document.getElementById('sgVal').textContent = Number(sState.openingMm).toFixed(2);
        lastSG = Inst.renderScrewGaugeSVG(document.getElementById('sgSvg'), sState);
        renderCalculationBox(calcArea, {
          given: ['MSR = ' + lastSG.msr + ' mm', 'CSR = ' + lastSG.csr, 'LC = ' + lastSG.leastCount + ' mm', 'Zero Error = ' + lastSG.zeroError + ' mm'],
          formula: 'Corrected = [MSR + (CSR × LC)] − Zero Error',
          substitution: '[' + lastSG.msr + ' + (' + lastSG.csr + ' × ' + lastSG.leastCount + ')] − (' + lastSG.zeroError + ')',
          intermediate: 'Observed = ' + lastSG.observed + ' mm',
          result: lastSG.corrected,
          unit: 'mm',
          explanation: 'Pitch = 0.5 mm over 50 circular divisions yields LC = 0.01 mm.'
        });
      };
      document.getElementById('sgSlider').addEventListener('input', function (e) { sState.openingMm = Number(e.target.value); updateSG(); });
      document.getElementById('sgZE').addEventListener('input', function (e) { sState.zeroError = Number(e.target.value || 0); updateSG(); });
      document.getElementById('sgReset').addEventListener('click', function () {
        sState.openingMm = 0; sState.zeroError = 0;
        document.getElementById('sgSlider').value = 0; document.getElementById('sgZE').value = 0;
        updateSG();
      });
      document.getElementById('sgRecord').addEventListener('click', function () {
        var count = Obs.getObservations(exp.id).length + 1;
        Obs.addObservation(exp.id, {
          trial: count, msr: lastSG.msr, csr: lastSG.csr,
          observed: lastSG.observed, zeroError: lastSG.zeroError, corrected: lastSG.corrected
        });
        refreshObsAndGraph(exp);
      });
      updateSG();
    } else if (exp.id === 'exp-03') {
      mountPendulumSimulator(area, calcArea, exp);
    } else if (exp.id === 'exp-04') {
      mountOhmsLawSimulator(area, calcArea, exp);
    } else if (exp.id === 'exp-05') {
      mountLaserExperimentSimulator(area, calcArea, exp);
    } else if (exp.id === 'exp-06') {
      mountProjectileSimulator(area, calcArea, exp);
    }
  }

  function mountPendulumSimulator(area, calcArea, exp) {
    var pState = { lengthM: 1.0, g: 9.81, amplitudeDeg: 10 };
    var sw = Inst.createStopwatch();
    area.innerHTML = '' +
      '<div class="two-col">' +
      '  <canvas id="pendCanvas" width="440" height="260" class="sim-canvas"></canvas>' +
      '  <div>' +
      '    <div class="stopwatch-display" id="pendSwDisp">0.000 s</div>' +
      '    <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.75rem;">' +
      '      <button type="button" class="btn btn-primary btn-sm" id="pSwStart">Start</button>' +
      '      <button type="button" class="btn btn-sm" id="pSwPause">Pause</button>' +
      '      <button type="button" class="btn btn-sm" id="pSwLap">Lap</button>' +
      '      <button type="button" class="btn btn-sm" id="pSwReset">Reset Timer</button>' +
      '    </div>' +
      '    <div class="controls-grid">' +
      '      <div class="control-group"><label>Length L (m): <span id="pLenVal">1.0</span></label><input type="range" id="pLen" min="0.2" max="2.5" step="0.1" value="1.0"/></div>' +
      '      <div class="control-group"><label>Gravity g (m/s²)</label><input type="number" id="pGrav" step="0.01" min="1" max="25" value="9.81"/></div>' +
      '      <div class="control-group"><label>Initial Angle (°): <span id="pAmpVal">10</span></label><input type="range" id="pAmp" min="2" max="20" step="1" value="10"/></div>' +
      '    </div>' +
      '    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">' +
      '      <button type="button" class="btn btn-primary" id="pRecordSim">Record Simulated T</button>' +
      '      <button type="button" class="btn" id="pRecordSw">Record Stopwatch T</button>' +
      '      <button type="button" class="btn" id="pReset">Reset</button>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    var updateCalc = function () {
      var sim = Physics.simulatePendulum(pState);
      renderCalculationBox(calcArea, {
        given: ['L = ' + pState.lengthM + ' m', 'g = ' + pState.g + ' m/s²', 'θ₀ = ' + pState.amplitudeDeg + '°'],
        formula: 'T = 2π √(L / g)',
        substitution: '2π √(' + pState.lengthM + ' / ' + pState.g + ')',
        intermediate: 'Theoretical T = ' + sim.theoreticalOutput.periodS + ' s | Simulated T = ' + sim.calculatedOutput.periodS + ' s',
        result: sim.theoreticalOutput.periodS,
        unit: 's',
        explanation: sim.assumptionNote
      });
    };

    document.getElementById('pLen').addEventListener('input', function (e) { pState.lengthM = Number(e.target.value); document.getElementById('pLenVal').textContent = pState.lengthM; updateCalc(); });
    document.getElementById('pGrav').addEventListener('input', function (e) { pState.g = Math.max(0.5, Number(e.target.value || 9.81)); updateCalc(); });
    document.getElementById('pAmp').addEventListener('input', function (e) { pState.amplitudeDeg = Number(e.target.value); document.getElementById('pAmpVal').textContent = pState.amplitudeDeg; updateCalc(); });

    document.getElementById('pSwStart').addEventListener('click', function () { sw.start(); });
    document.getElementById('pSwPause').addEventListener('click', function () { sw.pause(); });
    document.getElementById('pSwLap').addEventListener('click', function () { sw.recordLap(); });
    document.getElementById('pSwReset').addEventListener('click', function () { sw.reset(); });

    var recordRow = function (Tval) {
      var theoryT = Calc.calculatePendulumPeriod(pState.lengthM, pState.g);
      var calcG = Calc.calculateGFromPendulum(pState.lengthM, Tval);
      Obs.addObservation(exp.id, {
        lengthM: pState.lengthM,
        gInput: pState.g,
        measuredT: Calc.roundTo(Tval, 4),
        tSquared: Calc.roundTo(Tval * Tval, 4),
        theoreticalT: theoryT,
        calculatedG: calcG
      });
      refreshObsAndGraph(exp);
    };

    document.getElementById('pRecordSim').addEventListener('click', function () {
      var sim = Physics.simulatePendulum(pState);
      recordRow(sim.calculatedOutput.periodS);
    });
    document.getElementById('pRecordSw').addEventListener('click', function () {
      var elapsed = sw.getElapsedSeconds();
      if (elapsed > 0) recordRow(elapsed);
    });
    document.getElementById('pReset').addEventListener('click', function () {
      pState = { lengthM: 1.0, g: 9.81, amplitudeDeg: 10 };
      document.getElementById('pLen').value = 1.0; document.getElementById('pLenVal').textContent = '1.0';
      document.getElementById('pGrav').value = 9.81;
      document.getElementById('pAmp').value = 10; document.getElementById('pAmpVal').textContent = '10';
      sw.reset();
      updateCalc();
    });

    updateCalc();

    var canvas = document.getElementById('pendCanvas');
    var ctx = canvas.getContext('2d');
    var t0 = performance.now();

    function drawPendulum(now) {
      var dt = (now - t0) / 1000;
      var T = Calc.calculatePendulumPeriod(pState.lengthM, pState.g);
      var omega = (2 * Math.PI) / T;
      var theta = Calc.toRadians(pState.amplitudeDeg) * Math.cos(omega * dt);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      var pivotX = canvas.width / 2;
      var pivotY = 24;
      var ropePx = 70 + pState.lengthM * 62;
      var bobX = pivotX + Math.sin(theta) * ropePx;
      var bobY = pivotY + Math.cos(theta) * ropePx;

      ctx.fillStyle = '#334155';
      ctx.fillRect(pivotX - 40, pivotY - 6, 80, 6);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(pivotX, pivotY); ctx.lineTo(bobX, bobY); ctx.stroke();

      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath(); ctx.arc(bobX, bobY, 14, 0, Math.PI * 2); ctx.fill();

      var swDisp = document.getElementById('pendSwDisp');
      if (swDisp) swDisp.textContent = sw.getElapsedSeconds().toFixed(3) + ' s';

      animFrameIds.push(requestAnimationFrame(drawPendulum));
    }
    animFrameIds.push(requestAnimationFrame(drawPendulum));
  }

  function mountOhmsLawSimulator(area, calcArea, exp) {
    var cState = { voltage: 12, resistance: 6, switchClosed: true };
    area.innerHTML = '' +
      '<div class="two-col">' +
      '  <div id="circuitMeters" style="display:flex;gap:0.75rem;flex-wrap:wrap;">' +
      '    <div id="ammeterBox" style="flex:1;min-width:170px;"></div>' +
      '    <div id="voltmeterBox" style="flex:1;min-width:170px;"></div>' +
      '  </div>' +
      '  <div>' +
      '    <div class="controls-grid">' +
      '      <div class="control-group"><label>Voltage V (V): <span id="ohmVVal">12</span></label><input type="range" id="ohmV" min="0" max="24" step="1" value="12"/></div>' +
      '      <div class="control-group"><label>Resistance R (Ω): <span id="ohmRVal">6</span></label><input type="range" id="ohmR" min="0" max="50" step="1" value="6"/></div>' +
      '    </div>' +
      '    <div id="ohmWarn" style="color:#b91c1c;font-weight:600;margin-bottom:0.5rem;"></div>' +
      '    <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">' +
      '      <button type="button" class="btn btn-primary" id="ohmSwitch">Switch: CLOSED</button>' +
      '      <button type="button" class="btn btn-success" id="ohmRecord">Record Observation</button>' +
      '      <button type="button" class="btn" id="ohmReset">Reset</button>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    var updateCircuit = function () {
      var res = Calc.calculateOhmsLaw(cState);
      Inst.renderMeterDialSVG(document.getElementById('ammeterBox'), {
        label: 'A', title: 'Ammeter', value: res.current, maxRange: 5, unit: 'A'
      });
      Inst.renderMeterDialSVG(document.getElementById('voltmeterBox'), {
        label: 'V', title: 'Voltmeter', value: cState.switchClosed ? cState.voltage : 0, maxRange: 25, unit: 'V'
      });
      document.getElementById('ohmWarn').textContent = res.error || res.warning || '';
      renderCalculationBox(calcArea, {
        given: ['V = ' + cState.voltage + ' V', 'R = ' + cState.resistance + ' Ω', 'Switch = ' + (cState.switchClosed ? 'CLOSED' : 'OPEN')],
        formula: 'I = V / R',
        substitution: cState.switchClosed ? (cState.voltage + ' / ' + cState.resistance) : 'Circuit Open ⇒ 0',
        intermediate: res.valid ? ('Power P = V × I = ' + res.power + ' W') : 'Invalid / Short Circuit',
        result: res.valid ? res.current : 'Undefined',
        unit: res.valid ? 'A' : '',
        explanation: "Ideal ohmic resistor obeying Ohm's Law (V = IR)."
      });
    };

    document.getElementById('ohmV').addEventListener('input', function (e) { cState.voltage = Number(e.target.value); document.getElementById('ohmVVal').textContent = cState.voltage; updateCircuit(); });
    document.getElementById('ohmR').addEventListener('input', function (e) { cState.resistance = Number(e.target.value); document.getElementById('ohmRVal').textContent = cState.resistance; updateCircuit(); });
    document.getElementById('ohmSwitch').addEventListener('click', function (e) {
      cState.switchClosed = !cState.switchClosed;
      e.target.textContent = 'Switch: ' + (cState.switchClosed ? 'CLOSED' : 'OPEN');
      updateCircuit();
    });
    document.getElementById('ohmRecord').addEventListener('click', function () {
      var res = Calc.calculateOhmsLaw(cState);
      if (!res.valid || !cState.switchClosed) return;
      Obs.addObservation(exp.id, { voltage: cState.voltage, resistance: cState.resistance, current: res.current, power: res.power });
      refreshObsAndGraph(exp);
    });
    document.getElementById('ohmReset').addEventListener('click', function () {
      cState = { voltage: 12, resistance: 6, switchClosed: true };
      document.getElementById('ohmV').value = 12; document.getElementById('ohmVVal').textContent = '12';
      document.getElementById('ohmR').value = 6; document.getElementById('ohmRVal').textContent = '6';
      document.getElementById('ohmSwitch').textContent = 'Switch: CLOSED';
      updateCircuit();
    });
    updateCircuit();
  }

  function mountLaserExperimentSimulator(area, calcArea, exp) {
    var lState = { mode: 'refraction', laserOn: true, incidentAngleDeg: 30, medium1: 'air', medium2: 'crownGlass' };
    var mediaOpts = Object.keys(Physics.OPTICAL_MEDIA).map(function (k) {
      return '<option value="' + k + '">' + Physics.OPTICAL_MEDIA[k].name + ' (n=' + Physics.OPTICAL_MEDIA[k].n + ')</option>';
    }).join('');

    area.innerHTML = '' +
      '<div id="expLaserSvg"></div>' +
      '<div class="controls-grid">' +
      '  <div class="control-group"><label>Incident Angle θ₁ (°): <span id="elAngVal">30</span></label><input type="range" id="elAng" min="0" max="85" step="1" value="30"/></div>' +
      '  <div class="control-group"><label>Medium 1</label><select id="elM1">' + mediaOpts + '</select></div>' +
      '  <div class="control-group"><label>Medium 2</label><select id="elM2">' + mediaOpts + '</select></div>' +
      '</div>' +
      '<div style="display:flex;gap:0.5rem;">' +
      '  <button type="button" class="btn btn-primary" id="elRecord">Record Observation</button>' +
      '  <button type="button" class="btn" id="elReset">Reset</button>' +
      '</div>';

    document.getElementById('elM1').value = 'air';
    document.getElementById('elM2').value = 'crownGlass';
    var lastLaser = null;

    var updateEL = function () {
      document.getElementById('elAngVal').textContent = lState.incidentAngleDeg;
      lastLaser = Laser.renderLaserLabSVG(document.getElementById('expLaserSvg'), lState);
      renderCalculationBox(calcArea, {
        given: ['n₁ = ' + lastLaser.n1, 'n₂ = ' + lastLaser.n2, 'θ₁ = ' + lastLaser.incidentAngle + '°'],
        formula: 'n₁ sin(θ₁) = n₂ sin(θ₂)',
        substitution: lastLaser.n1 + ' sin(' + lastLaser.incidentAngle + '°) = ' + lastLaser.n2 + ' sin(θ₂)',
        intermediate: lastLaser.criticalAngle ? ('Critical Angle θc = ' + lastLaser.criticalAngle + '°') : 'No critical angle (n₁ ≤ n₂)',
        result: lastLaser.isTIR ? 'TIR' : lastLaser.refractedAngle,
        unit: lastLaser.isTIR ? '' : '°',
        explanation: lastLaser.explanation
      });
    };

    document.getElementById('elAng').addEventListener('input', function (e) { lState.incidentAngleDeg = Number(e.target.value); updateEL(); });
    document.getElementById('elM1').addEventListener('change', function (e) { lState.medium1 = e.target.value; updateEL(); });
    document.getElementById('elM2').addEventListener('change', function (e) { lState.medium2 = e.target.value; updateEL(); });
    document.getElementById('elRecord').addEventListener('click', function () {
      Obs.addObservation(exp.id, {
        n1: lastLaser.n1, n2: lastLaser.n2, incidentAngle: lastLaser.incidentAngle,
        refractedAngle: lastLaser.isTIR ? 'TIR' : lastLaser.refractedAngle,
        tir: lastLaser.isTIR ? 'Yes' : 'No'
      });
      refreshObsAndGraph(exp);
    });
    document.getElementById('elReset').addEventListener('click', function () {
      lState = { mode: 'refraction', laserOn: true, incidentAngleDeg: 30, medium1: 'air', medium2: 'crownGlass' };
      document.getElementById('elAng').value = 30;
      document.getElementById('elM1').value = 'air';
      document.getElementById('elM2').value = 'crownGlass';
      updateEL();
    });
    updateEL();
  }

  function mountProjectileSimulator(area, calcArea, exp) {
    var prState = { u: 20, angleDeg: 45, g: 9.81 };
    area.innerHTML = '' +
      '<canvas id="projCanvas" width="600" height="240" class="sim-canvas"></canvas>' +
      '<div class="controls-grid">' +
      '  <div class="control-group"><label>Initial Velocity u (m/s): <span id="prUVal">20</span></label><input type="range" id="prU" min="5" max="40" step="1" value="20"/></div>' +
      '  <div class="control-group"><label>Launch Angle θ (°): <span id="prAVal">45</span></label><input type="range" id="prA" min="5" max="85" step="1" value="45"/></div>' +
      '  <div class="control-group"><label>Gravity g (m/s²)</label><input type="number" id="prG" step="0.01" min="1" max="25" value="9.81"/></div>' +
      '</div>' +
      '<div style="display:flex;gap:0.5rem;">' +
      '  <button type="button" class="btn btn-primary" id="prRecord">Record Observation</button>' +
      '  <button type="button" class="btn" id="prReset">Reset</button>' +
      '</div>';

    var drawProj = function () {
      var res = Calc.calculateProjectile(prState);
      var canvas = document.getElementById('projCanvas');
      var ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      var pad = 32;
      var maxScaleX = Math.max(res.range * 1.15, 20);
      var maxScaleY = Math.max(res.maxHeight * 1.3, 10);
      var sx = (canvas.width - 2 * pad) / maxScaleX;
      var sy = (canvas.height - 2 * pad) / maxScaleY;

      ctx.strokeStyle = '#334155';
      ctx.beginPath(); ctx.moveTo(pad, canvas.height - pad); ctx.lineTo(canvas.width - pad, canvas.height - pad); ctx.stroke();

      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      var steps = 60;
      for (var i = 0; i <= steps; i++) {
        var t = (res.timeOfFlight * i) / steps;
        var pt = res.pointAt(t);
        var cx = pad + pt.x * sx;
        var cy = canvas.height - pad - pt.y * sy;
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = '12px monospace';
      ctx.fillText('Range R = ' + res.range + ' m | Max Height H = ' + res.maxHeight + ' m | Flight Time T = ' + res.timeOfFlight + ' s', pad, 20);

      renderCalculationBox(calcArea, {
        given: ['u = ' + res.u + ' m/s', 'θ = ' + res.angleDeg + '°', 'g = ' + res.g + ' m/s²'],
        formula: 'R = u² sin(2θ) / g',
        substitution: res.u + '² × sin(' + (2 * res.angleDeg) + '°) / ' + res.g,
        intermediate: 'Time of Flight T = ' + res.timeOfFlight + ' s | Max Height H = ' + res.maxHeight + ' m',
        result: res.range,
        unit: 'm',
        explanation: 'Ideal projectile motion ignoring air resistance.'
      });
      return res;
    };

    document.getElementById('prU').addEventListener('input', function (e) { prState.u = Number(e.target.value); document.getElementById('prUVal').textContent = prState.u; drawProj(); });
    document.getElementById('prA').addEventListener('input', function (e) { prState.angleDeg = Number(e.target.value); document.getElementById('prAVal').textContent = prState.angleDeg; drawProj(); });
    document.getElementById('prG').addEventListener('input', function (e) { prState.g = Math.max(0.5, Number(e.target.value || 9.81)); drawProj(); });
    document.getElementById('prRecord').addEventListener('click', function () {
      var res = Calc.calculateProjectile(prState);
      Obs.addObservation(exp.id, {
        u: res.u, angleDeg: res.angleDeg, timeOfFlight: res.timeOfFlight, maxHeight: res.maxHeight, range: res.range
      });
      refreshObsAndGraph(exp);
    });
    document.getElementById('prReset').addEventListener('click', function () {
      prState = { u: 20, angleDeg: 45, g: 9.81 };
      document.getElementById('prU').value = 20; document.getElementById('prUVal').textContent = '20';
      document.getElementById('prA').value = 45; document.getElementById('prAVal').textContent = '45';
      document.getElementById('prG').value = 9.81;
      drawProj();
    });
    drawProj();
  }

  // =========================================================================
  // REPORT GENERATOR
  // =========================================================================
  function openExperimentReport(exp) {
    var rows = Obs.getObservations(exp.id);
    var graphCanvas = document.getElementById('expGraphCanvas');
    var imgData = graphCanvas ? graphCanvas.toDataURL('image/png') : '';

    var tableRows = rows.map(function (r) {
      return '<tr>' + exp.columns.map(function (c) {
        return '<td>' + (r[c.key] !== undefined ? r[c.key] : '') + '</td>';
      }).join('') + '</tr>';
    }).join('');

    var win = window.open('', '_blank');
    if (!win) return;
    win.document.write('<!DOCTYPE html><html><head><title>' + exp.title + ' — Lab Report</title>' +
      '<style>body{font-family:system-ui,sans-serif;max-width:850px;margin:2rem auto;padding:0 1rem;color:#0f172a;}' +
      'table{width:100%;border-collapse:collapse;margin:1rem 0;}th,td{border:1px solid #cbd5e1;padding:0.4rem;text-align:left;}' +
      'th{background:#f1f5f9;}@media print{.no-print{display:none;}}</style></head><body>' +
      '<button class="no-print" onclick="window.print()">Print / Save as PDF</button>' +
      '<h1>' + exp.number + ': ' + exp.title + '</h1>' +
      '<p><strong>Objective:</strong> ' + exp.objective + '</p>' +
      '<p><strong>Apparatus:</strong> ' + exp.apparatus.join(', ') + '</p>' +
      '<p><strong>Theory:</strong> ' + exp.theory + '</p>' +
      '<p><strong>Formula:</strong> <code>' + exp.formula + '</code></p>' +
      '<h2>Observations (' + rows.length + ' trials)</h2>' +
      (rows.length ? '<table><thead><tr>' + exp.columns.map(function (c) { return '<th>' + c.label + '</th>'; }).join('') + '</tr></thead><tbody>' + tableRows + '</tbody></table>' : '<p>No observations recorded.</p>') +
      (imgData ? '<h2>Generated Graph</h2><img src="' + imgData + '" style="max-width:100%;border:1px solid #cbd5e1;"/>' : '') +
      '<h2>Conclusion</h2><p>' + exp.conclusion + '</p>' +
      '</body></html>');
    win.document.close();
  }

  // =========================================================================
  // 2. VIRTUAL INSTRUMENTS WORKBENCH
  // =========================================================================
  function renderInstrumentsView() {
    appRoot.innerHTML = '' +
      '<div class="two-col">' +
      '  <div class="card">' +
      '    <h3>Meter Scale</h3>' +
      '    <div id="instMeterSvg"></div>' +
      '    <div class="controls-grid">' +
      '      <div class="control-group"><label>Start (cm)</label><input type="range" id="msStart" min="0" max="90" value="10"/></div>' +
      '      <div class="control-group"><label>End (cm)</label><input type="range" id="msEnd" min="5" max="100" value="45"/></div>' +
      '      <div class="control-group"><label>Unit</label><select id="msUnit"><option value="cm">cm</option><option value="mm">mm</option><option value="m">m</option></select></div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="card">' +
      '    <h3>Optical Instruments Ray Diagram</h3>' +
      '    <div id="instOptSvg"></div>' +
      '    <div class="controls-grid">' +
      '      <div class="control-group"><label>Instrument</label><select id="optType">' +
      '        <option value="convex-lens">Convex Lens</option>' +
      '        <option value="concave-lens">Concave Lens</option>' +
      '        <option value="plane-mirror">Plane Mirror</option>' +
      '        <option value="concave-mirror">Concave Mirror</option>' +
      '        <option value="convex-mirror">Convex Mirror</option>' +
      '      </select></div>' +
      '      <div class="control-group"><label>Object Distance u (cm): <span id="optUVal">30</span></label><input type="range" id="optU" min="5" max="70" value="30"/></div>' +
      '      <div class="control-group"><label>Focal Length f (cm): <span id="optFVal">15</span></label><input type="range" id="optF" min="5" max="35" value="15"/></div>' +
      '    </div>' +
      '    <div id="optReadout" class="readout-grid"></div>' +
      '  </div>' +
      '</div>';

    var updateMS = function () {
      Inst.renderMeterScaleSVG(document.getElementById('instMeterSvg'), {
        startCm: document.getElementById('msStart').value,
        endCm: document.getElementById('msEnd').value,
        unit: document.getElementById('msUnit').value
      });
    };
    ['msStart', 'msEnd', 'msUnit'].forEach(function (id) {
      document.getElementById(id).addEventListener('input', updateMS);
    });
    updateMS();

    var updateOpt = function () {
      var u = Number(document.getElementById('optU').value);
      var f = Number(document.getElementById('optF').value);
      document.getElementById('optUVal').textContent = u;
      document.getElementById('optFVal').textContent = f;
      var info = Inst.renderOpticalInstrumentSVG(document.getElementById('instOptSvg'), {
        type: document.getElementById('optType').value,
        objectDistance: u,
        focalLength: f
      });
      document.getElementById('optReadout').innerHTML = '' +
        '<div class="readout-tile"><div class="label">Image Distance v</div><div class="value">' + (Number.isFinite(info.v) ? info.v + ' cm' : '∞') + '</div></div>' +
        '<div class="readout-tile"><div class="label">Magnification</div><div class="value">' + (Number.isFinite(info.magnification) ? info.magnification + '×' : '∞') + '</div></div>' +
        '<div class="readout-tile"><div class="label">Nature</div><div class="value" style="font-size:0.9rem;">' + info.nature + '</div></div>';
    };
    ['optType', 'optU', 'optF'].forEach(function (id) {
      document.getElementById(id).addEventListener('input', updateOpt);
    });
    updateOpt();
  }

  // =========================================================================
  // 3. DEDICATED LASER PHYSICS LAB
  // =========================================================================
  function renderLaserView() {
    var state = { mode: 'refraction', laserOn: true, incidentAngleDeg: 30, medium1: 'air', medium2: 'crownGlass' };
    var mediaOpts = Object.keys(Physics.OPTICAL_MEDIA).map(function (k) {
      return '<option value="' + k + '">' + Physics.OPTICAL_MEDIA[k].name + ' (n=' + Physics.OPTICAL_MEDIA[k].n + ')</option>';
    }).join('');

    appRoot.innerHTML = '' +
      '<div class="card">' +
      '  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">' +
      '    <h2>Laser Physics Laboratory</h2>' +
      '    <button type="button" class="btn btn-primary" id="lzPower">Laser: ON</button>' +
      '  </div>' +
      '  <div id="lzSvg" style="margin-top:0.75rem;"></div>' +
      '  <div class="controls-grid">' +
      '    <div class="control-group"><label>Simulator Mode</label><select id="lzMode">' +
      '      <option value="reflection">Reflection Simulator</option>' +
      '      <option value="refraction" selected>Refraction &amp; TIR Simulator</option>' +
      '      <option value="prism">Prism Dispersion (Cauchy)</option>' +
      '    </select></div>' +
      '    <div class="control-group"><label>Incident Angle (°): <span id="lzAngVal">30</span></label><input type="range" id="lzAng" min="0" max="85" value="30"/></div>' +
      '    <div class="control-group"><label>Medium 1</label><select id="lzM1">' + mediaOpts + '</select></div>' +
      '    <div class="control-group"><label>Medium 2 / Prism</label><select id="lzM2">' + mediaOpts + '</select></div>' +
      '  </div>' +
      '  <div id="lzPanel" class="readout-grid"></div>' +
      '  <p id="lzExplain" style="font-weight:600;color:#1e3a8a;"></p>' +
      '  <div style="display:flex;gap:0.5rem;">' +
      '    <button type="button" class="btn btn-success" id="lzRecord">Record Observation</button>' +
      '    <button type="button" class="btn btn-danger" id="lzClear">Clear Observations</button>' +
      '    <button type="button" class="btn" id="lzReset">Reset</button>' +
      '  </div>' +
      '</div>' +
      '<div class="card"><h3>Laser Observation Table</h3><div id="lzObsTable" class="table-scroll"></div></div>';

    document.getElementById('lzM1').value = 'air';
    document.getElementById('lzM2').value = 'crownGlass';
    var lastOut = null;

    var renderLZTable = function () {
      var rows = Obs.getObservations('laser-lab');
      var el = document.getElementById('lzObsTable');
      if (!rows.length) { el.innerHTML = '<p style="color:#64748b;">No laser observations recorded yet.</p>'; return; }
      el.innerHTML = '<table class="obs-table"><thead><tr><th>Mode</th><th>n₁</th><th>n₂</th><th>θ₁ (°)</th><th>θᵣ (°)</th><th>θ₂ (°)</th><th>TIR</th></tr></thead><tbody>' +
        rows.map(function (r) {
          return '<tr><td>' + r.mode + '</td><td>' + r.n1 + '</td><td>' + r.n2 + '</td><td>' + r.incidentAngle + '</td><td>' + (r.reflectedAngle ?? '—') + '</td><td>' + (r.refractedAngle ?? '—') + '</td><td>' + (r.isTIR ? 'Yes' : 'No') + '</td></tr>';
        }).join('') + '</tbody></table>';
    };

    var updateLZ = function () {
      document.getElementById('lzAngVal').textContent = state.incidentAngleDeg;
      lastOut = Laser.renderLaserLabSVG(document.getElementById('lzSvg'), state);
      document.getElementById('lzPanel').innerHTML = '' +
        '<div class="readout-tile"><div class="label">Mode</div><div class="value">' + lastOut.mode + '</div></div>' +
        '<div class="readout-tile"><div class="label">Incident θ₁</div><div class="value">' + lastOut.incidentAngle + '°</div></div>' +
        '<div class="readout-tile"><div class="label">Reflected θᵣ</div><div class="value">' + (lastOut.reflectedAngle !== null ? lastOut.reflectedAngle + '°' : '—') + '</div></div>' +
        '<div class="readout-tile"><div class="label">Refracted θ₂</div><div class="value">' + (lastOut.isTIR ? 'TIR' : (lastOut.refractedAngle !== null ? lastOut.refractedAngle + '°' : '—')) + '</div></div>' +
        '<div class="readout-tile"><div class="label">Critical Angle θc</div><div class="value">' + (lastOut.criticalAngle !== null ? lastOut.criticalAngle + '°' : 'N/A') + '</div></div>';
      document.getElementById('lzExplain').textContent = lastOut.explanation;
    };

    document.getElementById('lzPower').addEventListener('click', function (e) {
      state.laserOn = !state.laserOn;
      e.target.textContent = 'Laser: ' + (state.laserOn ? 'ON' : 'OFF');
      updateLZ();
    });
    document.getElementById('lzMode').addEventListener('change', function (e) { state.mode = e.target.value; updateLZ(); });
    document.getElementById('lzAng').addEventListener('input', function (e) { state.incidentAngleDeg = Number(e.target.value); updateLZ(); });
    document.getElementById('lzM1').addEventListener('change', function (e) { state.medium1 = e.target.value; updateLZ(); });
    document.getElementById('lzM2').addEventListener('change', function (e) { state.medium2 = e.target.value; updateLZ(); });
    document.getElementById('lzRecord').addEventListener('click', function () {
      Obs.addObservation('laser-lab', lastOut);
      renderLZTable();
    });
    document.getElementById('lzClear').addEventListener('click', function () {
      Obs.clearObservations('laser-lab');
      renderLZTable();
    });
    document.getElementById('lzReset').addEventListener('click', function () {
      state = { mode: 'refraction', laserOn: true, incidentAngleDeg: 30, medium1: 'air', medium2: 'crownGlass' };
      document.getElementById('lzMode').value = 'refraction';
      document.getElementById('lzAng').value = 30;
      document.getElementById('lzM1').value = 'air';
      document.getElementById('lzM2').value = 'crownGlass';
      document.getElementById('lzPower').textContent = 'Laser: ON';
      updateLZ();
    });

    updateLZ();
    renderLZTable();
  }

  // =========================================================================
  // 4. PHYSICS PLAYGROUND (Wave Motion + Quick Sandboxes)
  // =========================================================================
  function renderPlaygroundView() {
    var wState = { frequency: 2.0, wavelength: 4.0, amplitude: 30 };
    appRoot.innerHTML = '' +
      '<div class="card">' +
      '  <h2>Physics Playground — Wave Motion Simulator</h2>' +
      '  <canvas id="waveCanvas" width="760" height="240" class="sim-canvas"></canvas>' +
      '  <div class="controls-grid">' +
      '    <div class="control-group"><label>Frequency f (Hz): <span id="wfVal">2.0</span></label><input type="range" id="wf" min="0.5" max="6" step="0.5" value="2.0"/></div>' +
      '    <div class="control-group"><label>Wavelength λ (m): <span id="wlVal">4.0</span></label><input type="range" id="wl" min="1" max="10" step="0.5" value="4.0"/></div>' +
      '    <div class="control-group"><label>Amplitude A (px): <span id="waVal">30</span></label><input type="range" id="wa" min="5" max="70" step="5" value="30"/></div>' +
      '  </div>' +
      '  <div id="waveReadout" class="readout-grid"></div>' +
      '</div>';

    var updateWaveUI = function () {
      document.getElementById('wfVal').textContent = wState.frequency;
      document.getElementById('wlVal').textContent = wState.wavelength;
      document.getElementById('waVal').textContent = wState.amplitude;
      var res = Calc.calculateWave(wState);
      document.getElementById('waveReadout').innerHTML = '' +
        '<div class="readout-tile"><div class="label">Wave Velocity (v = fλ)</div><div class="value">' + res.velocity + ' m/s</div></div>' +
        '<div class="readout-tile"><div class="label">Period (T = 1/f)</div><div class="value">' + res.period + ' s</div></div>' +
        '<div class="readout-tile"><div class="label">Angular Freq ω</div><div class="value">' + res.angularFrequency + ' rad/s</div></div>' +
        '<div class="readout-tile"><div class="label">Wave Number k</div><div class="value">' + res.waveNumber + ' rad/m</div></div>';
    };

    document.getElementById('wf').addEventListener('input', function (e) { wState.frequency = Number(e.target.value); updateWaveUI(); });
    document.getElementById('wl').addEventListener('input', function (e) { wState.wavelength = Number(e.target.value); updateWaveUI(); });
    document.getElementById('wa').addEventListener('input', function (e) { wState.amplitude = Number(e.target.value); updateWaveUI(); });
    updateWaveUI();

    var canvas = document.getElementById('waveCanvas');
    var ctx = canvas.getContext('2d');
    var start = performance.now();

    function drawWave(now) {
      var t = (now - start) / 1000;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      var midY = canvas.height / 2;
      ctx.strokeStyle = '#334155';
      ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(canvas.width, midY); ctx.stroke();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      var k = (2 * Math.PI) / (wState.wavelength * 40);
      var omega = 2 * Math.PI * wState.frequency;
      for (var x = 0; x <= canvas.width; x += 3) {
        var y = midY - wState.amplitude * Math.sin(k * x - omega * t);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      animFrameIds.push(requestAnimationFrame(drawWave));
    }
    animFrameIds.push(requestAnimationFrame(drawWave));
  }

  // =========================================================================
  // 5. LAB PROGRESS & STORAGE
  // =========================================================================
  function renderProgressView() {
    var exps = ExpMgr.getAllExperiments();
    var completed = Obs.getCompletedMap();
    var scores = Obs.getQuizScores();

    var rows = exps.map(function (e) {
      var obsCount = Obs.getObservations(e.id).length;
      var q = scores[e.id];
      return '<tr>' +
        '<td>' + e.number + '</td>' +
        '<td>' + e.title + '</td>' +
        '<td>' + (completed[e.id] ? '<span class="badge badge-success">Completed</span>' : '<span class="badge badge-warn">In Progress</span>') + '</td>' +
        '<td>' + obsCount + '</td>' +
        '<td>' + (q ? (q.score + ' / ' + q.total) : 'Not taken') + '</td>' +
        '</tr>';
    }).join('');

    appRoot.innerHTML = '' +
      '<div class="card">' +
      '  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.5rem;">' +
      '    <h2>Student Laboratory Progress &amp; Saved Data</h2>' +
      '    <button type="button" class="btn btn-danger" id="btnResetAll">Reset All Stored Lab Data</button>' +
      '  </div>' +
      '  <p>All observations, completion statuses, and quiz scores are persisted locally in <code>localStorage</code> across browser refreshes.</p>' +
      '  <div class="table-scroll"><table class="obs-table"><thead><tr><th>ID</th><th>Experiment</th><th>Status</th><th>Observations</th><th>Quiz Score</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '</div>';

    document.getElementById('btnResetAll').addEventListener('click', function () {
      Obs.resetAllStorage();
      renderProgressView();
    });
  }

  // Initial render
  renderCurrentView();
}());
