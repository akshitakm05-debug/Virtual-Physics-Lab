/**
 * Virtual Physics Laboratory — Observation & Data Recording System
 * Persists observations, progress, and quiz scores in localStorage.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.VPL = root.VPL || {};
    root.VPL.ObservationManager = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var STORAGE_KEY = 'vpl_lab_state_v1';
  var memoryFallback = { observations: {}, quizScores: {}, completed: {} };

  function loadState() {
    try {
      if (typeof localStorage !== 'undefined') {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch (e) { /* ignore storage errors */ }
    return JSON.parse(JSON.stringify(memoryFallback));
  }

  function saveState(state) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch (e) { /* ignore storage errors */ }
    memoryFallback = state;
  }

  function getObservations(expId) {
    var state = loadState();
    return state.observations[expId] || [];
  }

  function addObservation(expId, row) {
    var state = loadState();
    if (!state.observations[expId]) state.observations[expId] = [];
    var entry = Object.assign({}, row, {
      _id: 'obs_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      _timestamp: new Date().toISOString()
    });
    state.observations[expId].push(entry);
    saveState(state);
    return state.observations[expId];
  }

  function updateObservation(expId, obsId, patch) {
    var state = loadState();
    var list = state.observations[expId] || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i]._id === obsId) {
        list[i] = Object.assign({}, list[i], patch);
        break;
      }
    }
    state.observations[expId] = list;
    saveState(state);
    return list;
  }

  function deleteObservation(expId, obsId) {
    var state = loadState();
    var list = state.observations[expId] || [];
    state.observations[expId] = list.filter(function (r) { return r._id !== obsId; });
    saveState(state);
    return state.observations[expId];
  }

  function clearObservations(expId) {
    var state = loadState();
    state.observations[expId] = [];
    saveState(state);
    return [];
  }

  function markCompleted(expId, isDone) {
    var state = loadState();
    state.completed[expId] = !!isDone;
    saveState(state);
  }

  function getCompletedMap() {
    return loadState().completed || {};
  }

  function saveQuizScore(expId, score, total) {
    var state = loadState();
    state.quizScores[expId] = { score: score, total: total, date: new Date().toISOString() };
    saveState(state);
  }

  function getQuizScores() {
    return loadState().quizScores || {};
  }

  function resetAllStorage() {
    var empty = { observations: {}, quizScores: {}, completed: {} };
    saveState(empty);
    return empty;
  }

  function toCSV(columns, rows) {
    var headers = columns.map(function (c) {
      return '"' + String(c.label + (c.unit ? ' (' + c.unit + ')' : '')).replace(/"/g, '""') + '"';
    }).join(',');
    var lines = rows.map(function (row) {
      return columns.map(function (c) {
        var val = row[c.key] !== undefined && row[c.key] !== null ? row[c.key] : '';
        return '"' + String(val).replace(/"/g, '""') + '"';
      }).join(',');
    });
    return [headers].concat(lines).join('\n');
  }

  function downloadCSV(filename, columns, rows) {
    var csv = toCSV(columns, rows);
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return {
    getObservations: getObservations,
    addObservation: addObservation,
    updateObservation: updateObservation,
    deleteObservation: deleteObservation,
    clearObservations: clearObservations,
    markCompleted: markCompleted,
    getCompletedMap: getCompletedMap,
    saveQuizScore: saveQuizScore,
    getQuizScores: getQuizScores,
    resetAllStorage: resetAllStorage,
    toCSV: toCSV,
    downloadCSV: downloadCSV
  };
}));
