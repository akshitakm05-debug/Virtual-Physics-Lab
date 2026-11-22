/**
 * Virtual Physics Laboratory — Learning & Assessment System (Quiz Engine)
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.VPL = root.VPL || {};
    root.VPL.QuizEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function renderQuiz(container, expId, questions, onComplete) {
    if (!container || !questions || questions.length === 0) return;

    var html = '<div class="quiz-wrapper">';
    questions.forEach(function (q, idx) {
      html += '<div class="quiz-question" data-q="' + idx + '">' +
        '<p class="quiz-q-title"><strong>Q' + (idx + 1) + '.</strong> ' + q.question + '</p>' +
        '<div class="quiz-options">';
      q.options.forEach(function (opt, oIdx) {
        html += '<label class="quiz-option">' +
          '<input type="radio" name="quiz_' + expId + '_' + idx + '" value="' + oIdx + '"/> ' +
          '<span>' + opt + '</span>' +
          '</label>';
      });
      html += '</div><div class="quiz-feedback" id="qfb_' + expId + '_' + idx + '"></div></div>';
    });
    html += '<div class="quiz-actions">' +
      '<button type="button" class="btn btn-primary" id="quizSubmit_' + expId + '">Submit Quiz</button>' +
      '<span class="quiz-score-badge" id="quizScore_' + expId + '"></span>' +
      '</div></div>';

    container.innerHTML = html;

    var submitBtn = document.getElementById('quizSubmit_' + expId);
    submitBtn.addEventListener('click', function () {
      var score = 0;
      questions.forEach(function (q, idx) {
        var selected = container.querySelector('input[name="quiz_' + expId + '_' + idx + '"]:checked');
        var fb = document.getElementById('qfb_' + expId + '_' + idx);
        if (!selected) {
          fb.className = 'quiz-feedback incorrect';
          fb.textContent = 'Not answered. Correct answer: ' + q.options[q.answer] + ' — ' + q.explanation;
          return;
        }
        var chosen = Number(selected.value);
        if (chosen === q.answer) {
          score++;
          fb.className = 'quiz-feedback correct';
          fb.textContent = 'Correct! ' + q.explanation;
        } else {
          fb.className = 'quiz-feedback incorrect';
          fb.textContent = 'Incorrect. Correct: ' + q.options[q.answer] + '. ' + q.explanation;
        }
      });
      var scoreEl = document.getElementById('quizScore_' + expId);
      scoreEl.textContent = 'Score: ' + score + ' / ' + questions.length;
      if (typeof onComplete === 'function') onComplete(score, questions.length);
    });
  }

  return {
    renderQuiz: renderQuiz
  };
}));
