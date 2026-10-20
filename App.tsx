/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MODULES } from './modulesData.ts';
import { Module, Subtopic, UserStats } from './types.ts';
import { getLessonContent } from './lessonsData.ts';
import { LessonViewer } from './LessonViewer.tsx';
import { SyntaxTool } from './SyntaxTool.tsx';
import { GamesHub } from './GamesHub.tsx';
import { OralPracticeView } from './OralPracticeView.tsx';
import { ExamsView } from './ExamsView.tsx';
import { ReadingView } from './ReadingView.tsx';
import { MistakesReviewView } from './MistakesReviewView.tsx';
import { TeacherView } from './TeacherView.tsx';
import { loadUserStats } from './storage.ts';
import {
  BookOpen,
  Sparkles,
  Trophy,
  Search,
  MessageSquare,
  Network,
  Gamepad2,
  Mic,
  GraduationCap,
  AlertCircle,
  FileText,
  Volume2,
  ChevronRight,
  Layers,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function App() {
  const [stats, setStats] = useState<UserStats>(loadUserStats());
  const [activeTab, setActiveTab] = useState<
    'lecciones' | 'sintaxis' | 'juegos' | 'oral' | 'lectura' | 'examenes' | 'errores' | 'profesor'
  >('lecciones');

  // Currently opened lesson (subtopic id)
  const [currentSubtopicId, setCurrentSubtopicId] = useState<string | null>(null);

  // Search query across all 11 modules & subtopics
  const [searchQuery, setSearchQuery] = useState('');

  // Selected module filter in lessons browser
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('all');

  // Refresh stats periodically or on focus
  useEffect(() => {
    const refresh = () => setStats(loadUserStats());
    window.addEventListener('storage', refresh);
    const interval = setInterval(refresh, 2000);
    return () => {
      window.removeEventListener('storage', refresh);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab, currentSubtopicId]);

  const handleOpenSubtopic = (id: string) => {
    setCurrentSubtopicId(id);
    setActiveTab('lecciones');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToModules = () => {
    setCurrentSubtopicId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter modules and subtopics by search query
  const filteredModules = MODULES.map(m => {
    if (selectedModuleFilter !== 'all' && m.id !== selectedModuleFilter) {
      return null;
    }
    if (!searchQuery.trim()) return m;

    const query = searchQuery.toLowerCase();
    const matchedSubtopics = m.subtopics.filter(
      s =>
        s.titleEs.toLowerCase().includes(query) ||
        s.titleHy.toLowerCase().includes(query)
    );

    const moduleMatches =
      m.titleEs.toLowerCase().includes(query) ||
      m.titleHy.toLowerCase().includes(query) ||
      m.descriptionEs.toLowerCase().includes(query);

    if (moduleMatches || matchedSubtopics.length > 0) {
      return {
        ...m,
        subtopics: moduleMatches ? m.subtopics : matchedSubtopics
      };
    }
    return null;
  }).filter(Boolean) as Module[];

  const currentLessonContent = currentSubtopicId ? getLessonContent(currentSubtopicId) : null;

  return (
    <div className="min-h-screen bg-stone-50/70 text-stone-900 flex flex-col font-sans selection:bg-amber-200">
      {/* Top Main Header */}
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Brand Logo & Title */}
            <div
              onClick={() => {
                setCurrentSubtopicId(null);
                setActiveTab('lecciones');
              }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-800 to-amber-600 text-white font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
                1º
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-black text-stone-900 text-sm sm:text-base tracking-tight leading-tight">
                  <span>LENGUA 1.º ESO</span>
                  <span className="text-red-700">•</span>
                  <span className="text-amber-700 font-extrabold armenian-font text-xs sm:text-sm">ՀԱՅԵՐԵՆ</span>
                </div>
                <div className="text-[11px] text-stone-500 font-medium">
                  España • Lengua Castellana y Literatura
                </div>
              </div>
            </div>

            {/* Quick Stats & Badges HUD */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 shadow-2xs">
                <Trophy className="h-4 w-4 text-amber-600 shrink-0" />
                <span>{stats.points} pts</span>
              </div>

              <div className="hidden sm:flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>{stats.completedLessons.length} temas superados</span>
              </div>

              {stats.mistakes.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentSubtopicId(null);
                    setActiveTab('errores');
                  }}
                  className="flex items-center gap-1 rounded-xl bg-rose-100 border border-rose-300 px-2.5 py-1 text-xs font-bold text-rose-800 hover:bg-rose-200 transition-colors"
                  title="Errores pendientes de repasar"
                >
                  <AlertCircle className="h-3.5 w-3.5 text-rose-700" />
                  <span>{stats.mistakes.length}</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <nav className="flex overflow-x-auto gap-1 sm:gap-2 pb-2 text-xs font-bold scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setCurrentSubtopicId(null);
                setActiveTab('lecciones');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all whitespace-nowrap ${
                activeTab === 'lecciones' && !currentSubtopicId
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Todas las lecciones (11 Módulos)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentSubtopicId(null);
                setActiveTab('sintaxis');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all whitespace-nowrap ${
                activeTab === 'sintaxis'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <Network className="h-3.5 w-3.5" />
              <span>Sintaxis Interactiva</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentSubtopicId(null);
                setActiveTab('juegos');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all whitespace-nowrap ${
                activeTab === 'juegos'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <Gamepad2 className="h-3.5 w-3.5" />
              <span>13 Juegos Educativos</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentSubtopicId(null);
                setActiveTab('oral');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all whitespace-nowrap ${
                activeTab === 'oral'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <Mic className="h-3.5 w-3.5" />
              <span>Práctica Oral</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentSubtopicId(null);
                setActiveTab('lectura');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all whitespace-nowrap ${
                activeTab === 'lectura'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Comprensión Lectora</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentSubtopicId(null);
                setActiveTab('examenes');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all whitespace-nowrap ${
                activeTab === 'examenes'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Exámenes ESO (0-10)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentSubtopicId(null);
                setActiveTab('errores');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all whitespace-nowrap ${
                activeTab === 'errores'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Mis Errores ({stats.mistakes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentSubtopicId(null);
                setActiveTab('profesor');
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 transition-all whitespace-nowrap ${
                activeTab === 'profesor'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Modo Profesor</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* If a subtopic is opened, show LessonViewer */}
        {currentLessonContent ? (
          <LessonViewer
            lesson={currentLessonContent}
            onBackToModules={handleBackToModules}
            onNavigateSubtopic={handleOpenSubtopic}
          />
        ) : activeTab === 'lecciones' ? (
          /* ALL 11 MODULES SYLLABUS BROWSER */
          <div className="space-y-6">
            {/* Hero Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-800 via-rose-800 to-amber-700 p-6 sm:p-10 text-white shadow-md">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                  <span>Curso Escolar Completo • 1.º de ESO</span>
                  <span>•</span>
                  <span className="armenian-font">7-րդ դասարան</span>
                </div>
                <h1 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Lengua Castellana y Literatura — Español + <span className="armenian-font font-bold text-amber-200">Հայերեն</span>
                </h1>
                <p className="mt-2 text-sm sm:text-base text-amber-100 leading-relaxed armenian-font">
                  Ամբողջական, ինտերակտիվ կրթական հարթակ Իսպանիայում սովորող 12–13 տարեկան աշակերտի համար՝ իսպաներենի և հայերենի լիարժեք զուգակցմամբ։
                </p>

                {/* Quick Shortcuts */}
                <div className="mt-5 flex flex-wrap gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleOpenSubtopic('m1-1')}
                    className="rounded-xl bg-white px-4 py-2 font-bold text-red-900 hover:bg-amber-100 transition-colors shadow-xs"
                  >
                    Empezar Lección 1 (La comunicación) →
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sintaxis')}
                    className="rounded-xl bg-white/20 border border-white/30 px-4 py-2 font-bold text-white hover:bg-white/30 transition-colors"
                  >
                    Sintaxis por colores
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('juegos')}
                    className="rounded-xl bg-white/20 border border-white/30 px-4 py-2 font-bold text-white hover:bg-white/30 transition-colors"
                  >
                    Juegos de repaso
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Module Filter Ribbon */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar cualquier tema en español o armenio (ej: sujeto, agudas, metáfora...)"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Module Filter */}
              <select
                value={selectedModuleFilter}
                onChange={e => setSelectedModuleFilter(e.target.value)}
                className="rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs font-semibold text-stone-700 focus:outline-none focus:border-amber-500"
              >
                <option value="all">Todos los 11 módulos (Programa completo)</option>
                {MODULES.map(m => (
                  <option key={m.id} value={m.id}>
                    Módulo {m.number}: {m.titleEs}
                  </option>
                ))}
              </select>
            </div>

            {/* Module Cards with Accordion Subtopics */}
            <div className="space-y-6">
              {filteredModules.map(module => (
                <div
                  key={module.id}
                  className="rounded-3xl border border-stone-200 bg-white overflow-hidden shadow-xs hover:border-amber-300 transition-all"
                >
                  {/* Module Header */}
                  <div className="p-5 sm:p-6 border-b border-stone-100 bg-gradient-to-r from-stone-50 to-amber-50/20">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className={`rounded-md px-2.5 py-1 text-xs font-black uppercase tracking-wider ${module.badgeBg}`}>
                        Módulo {module.number}
                      </span>
                      <span className="text-xs font-semibold text-stone-500 font-sans">
                        {module.subtopics.length} temas interactivos
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug">
                      {module.titleEs}
                    </h2>
                    <p className="text-sm font-semibold text-amber-900 armenian-font mt-0.5">
                      {module.titleHy}
                    </p>
                    <p className="mt-2 text-xs text-stone-600 leading-relaxed font-sans max-w-3xl">
                      {module.descriptionEs}
                    </p>
                  </div>

                  {/* Subtopics List */}
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {module.subtopics.map(sub => {
                        const isCompleted = stats.completedLessons.includes(sub.id);

                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => handleOpenSubtopic(sub.id)}
                            className={`group rounded-2xl border p-3.5 text-left transition-all hover:scale-[1.01] hover:shadow-xs flex items-center justify-between gap-2 cursor-pointer ${
                              isCompleted
                                ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50'
                                : 'border-stone-200 bg-stone-50/50 hover:bg-amber-50/60 hover:border-amber-300'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-amber-800">
                                  {sub.number}.
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-stone-900 truncate group-hover:text-amber-950">
                                  {sub.titleEs}
                                </span>
                              </div>
                              <div className="text-[11px] text-stone-500 armenian-font truncate mt-0.5">
                                {sub.titleHy}
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-1">
                              {isCompleted && (
                                <span className="h-2 w-2 rounded-full bg-emerald-500" title="Tema superado" />
                              )}
                              <ChevronRight className="h-4 w-4 text-stone-400 group-hover:text-amber-700 transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'sintaxis' ? (
          <SyntaxTool />
        ) : activeTab === 'juegos' ? (
          <GamesHub />
        ) : activeTab === 'oral' ? (
          <OralPracticeView />
        ) : activeTab === 'lectura' ? (
          <ReadingView />
        ) : activeTab === 'examenes' ? (
          <ExamsView />
        ) : activeTab === 'errores' ? (
          <MistakesReviewView onNavigateToTopic={handleOpenSubtopic} />
        ) : activeTab === 'profesor' ? (
          <TeacherView onOpenTopic={handleOpenSubtopic} />
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 text-center text-xs text-stone-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Plataforma Educativa de <span className="font-bold text-stone-800">Lengua Castellana y Literatura 1.º ESO</span> con apoyo en armenio.
          </div>
          <div className="armenian-font text-stone-600">
            Իսպաներեն լեզվի և գրականության ամբողջական կրթական հարթակ
          </div>
        </div>
      </footer>
    </div>
  );
}
