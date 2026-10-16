import React, { useState } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Award, HelpCircle } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'How many revolutions of the crankshaft are required to complete one full four-stroke cycle across each cylinder?',
    options: ['1 revolution (360°)', '2 revolutions (720°)', '4 revolutions (1440°)', 'Half a revolution (180°)'],
    correctIndex: 1,
    explanation: 'A four-stroke engine requires 720° of crankshaft rotation (2 complete turns). Each of the 4 strokes (Intake, Compression, Power, Exhaust) takes exactly 180° (half a turn).',
  },
  {
    id: 2,
    question: 'In a standard automotive inline-4 engine with firing order 1-3-4-2, which cylinder fires immediately after Cylinder 3?',
    options: ['Cylinder 1', 'Cylinder 2', 'Cylinder 4', 'Cylinder 3 fires twice'],
    correctIndex: 2,
    explanation: 'Following the 1-3-4-2 sequence, after Cylinder 3 fires at 180°, Cylinder 4 fires at 360°, followed by Cylinder 2 at 540°, returning to Cylinder 1 at 720°/0°.',
  },
  {
    id: 3,
    question: 'Why do Cylinders 1 and 4 move together to Top Dead Center (TDC) at the same time in a flat-plane crankshaft?',
    options: [
      'They fire their spark plugs at the exact same millisecond.',
      'Their crank throws share the same 0° angle to provide primary mechanical mass balance against Cylinders 2 & 3.',
      'They share the same exhaust manifold pipe.',
      'To halve fuel consumption during highway cruising.',
    ],
    correctIndex: 1,
    explanation: 'Cylinders 1 & 4 share outer crank throws at 0°, while Cylinders 2 & 3 are 180° opposed. When 1 & 4 are at TDC, 2 & 3 are at BDC, canceling out primary reciprocating inertia forces.',
  },
  {
    id: 4,
    question: 'During which stroke(s) are BOTH the intake and exhaust valves tightly sealed closed?',
    options: [
      'Only during the Intake Stroke',
      'Both the Compression Stroke and the Power Stroke',
      'Only during the Exhaust Stroke',
      'During all four strokes',
    ],
    correctIndex: 1,
    explanation: 'Both valves must be hermetically seated during Compression (to compress the trapped fuel charge) and Power (to contain the 60+ bar explosion and drive the piston downward).',
  },
  {
    id: 5,
    question: 'Even though Cylinders 1 and 4 move mechanically in unison, what distinguishes them thermodynamically?',
    options: [
      'Cylinder 1 runs hotter than Cylinder 4.',
      'They are separated by 360° in the 4-stroke cycle: when Cylinder 1 is on Power, Cylinder 4 is on Intake.',
      'Cylinder 4 has a shorter stroke than Cylinder 1.',
      'Cylinder 4 does not use a spark plug.',
    ],
    correctIndex: 1,
    explanation: 'While both reach TDC simultaneously, they are separated by 1 full revolution (360°). When Cylinder 1 ignites into the Power stroke, Cylinder 4 is opening its intake valve to draw in fresh charge.',
  },
];

export const EngineQuiz: React.FC = () => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSelect = (questionId: number, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
  };

  const score = QUIZ_QUESTIONS.reduce((acc, q) => {
    return selectedAnswers[q.id] === q.correctIndex ? acc + 1 : acc;
  }, 0);

  const allAnswered = QUIZ_QUESTIONS.every((q) => selectedAnswers[q.id] !== undefined);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 lg:p-6 shadow-xl backdrop-blur-sm max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-wide">
              Engineering Knowledge Check
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              Test your mastery of 4-stroke mechanics, firing sequence, and crankshaft balance.
            </p>
          </div>
        </div>

        {isSubmitted && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-400 font-mono">Score:</span>{' '}
              <span className="font-mono text-sm font-bold text-amber-400">
                {score} / {QUIZ_QUESTIONS.length} ({Math.round((score / QUIZ_QUESTIONS.length) * 100)}%)
              </span>
            </div>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {QUIZ_QUESTIONS.map((q, idx) => {
          const userAnswer = selectedAnswers[q.id];
          const hasAnswered = userAnswer !== undefined;
          const isCorrect = userAnswer === q.correctIndex;

          return (
            <div
              key={q.id}
              className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 font-mono text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                  {idx + 1}
                </span>
                <h4 className="text-sm font-semibold text-slate-100 leading-snug">
                  {q.question}
                </h4>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {q.options.map((opt, optIdx) => {
                  const isOptionSelected = userAnswer === optIdx;
                  let btnStyle = 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700';

                  if (isSubmitted) {
                    if (optIdx === q.correctIndex) {
                      btnStyle = 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300 font-semibold';
                    } else if (isOptionSelected && !isCorrect) {
                      btnStyle = 'border-red-500/60 bg-red-500/15 text-red-300';
                    } else {
                      btnStyle = 'border-slate-800/40 opacity-40 text-slate-500';
                    }
                  } else if (isOptionSelected) {
                    btnStyle = 'border-amber-500 bg-amber-500/15 text-amber-300 font-semibold shadow-sm';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(q.id, optIdx)}
                      disabled={isSubmitted}
                      className={`p-3 rounded-lg border text-left text-xs transition-all flex items-start gap-2.5 ${btnStyle}`}
                    >
                      <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span className="leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation upon submission */}
              {isSubmitted && (
                <div
                  className={`mt-3 p-3 rounded-lg border text-xs flex items-start gap-2 ${
                    isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block mb-0.5">
                      {isCorrect ? 'Correct!' : 'Incorrect'}
                    </span>
                    <p className="text-slate-300 leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit Button */}
      {!isSubmitted && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setIsSubmitted(true)}
            disabled={!allAnswered}
            className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
          >
            {allAnswered ? 'Submit & Grade Quiz' : `Answer all questions (${Object.keys(selectedAnswers).length}/${QUIZ_QUESTIONS.length})`}
          </button>
        </div>
      )}
    </div>
  );
};
