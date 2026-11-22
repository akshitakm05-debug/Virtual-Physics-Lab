/**
 * Virtual Physics Laboratory — Automatic Graph Generation System
 * Pure Canvas 2D scientific plotter supporting scatter, linear, curve,
 * comparison overlays, line of best fit, and PNG export.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory(require('./calculation-engine.js'));
  } else {
    root.VPL = root.VPL || {};
    root.VPL.GraphEngine = factory(root.VPL.CalculationEngine);
  }
}(typeof self !== 'undefined' ? self : this, function (Calc) {
  'use strict';

  function renderGraph(canvas, options) {
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;
    var pad = { top: 36, right: 28, bottom: 52, left: 64 };

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    var points = (options.points || []).filter(function (p) {
      return Number.isFinite(Number(p.x)) && Number.isFinite(Number(p.y));
    }).map(function (p) {
      return { x: Number(p.x), y: Number(p.y), yTheory: p.yTheory !== undefined ? Number(p.yTheory) : null };
    });

    if (points.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '14px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Record at least 1 observation to generate the graph.', width / 2, height / 2);
      return null;
    }

    var sorted = points.slice().sort(function (a, b) { return a.x - b.x; });
    var xs = sorted.map(function (p) { return p.x; });
    var ys = sorted.map(function (p) { return p.y; });
    if (options.showTheory) {
      sorted.forEach(function (p) { if (Number.isFinite(p.yTheory)) ys.push(p.yTheory); });
    }

    var minX = Math.min.apply(null, xs);
    var maxX = Math.max.apply(null, xs);
    var minY = Math.min.apply(null, ys);
    var maxY = Math.max.apply(null, ys);

    if (minX === maxX) { minX -= 1; maxX += 1; }
    if (minY === maxY) { minY -= 1; maxY += 1; }
    var spanX = maxX - minX;
    var spanY = maxY - minY;
    minX -= spanX * 0.08;
    maxX += spanX * 0.08;
    minY -= spanY * 0.1;
    maxY += spanY * 0.1;

    var plotW = width - pad.left - pad.right;
    var plotH = height - pad.top - pad.bottom;

    function px(x) { return pad.left + ((x - minX) / (maxX - minX)) * plotW; }
    function py(y) { return pad.top + plotH - ((y - minY) / (maxY - minY)) * plotH; }

    // Gridlines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#475569';
    for (var i = 0; i <= 5; i++) {
      var gx = pad.left + (plotW * i) / 5;
      var gy = pad.top + (plotH * i) / 5;
      ctx.beginPath(); ctx.moveTo(gx, pad.top); ctx.lineTo(gx, pad.top + plotH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad.left, gy); ctx.lineTo(pad.left + plotW, gy); ctx.stroke();

      var xVal = minX + ((maxX - minX) * i) / 5;
      var yVal = maxY - ((maxY - minY) * i) / 5;
      ctx.textAlign = 'center';
      ctx.fillText(Calc.roundTo(xVal, 2), gx, pad.top + plotH + 18);
      ctx.textAlign = 'right';
      ctx.fillText(Calc.roundTo(yVal, 2), pad.left - 8, gy + 4);
    }

    // Axes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + plotH);
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.stroke();

    // Axis Titles
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(options.xLabel || 'X', pad.left + plotW / 2, height - 10);

    ctx.save();
    ctx.translate(16, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(options.yLabel || 'Y', 0, 0);
    ctx.restore();

    // Chart Title
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillText(options.title || 'Experiment Graph', pad.left + plotW / 2, 20);

    // Theoretical curve if present
    if (options.showTheory) {
      var theoryPts = sorted.filter(function (p) { return Number.isFinite(p.yTheory); });
      if (theoryPts.length >= 2) {
        ctx.save();
        ctx.strokeStyle = '#0ea5e9';
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        theoryPts.forEach(function (p, idx) {
          if (idx === 0) ctx.moveTo(px(p.x), py(p.yTheory));
          else ctx.lineTo(px(p.x), py(p.yTheory));
        });
        ctx.stroke();
        ctx.restore();
      }
    }

    // Connected line / curve
    if (options.chartType === 'line' || options.chartType === 'curve') {
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      sorted.forEach(function (p, idx) {
        if (idx === 0) ctx.moveTo(px(p.x), py(p.y));
        else ctx.lineTo(px(p.x), py(p.y));
      });
      ctx.stroke();
    }

    // Line of best fit
    var reg = null;
    if (options.showBestFit && sorted.length >= 2) {
      reg = Calc.linearRegression(sorted);
      if (reg) {
        ctx.save();
        ctx.strokeStyle = '#dc2626';
        ctx.setLineDash([5, 3]);
        ctx.lineWidth = 1.75;
        ctx.beginPath();
        ctx.moveTo(px(minX), py(reg.slope * minX + reg.intercept));
        ctx.lineTo(px(maxX), py(reg.slope * maxX + reg.intercept));
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#dc2626';
        ctx.font = '11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Best Fit: y = ' + reg.slope + 'x + ' + reg.intercept + ' (R² = ' + reg.rSquared + ')', pad.left + 10, pad.top + 16);
      }
    }

    // Data point markers
    sorted.forEach(function (p) {
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.arc(px(p.x), py(p.y), 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    return { regression: reg, count: sorted.length };
  }

  function downloadPNG(canvas, filename) {
    if (!canvas) return;
    var link = document.createElement('a');
    link.download = filename || 'physics-graph.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return {
    renderGraph: renderGraph,
    downloadPNG: downloadPNG
  };
}));
