import React, { useState } from 'react';
import { LessonContent, ExerciseItem, TestQuestion } from './types.ts';
import { BilingualText } from './BilingualText.tsx';
import { Volume2, CheckCircle2, XCircle, Award, BookOpen, HelpCircle, CheckSquare, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { speakSpanish } from './speech.ts';
import { addPoints, markLessonCompleted, recordMistake } from './storage.ts';
import confetti from 'canvas-confetti';

interface LessonViewerProps {
  lesson: LessonContent;
  onBackToModules: () => void;
  onNavigateSubtopic?: (subtopicId: string) => void;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  onBackToModules,
  onNavigateSubtopic
}) => {
  const [activeTab, setActiveTab] = useState<'teoria' | 'ejercicios' | 'test' | 'miniexamen'>('teoria');

  // Exercise answers state: key is exercise id -> selected answer
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, string>>({});
  const [exerciseChecked, setExerciseChecked] = useState<Record<string, boolean>>({});

  // Test answers state: key is question id -> selected option index
  const [testAnswers, setTestAnswers] = useState<Record<string, number>>({});
  const [testChecked, setTestChecked] = useState<Record<string, boolean>>({});

  // Mini-exam state
  const [miniExamAnswers, setMiniExamAnswers] = useState<Record<string, number>>({});
  const [miniExamFinished, setMiniExamFinished] = useState(false);
  const [miniExamScore, setMiniExamScore] = useState<number | null>(null);

  // Exercise handling
  const handleSelectExerciseOption = (exId: string, answer: string) => {
    setExerciseAnswers(prev => ({ ...prev, [exId]: answer }));
    setExerciseChecked(prev => ({ ...prev, [exId]: true }));

    const ex = lesson.exercises.find(e => e.id === exId);
    if (ex) {
      if (answer === ex.correctAnswer) {
        addPoints(5);
      } else {
        recordMistake({
          questionEs: ex.sentenceEs,
          questionHy: ex.sentenceHy,
          userAnswer: answer,
          correctAnswer: ex.correctAnswer,
          explanationEs: ex.explanationEs,
          explanationHy: ex.explanationHy,
          topicTitleEs: lesson.titleEs
        });
      }
    }
  };

  // Test Question handling
  const handleSelectTestOption = (qId: string, optIndex: number) => {
    setTestAnswers(prev => ({ ...prev, [qId]: optIndex }));
    setTestChecked(prev => ({ ...prev, [qId]: true }));

    const q = lesson.testQuestions.find(item => item.id === qId);
    if (q) {
      if (optIndex === q.correctIndex) {
        addPoints(10);
      } else {
        recordMistake({
          questionEs: q.questionEs,
          questionHy: q.questionHy,
          userAnswer: q.optionsEs[optIndex],
          correctAnswer: q.optionsEs[q.correctIndex],
          explanationEs: q.explanationEs,
          explanationHy: q.explanationHy,
          topicTitleEs: lesson.titleEs
        });
      }
    }
  };

  // Mini-exam submit
  const handleSubmitMiniExam = () => {
    let correctCount = 0;
    lesson.miniExam.questions.forEach(q => {
      if (miniExamAnswers[q.id] === q.correctIndex) {
        correctCount++;
      }
    });

    const scoreOutOf10 = (correctCount / lesson.miniExam.questions.length) * 10;
    setMiniExamScore(scoreOutOf10);
    setMiniExamFinished(true);

    if (scoreOutOf10 >= 5) {
      markLessonCompleted(lesson.subtopicId);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
  };

  const completedExercisesCount = Object.keys(exerciseChecked).length;
  const completedTestCount = Object.keys(testChecked).length;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-3.5 rounded-2xl border border-stone-200 shadow-xs">
        <button
          type="button"
          onClick={onBackToModules}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-amber-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al temario / Վերադառնալ ծրագրին</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
            {lesson.moduleTitleEs}
          </span>
        </div>
      </div>

      {/* Lesson Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-800 via-rose-800 to-amber-700 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-md">
            <span>Tema escolar de 1.º de ESO</span>
            <span>•</span>
            <span className="armenian-font">Դպրոցական դաս</span>
          </div>

          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {lesson.titleEs}
              </h1>
              <p className="mt-1.5 text-lg font-medium text-amber-150 armenian-font">
                {lesson.titleHy}
              </p>
            </div>
            <button
              type="button"
              onClick={() => speakSpanish(lesson.titleEs)}
              className="rounded-2xl bg-white/20 p-3 hover:bg-white/30 transition-all text-white shrink-0"
              title="Escuchar título en español"
              aria-label="Escuchar título"
            >
              <Volume2 className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('teoria')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'teoria'
              ? 'bg-red-800 text-white shadow-sm'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>1. Explicación y Ejemplos (Տեսություն)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ejercicios')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'ejercicios'
              ? 'bg-red-800 text-white shadow-sm'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <CheckSquare className="h-4 w-4" />
          <span>2. 10 Ejercicios ({completedExercisesCount}/10)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('test')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'test'
              ? 'bg-red-800 text-white shadow-sm'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>3. 10 Preguntas Test ({completedTestCount}/10)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('miniexamen')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'miniexamen'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>4. Mini Examen Final (Քննություն)</span>
        </button>
      </div>

      {/* TAB 1: TEORÍA Y EJEMPLOS */}
      {activeTab === 'teoria' && (
        <div className="space-y-6">
          {/* Dual Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Spanish side */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 text-red-800 font-bold text-sm uppercase tracking-wide border-b border-stone-100 pb-3">
                <span className="h-2 w-2 rounded-full bg-red-700" />
                <span>Explicación en español (1.º ESO)</span>
              </div>
              <div className="mt-4 space-y-3 text-stone-800 text-sm leading-relaxed font-sans">
                {lesson.explanationEs.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Armenian side */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm uppercase tracking-wide border-b border-amber-200/60 pb-3">
                <span className="h-2 w-2 rounded-full bg-amber-600" />
                <span className="armenian-font">Բացատրություն հայերեն</span>
              </div>
              <div className="mt-4 space-y-3 text-stone-800 text-sm leading-relaxed armenian-font">
                {lesson.explanationHy.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Key Rules */}
          <div className="rounded-2xl border border-amber-300 bg-amber-100/40 p-5">
            <h3 className="font-bold text-base text-amber-950 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <span>Reglas clave para el examen escolar • Հիմնական կանոններ</span>
            </h3>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm text-stone-800">
              <ul className="space-y-2 list-disc list-inside bg-white/70 p-3.5 rounded-xl border border-amber-200/70">
                {lesson.keyRulesEs.map((r, i) => (
                  <li key={i} className="font-medium text-stone-900">{r}</li>
                ))}
              </ul>
              <ul className="space-y-2 list-disc list-inside bg-white/70 p-3.5 rounded-xl border border-amber-200/70 armenian-font">
                {lesson.keyRulesHy.map((r, i) => (
                  <li key={i} className="text-stone-800">{r}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bilingual Examples with Tap-To-Reveal */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-stone-900">
                Ejemplos bilingües interactivos
              </h3>
              <span className="text-xs text-stone-500 font-sans">
                Pulsa en cada frase para ver su traducción al armenio
              </span>
            </div>
            <div className="space-y-3">
              {lesson.bilingualExamples.map((ex, i) => (
                <BilingualText
                  key={i}
                  es={ex.es}
                  hy={ex.hy}
                  noteEs={ex.noteEs}
                  noteHy={ex.noteHy}
                />
              ))}
            </div>
          </div>

          {/* Real Spanish Classroom Situation */}
          {lesson.schoolExamples && lesson.schoolExamples.length > 0 && (
            <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-stone-50 to-amber-50/40 p-5">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <span>🏫 Situación en el instituto (IES en España)</span>
              </h3>
              {lesson.schoolExamples.map((item, idx) => (
                <div key={idx} className="mt-3 space-y-3">
                  <div className="text-xs font-bold uppercase text-amber-800 tracking-wider">
                    {item.situationEs} • <span className="armenian-font font-normal">{item.situationHy}</span>
                  </div>
                  <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-2">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-stone-800 leading-relaxed font-medium">
                      {item.dialogueEs}
                    </pre>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-stone-600 leading-relaxed armenian-font pt-2 border-t border-stone-100">
                      {item.dialogueHy}
                    </pre>
                  </div>
                  <p className="text-xs text-stone-600 italic">
                    {item.explanationEs}
                  </p>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-3">
            <button
              type="button"
              onClick={() => setActiveTab('ejercicios')}
              className="inline-flex items-center gap-2 rounded-xl bg-red-800 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-900 transition-all"
            >
              <span>Pasar a los 10 Ejercicios</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: 10 EJERCICIOS */}
      {activeTab === 'ejercicios' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="text-lg font-bold text-stone-900">
              10 Ejercicios prácticos de la lección
            </h3>
            <p className="text-xs text-stone-500 armenian-font mt-0.5">
              10 գործնական վարժություն. Պատասխանիր ինքնուրույն և անմիջապես ստուգիր արդյունքը։
            </p>
          </div>

          <div className="space-y-5">
            {lesson.exercises.map((ex, index) => {
              const selected = exerciseAnswers[ex.id];
              const isChecked = exerciseChecked[ex.id];
              const isCorrect = selected === ex.correctAnswer;

              return (
                <div
                  key={ex.id}
                  className={`rounded-2xl border p-5 transition-all bg-white ${
                    isChecked
                      ? isCorrect
                        ? 'border-emerald-300 ring-1 ring-emerald-200'
                        : 'border-rose-300 ring-1 ring-rose-200'
                      : 'border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-700">
                      Ejercicio {index + 1} de 10
                    </span>
                    {isChecked && (
                      <span className={`inline-flex items-center gap-1 text-xs font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        <span>{isCorrect ? '¡Correcto! (+5 pts)' : 'Incorrecto'}</span>
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-stone-800">
                    {ex.instructionEs}
                  </p>
                  <p className="text-xs text-stone-500 armenian-font mb-3">
                    {ex.instructionHy}
                  </p>

                  {/* Sentence prompt */}
                  <div className="my-3 rounded-xl bg-stone-50 p-3.5 border border-stone-200/80">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-medium text-stone-900">
                        {ex.sentenceEs}
                      </span>
                      <button
                        type="button"
                        onClick={() => speakSpanish(ex.sentenceEs)}
                        className="p-1 rounded-md text-stone-400 hover:text-amber-800"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="text-xs text-stone-600 armenian-font mt-1">
                      {ex.sentenceHy}
                    </div>
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                    {ex.options?.map((opt, optIdx) => {
                      const isSelected = selected === opt;
                      const optHy = ex.optionsHy?.[optIdx];

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectExerciseOption(ex.id, opt)}
                          className={`rounded-xl border p-3 text-left transition-all ${
                            isSelected
                              ? isChecked
                                ? isCorrect
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold'
                                  : 'bg-rose-50 border-rose-500 text-rose-950 font-semibold'
                                : 'bg-amber-50 border-amber-500 text-amber-950'
                              : isChecked && opt === ex.correctAnswer
                              ? 'bg-emerald-50/50 border-emerald-400 text-emerald-900'
                              : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
                          }`}
                        >
                          <div className="text-sm font-medium">{opt}</div>
                          {optHy && (
                            <div className="text-xs text-stone-500 armenian-font mt-0.5">
                              {optHy}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Explanation */}
                  {isChecked && (
                    <div className={`mt-4 rounded-xl p-3.5 text-xs ${isCorrect ? 'bg-emerald-50/80 text-emerald-950 border border-emerald-200' : 'bg-rose-50/80 text-rose-950 border border-rose-200'}`}>
                      <div className="font-bold mb-1">
                        {isCorrect ? (
                          <span>Por qué es correcto / <span className="armenian-font font-medium">Ինչու է ճիշտ:</span></span>
                        ) : (
                          <span>Explicación del error / <span className="armenian-font font-medium">Սխալի բացատրություն:</span></span>
                        )}
                      </div>
                      <p className="font-sans">{ex.explanationEs}</p>
                      <p className="mt-1 armenian-font opacity-90">{ex.explanationHy}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('teoria')}
              className="rounded-xl border border-stone-200 px-5 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
            >
              → Volver a la explicación
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('test')}
              className="rounded-xl bg-red-800 px-6 py-2.5 text-xs font-bold text-white hover:bg-red-900 shadow-sm"
            >
              Pasar al Test Tipo Examen (10 preguntas) →
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: 10 PREGUNTAS TIPO TEST */}
      {activeTab === 'test' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="text-lg font-bold text-stone-900">
              10 Preguntas Tipo Test (4 opciones por pregunta)
            </h3>
            <p className="text-xs text-stone-500 armenian-font mt-0.5">
              Յուրաքանչյուր հարց ունի 4 տարբերակ։ Ընտրիր պատասխանը, և համակարգը կստուգի անմիջապես։
            </p>
          </div>

          <div className="space-y-5">
            {lesson.testQuestions.map((q, qIndex) => {
              const selectedIdx = testAnswers[q.id];
              const isChecked = testChecked[q.id];
              const isCorrect = selectedIdx === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className={`rounded-2xl border p-5 bg-white transition-all ${
                    isChecked
                      ? isCorrect
                        ? 'border-emerald-300 ring-1 ring-emerald-200'
                        : 'border-rose-300 ring-1 ring-rose-200'
                      : 'border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-700">
                      Pregunta {qIndex + 1} de 10
                    </span>
                    {isChecked && (
                      <span className={`inline-flex items-center gap-1 text-xs font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        <span>{isCorrect ? '¡Correcto! (+10 pts)' : 'Incorrecto'}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h4 className="text-base font-bold text-stone-900">
                        {q.questionEs}
                      </h4>
                      <p className="text-xs text-stone-600 armenian-font mt-1">
                        {q.questionHy}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => speakSpanish(q.questionEs)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-amber-800 shrink-0"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* 4 Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.optionsEs.map((optEs, optIdx) => {
                      const isSelected = selectedIdx === optIdx;
                      const optHy = q.optionsHy[optIdx];

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectTestOption(q.id, optIdx)}
                          className={`rounded-xl border p-3.5 text-left transition-all ${
                            isSelected
                              ? isChecked
                                ? isCorrect
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                                  : 'bg-rose-50 border-rose-500 text-rose-950 font-bold'
                                : 'bg-amber-50 border-amber-500 text-amber-950'
                              : isChecked && optIdx === q.correctIndex
                              ? 'bg-emerald-50/60 border-emerald-400 text-emerald-900 font-semibold'
                              : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-stone-700">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="text-sm font-medium">{optEs}</span>
                          </div>
                          {optHy && (
                            <div className="text-xs text-stone-500 armenian-font mt-1 pl-7">
                              {optHy}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Explanation */}
                  {isChecked && (
                    <div className={`mt-4 rounded-xl p-3.5 text-xs ${isCorrect ? 'bg-emerald-50/80 text-emerald-950 border border-emerald-200' : 'bg-rose-50/80 text-rose-950 border border-rose-200'}`}>
                      <div className="font-bold mb-1">
                        {isCorrect ? (
                          <span>Explicación del acierto / <span className="armenian-font font-medium">Ճիշտ պատասխանի հիմնավորում:</span></span>
                        ) : (
                          <span>Por qué es errónea tu elección / <span className="armenian-font font-medium">Սխալի բացատրություն:</span></span>
                        )}
                      </div>
                      <p className="font-sans">{q.explanationEs}</p>
                      <p className="mt-1 armenian-font opacity-90">{q.explanationHy}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('miniexamen')}
              className="rounded-xl bg-amber-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-amber-700 shadow-sm"
            >
              Hacer Mini Examen Final de la Lección →
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: MINI EXAMEN FINAL */}
      {activeTab === 'miniexamen' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-6">
          <div className="border-b border-stone-100 pb-4">
            <h3 className="text-xl font-bold text-stone-900">
              {lesson.miniExam.titleEs}
            </h3>
            <p className="text-sm text-amber-800 armenian-font mt-1">
              {lesson.miniExam.titleHy}
            </p>
          </div>

          {!miniExamFinished ? (
            <div className="space-y-6">
              {lesson.miniExam.questions.map((q, idx) => {
                const selected = miniExamAnswers[q.id];
                return (
                  <div key={q.id} className="rounded-xl border border-stone-200 p-4">
                    <p className="font-bold text-sm text-stone-900 mb-1">
                      {idx + 1}. {q.questionEs}
                    </p>
                    <p className="text-xs text-stone-600 armenian-font mb-3">
                      {q.questionHy}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.optionsEs.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => setMiniExamAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                          className={`rounded-xl border p-3 text-left text-xs font-medium transition-all ${
                            selected === oIdx
                              ? 'bg-amber-100 border-amber-600 text-amber-950 font-bold'
                              : 'bg-white border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          <div>{opt}</div>
                          <div className="text-[11px] text-stone-500 armenian-font mt-0.5">
                            {q.optionsHy[oIdx]}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={handleSubmitMiniExam}
                className="w-full rounded-xl bg-amber-600 py-3.5 text-sm font-bold text-white hover:bg-amber-700 shadow-md transition-all"
              >
                Entregar Mini Examen y Calificar (Ամփոփել և գնահատել)
              </button>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-900 text-3xl font-black">
                {miniExamScore?.toFixed(1)}/10
              </div>
              <h4 className="text-2xl font-bold text-stone-900">
                {miniExamScore && miniExamScore >= 5 ? '¡Enhorabuena! Lección superada' : 'Necesitas repasar este tema'}
              </h4>
              <p className="text-sm text-stone-600 armenian-font max-w-md mx-auto">
                {miniExamScore && miniExamScore >= 5
                  ? 'Շնորհավորո՛ւմ ենք։ Դասը հաջողությամբ յուրացված է և միավորները ավելացվել են քո պրոֆիլում։'
                  : 'Կրկնիր տեսական նյութը և փորձիր նորից ավելի բարձր գնահատական ստանալու համար։'}
              </p>

              <div className="pt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setMiniExamFinished(false);
                    setMiniExamAnswers({});
                  }}
                  className="rounded-xl border border-stone-200 px-5 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
                >
                  Repetir examen (Կրկնել քննությունը)
                </button>
                <button
                  type="button"
                  onClick={onBackToModules}
                  className="rounded-xl bg-red-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-900"
                >
                  Siguiente lección del temario →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
