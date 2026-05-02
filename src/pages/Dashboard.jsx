import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Check, LogOut, Trophy, Users, Flame,
  Droplets, BookOpen, Dumbbell, Footprints,
  Utensils, Camera, Shield, Target, Home,
  CalendarDays, BarChart2, ChevronRight
} from 'lucide-react';
import Workouts from '../components/Workouts';
import Calendar75 from '../components/Calendar75';
import ProgressChart from '../components/ProgressChart';
import { useFirebaseData } from '../hooks/useFirebaseData';
import { useSquadData } from '../hooks/useSquadData';

const TASKS_DEF = [
  { id: 1, title: '1 GALLON WATER',       icon: Droplets },
  { id: 2, title: 'READ 10 PAGES',        icon: BookOpen },
  { id: 3, title: 'WORKOUT 1 (INDOOR)',   icon: Dumbbell },
  { id: 4, title: 'WORKOUT 2 (OUTDOOR)',  icon: Footprints },
  { id: 5, title: 'FOLLOW DIET',          icon: Utensils },
  { id: 6, title: 'PROGRESS PICTURE',     icon: Camera },
];

const NAV = [
  { id: 'daily',       label: 'Directives', icon: Check },
  { id: 'calendar',    label: 'Calendar',   icon: CalendarDays },
  { id: 'protocol',    label: 'Protocol',   icon: Target },
  { id: 'friends',     label: 'Squad',      icon: Users },
  { id: 'leaderboard', label: 'Rankings',   icon: Trophy },
];

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('daily');
  const { userData, loading: userLoading, toggleTask, completeDay } = useFirebaseData(user?.id);
  const { squad, loading: squadLoading } = useSquadData();

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-dark)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  const sorted = [...squad].sort((a, b) => (b.progress || 0) - (a.progress || 0));

  /* ── TAB CONTENT ── */
  const TabContent = () => (
    <AnimatePresence mode="wait">
      {activeTab === 'daily' && (
        <motion.div key="daily" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
          {/* Progress Card */}
          <div className="border border-[var(--color-dark-border)] bg-[var(--color-dark-card)] p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />
            <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-2">Combat Readiness</p>
            <p className="text-6xl font-black tracking-tighter mb-4">
              {userData.progress}<span className="text-3xl text-gray-600">%</span>
            </p>
            <div className="h-2.5 w-full bg-[#1a1a1a] border border-[#333] overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all duration-500 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                style={{ width: `${userData.progress}%` }}
              />
            </div>
          </div>

          {/* Day badge */}
          <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
            <div className="flex-1 h-[1px] bg-[#222]" />
            DAY {userData.currentDay} / 75
            <div className="flex-1 h-[1px] bg-[#222]" />
          </div>

          {/* Tasks */}
          <div className="space-y-3">
            {TASKS_DEF.map(task => {
              const done = userData.tasks?.[task.id];
              const Icon = task.icon;
              return (
                <motion.button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full border transition-all p-4 flex items-center justify-between text-left group ${
                    done ? 'bg-red-600/10 border-red-600/50' : 'bg-[var(--color-dark-card)] border-[var(--color-dark-border)] hover:border-red-600/50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 border transition-colors ${done ? 'bg-red-600 border-red-500' : 'bg-[#1a1a1a] border-[#262626] group-hover:border-red-900/50'}`}>
                      <Icon className={`w-5 h-5 transition-colors ${done ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`} />
                    </div>
                    <span className={`font-bold tracking-tight transition-colors ${done ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                      {task.title}
                    </span>
                  </div>
                  <div className={`w-6 h-6 border-2 flex items-center justify-center transition-colors ${done ? 'border-red-500 bg-red-500' : 'border-gray-600 group-hover:border-red-500'}`}>
                    {done && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Progress Chart */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <BarChart2 className="w-4 h-4" /> Son 14 Gün — İlerleme Grafiği
            </div>
            <ProgressChart dayHistory={userData.dayHistory} currentDay={userData.currentDay} />
          </div>

          {/* Günü Tamamla Butonu */}
          {userData.progress === 100 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={completeDay}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 font-bold tracking-widest uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all"
            >
              <ChevronRight className="w-5 h-5" /> GÜN {userData.currentDay} TAMAMLANDI — SONRAKI GÜNE GEÇ
            </motion.button>
          )}
        </motion.div>
      )}

      {activeTab === 'calendar' && (
        <motion.div key="calendar" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <Calendar75
            currentDay={userData.currentDay}
            completedDays={userData.completedDays}
            dayHistory={userData.dayHistory}
          />
        </motion.div>
      )}

      {activeTab === 'protocol' && (
        <motion.div key="protocol" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <Workouts />
        </motion.div>
      )}

      {activeTab === 'friends' && (
        <motion.div key="friends" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Squad Status</h2>
          {squadLoading ? (
            <div className="text-center text-gray-500 py-10">Syncing with HQ...</div>
          ) : squad.length === 0 ? (
            <div className="text-center text-gray-500 py-10 border border-dashed border-[#333]">No operatives found.</div>
          ) : (
            squad.map(member => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`border p-4 relative overflow-hidden ${member.id === user.id ? 'border-red-600/50 bg-red-900/10' : 'border-[var(--color-dark-border)] bg-[var(--color-dark-card)]'}`}
              >
                {member.id === user.id && <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 border flex items-center justify-center text-sm font-black ${member.id === user.id ? 'border-red-500 bg-red-600/10 text-red-400' : 'border-[#333] bg-[#1a1a1a] text-gray-400'}`}>
                      {member.name?.substring(0, 2) || '??'}
                    </div>
                    <div>
                      <p className="font-bold uppercase tracking-widest text-sm text-white">{member.name || member.id}</p>
                      <p className="text-[10px] text-gray-500 font-bold tracking-widest">DAY {member.currentDay || 1}</p>
                    </div>
                  </div>
                  <p className={`text-2xl font-black ${member.progress >= 100 ? 'text-green-500' : 'text-white'}`}>
                    {member.progress || 0}%
                  </p>
                </div>
                <div className="h-1.5 w-full bg-[#1a1a1a] overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${member.progress >= 100 ? 'bg-green-500' : 'bg-red-600'}`}
                    style={{ width: `${member.progress || 0}%` }}
                  />
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {activeTab === 'leaderboard' && (
        <motion.div key="leaderboard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Global Rankings</h2>
          {sorted.length === 0 ? (
            <div className="border border-dashed border-[#333] py-16 text-center text-gray-600">
              <Trophy className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">Henüz katılımcı yok</p>
            </div>
          ) : sorted.map((member, idx) => {
            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
            const isMe = member.id === user.id;
            return (
              <div key={member.id}
                className={`flex items-center gap-4 p-4 border relative overflow-hidden ${
                  isMe ? 'border-red-600/50 bg-red-900/10' : idx === 0 ? 'border-red-600/30 bg-red-950/20' : 'border-[var(--color-dark-border)] bg-[var(--color-dark-card)]'
                }`}
              >
                {isMe && <div className="absolute top-0 left-0 w-1 h-full bg-red-600" />}
                <span className="text-2xl w-8 text-center flex-shrink-0">
                  {medal || <span className="text-gray-600 font-black text-lg">{idx + 1}</span>}
                </span>
                <div className={`w-10 h-10 border flex items-center justify-center text-sm font-black flex-shrink-0 ${
                  isMe ? 'border-red-500 bg-red-600/10 text-red-400' : 'border-[#333] bg-[#1a1a1a] text-gray-400'
                }`}>
                  {member.name?.substring(0, 2) || '??'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <p className="font-bold text-sm uppercase tracking-widest truncate">{member.name || member.id}</p>
                    {member.isAdmin && <span className="text-[9px] bg-red-600/20 text-red-400 border border-red-600/30 px-1.5 py-0.5 font-bold tracking-widest uppercase flex-shrink-0">ADMIN</span>}
                    {isMe && <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest flex-shrink-0">— BEN</span>}
                  </div>
                  <div className="h-1.5 w-full bg-[#1a1a1a] overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        member.progress >= 100 ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]' : idx === 0 ? 'bg-red-600' : 'bg-red-900'
                      }`}
                      style={{ width: `${member.progress || 0}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-1">Day {member.currentDay || 1} · {Object.keys(member.completedDays || {}).length} gün tamamlandı</p>
                </div>
                <span className={`text-xl font-black flex-shrink-0 ${
                  member.progress >= 100 ? 'text-green-500' : 'text-white'
                }`}>{member.progress || 0}%</span>
              </div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ── MOBILE LAYOUT ── */
  const MobileLayout = () => (
    <div className="min-h-screen bg-[var(--color-dark)] text-white font-sans">
      <main className="max-w-lg mx-auto min-h-screen flex flex-col pb-20 border-x border-[var(--color-dark-border)] bg-[#0a0a0a]">
        <header className="px-6 py-6 flex justify-between items-center border-b border-[var(--color-dark-border)]">
          <div>
            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-2">
              75 HARD <Flame className="w-6 h-6 text-red-600" fill="currentColor" />
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold bg-red-600/10 text-red-500 border border-red-600/20 px-2 py-0.5 uppercase tracking-widest">
                {user.name}
              </span>
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Day {userData.currentDay}/75</span>
            </div>
          </div>
          <button onClick={onLogout} className="p-2 text-gray-500 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 px-5 py-5">
          <TabContent />
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full z-50 bg-[#0a0a0a] border-t border-[var(--color-dark-border)]">
        <div className="max-w-lg mx-auto flex">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 py-4 flex flex-col items-center justify-center transition-all ${
                activeTab === id ? 'text-red-500 border-t-2 border-red-500 bg-red-500/5' : 'text-gray-500 border-t-2 border-transparent hover:text-gray-300'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-bold tracking-widest uppercase">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );

  /* ── DESKTOP LAYOUT ── */
  const DesktopLayout = () => (
    <div className="min-h-screen bg-[var(--color-dark)] text-white font-sans flex">

      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-[#0a0a0a] border-r border-[var(--color-dark-border)] flex flex-col fixed top-0 left-0 z-40">
        {/* Logo */}
        <div className="px-6 py-7 border-b border-[var(--color-dark-border)]">
          <div className="flex items-center gap-2">
            <Flame className="w-7 h-7 text-red-600" fill="currentColor" />
            <span className="text-xl font-black tracking-tighter">75 HARD</span>
          </div>
        </div>

        {/* User Card */}
        <div className="px-6 py-5 border-b border-[var(--color-dark-border)]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-600/10 border border-red-500/50 flex items-center justify-center text-sm font-black text-red-400">
              {user.name?.substring(0, 2)}
            </div>
            <div>
              <p className="font-bold text-sm uppercase tracking-widest">{user.name}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user.role}</p>
            </div>
          </div>
          {/* Mini progress */}
          <div className="mt-4">
            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
              <span>Day {userData.currentDay}/75</span>
              <span className="text-red-500">{userData.progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#1a1a1a] border border-[#262626] overflow-hidden">
              <div className="h-full bg-red-600" style={{ width: `${userData.progress}%` }} />
            </div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold tracking-widest uppercase transition-all ${
                activeTab === id
                  ? 'bg-red-600/10 border border-red-600/30 text-red-400'
                  : 'text-gray-500 hover:text-white hover:bg-[#111] border border-transparent'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer buttons */}
        <div className="px-3 pb-6 space-y-2 border-t border-[var(--color-dark-border)] pt-4">
          <button onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" /> Ana Sayfa
          </button>
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold tracking-widest uppercase text-gray-500 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur border-b border-[var(--color-dark-border)] px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black uppercase tracking-tighter">
              {NAV.find(n => n.id === activeTab)?.label}
            </h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">75 Hard Combat Platform</p>
          </div>
          {activeTab === 'daily' && (
            <div className="text-right">
              <p className="text-2xl font-black">{userData.progress}%</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Today's Progress</p>
            </div>
          )}
        </header>

        {/* Page content */}
        <div className="p-8 max-w-4xl">
          <TabContent />
        </div>
      </main>
    </div>
  );

  return (
    <>
      {/* Mobile: < 1024px */}
      <div className="block lg:hidden">
        <MobileLayout />
      </div>
      {/* Desktop: >= 1024px */}
      <div className="hidden lg:block">
        <DesktopLayout />
      </div>
    </>
  );
}
