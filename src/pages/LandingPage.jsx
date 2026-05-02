import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Droplets, BookOpen, Utensils, Camera, Dumbbell, Footprints, Flame, Trophy, Shield, ChevronRight } from 'lucide-react';
import { useSquadData } from '../hooks/useSquadData';

/* ── KURALLAR ── */
const RULES = [
  { num: '01', title: 'SABAH KOŞUSU', desc: 'En az 45 dakika. Mutlaka açık havada. Yağmur, rüzgar, bahane geçersiz.', badge: '45+ dk · dışarı', icon: Footprints },
  { num: '02', title: '3.8 LİTRE SU', desc: 'Günde minimum 3.8 litre su. Kafein ve alkollü içecekler sayılmaz.', badge: '3800 ml', icon: Droplets },
  { num: '03', title: '10 SAYFA KİTAP', desc: 'Kişisel gelişim odaklı kitap. Sesli kitap geçersiz. Minimum 10 sayfa.', badge: 'non-fiction', icon: BookOpen },
  { num: '04', title: 'DİYETE UYMAK', desc: 'Seçtiğin diyete sıkı sıkıya uymak. Alkol yok. Cheat meal yok.', badge: 'sıfır istisna', icon: Utensils },
  { num: '05', title: 'İLERLEME FOTOĞRAFI', desc: 'Her gün bir fotoğraf. Süreci belgele, dönüşümü gör.', badge: 'her gün', icon: Camera },
  { num: '06', title: 'AKŞAM ANTRENMANI', desc: 'Push / Pull / Leg döngüsü. Tam donanımlı spor salonu. 45+ dakika.', badge: 'PPL · salon', icon: Dumbbell },
];

import { WORKOUT_DATA, WORKOUT_TABS } from '../data/workouts';

/* ── ANA BILEŞEN ── */
export default function LandingPage() {
  const navigate = useNavigate();
  const { squad } = useSquadData();
  const [activeWorkout, setActiveWorkout] = React.useState('push');

  const sorted = [...squad].sort((a, b) => (b.progress || 0) - (a.progress || 0));

  return (
    <div className="min-h-screen bg-[var(--color-dark)] text-white font-sans selection:bg-red-500/30 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{ backgroundImage: 'radial-gradient(circle at center, #fff 0%, #000 70%)' }}
      ></div>

      {/* ── NAV ── */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[var(--color-dark-border)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-xl font-black tracking-tighter flex items-center gap-2">
            75 HARD <Flame className="w-5 h-5 text-red-600" />
          </div>
          <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-widest uppercase text-gray-400">
            <a href="#rules" className="hover:text-white transition-colors">Kurallar</a>
            <a href="#program" className="hover:text-white transition-colors">Program</a>
            <a href="#scoreboard" className="hover:text-white transition-colors">Scoreboard</a>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)]"
          >
            SİSTEME GİRİŞ
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-36 pb-24 px-6 max-w-7xl mx-auto z-10">
        <div className="max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center px-3 py-1 border border-red-600/30 bg-red-600/10 text-red-500 text-xs font-bold uppercase tracking-widest mb-6"
          >
            Mental Dayanıklılık Programı · 75 Gün
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-7xl md:text-[10rem] font-black tracking-tighter leading-none mb-6"
          >
            75<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">HARD</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg max-w-xl mb-10 leading-relaxed"
          >
            75 gün boyunca her gün 6 görevi eksiksiz tamamla. Bir gün bile kaçırırsan sıfırdan başlarsın.
            Bu bir diyet programı değil — zihnini, bedenini ve iradenini yeniden inşa etme savaşı.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <button onClick={() => navigate('/login')}
              className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-sm font-bold tracking-widest uppercase transition-all flex items-center gap-2 group"
            >
              KATIL VE BAŞLA <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="#scoreboard"
              className="border border-[#333] hover:border-red-600 text-gray-400 hover:text-white px-8 py-4 text-sm font-bold tracking-widest uppercase transition-all"
            >
              SKOR TABLOSU
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="flex gap-10 mt-16 pt-8 border-t border-[#222]"
          >
            {[['75', 'GÜN'], ['6', 'GÖREV/GÜN'], ['0', 'BAHANE']].map(([n, l]) => (
              <div key={l}>
                <div className={`text-4xl font-black ${n === '0' ? 'text-red-500' : 'text-white'}`}>{n}</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">{l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SCOREBOARD ── */}
      <section id="scoreboard" className="py-24 px-6 bg-[#080808] border-y border-[var(--color-dark-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-[1px] bg-red-600"></div>
            <span className="text-red-500 text-xs font-bold uppercase tracking-widest">Canlı Skor Tablosu</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-12">GLOBAL<br/>RANKINGS</h2>

          {sorted.length === 0 ? (
            <div className="border border-dashed border-[#333] py-20 text-center text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold tracking-widest uppercase text-sm">Henüz katılımcı yok</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sorted.map((member, idx) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.07 }}
                  className={`relative flex items-center gap-6 p-5 border overflow-hidden ${
                    idx === 0 ? 'border-red-600/60 bg-red-900/10' : 'border-[#1e1e1e] bg-[#0f0f0f]'
                  }`}
                >
                  {/* Rank */}
                  <div className={`text-3xl font-black w-12 text-center flex-shrink-0 ${
                    idx === 0 ? 'text-red-500' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-700' : 'text-gray-600'
                  }`}>
                    {idx + 1}
                  </div>

                  {/* Avatar */}
                  <div className={`w-12 h-12 border flex items-center justify-center flex-shrink-0 ${
                    idx === 0 ? 'border-red-500 bg-red-600/10' : 'border-[#333] bg-[#1a1a1a]'
                  }`}>
                    <span className="font-black text-sm">{member.name?.substring(0, 2) || '??'}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-bold uppercase tracking-widest text-sm text-white">{member.name || member.id}</span>
                      {member.isAdmin && (
                        <span className="text-[9px] bg-red-600/20 text-red-400 border border-red-600/30 px-2 py-0.5 font-bold tracking-widest uppercase">ADMIN</span>
                      )}
                      <span className="text-[9px] text-gray-600 font-bold tracking-widest uppercase ml-auto">GÜN {member.currentDay || 1}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1a1a1a] overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${member.progress >= 100 ? 'bg-green-500' : idx === 0 ? 'bg-red-600' : 'bg-red-900'}`}
                        style={{ width: `${member.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className={`text-2xl font-black flex-shrink-0 ${member.progress >= 100 ? 'text-green-500' : 'text-white'}`}>
                    {member.progress || 0}%
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── KURALLAR ── */}
      <section id="rules" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-[1px] bg-red-600"></div>
            <span className="text-red-500 text-xs font-bold uppercase tracking-widest">Program Kuralları</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-12">6 KURAL.<br/>HER GÜN.</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {RULES.map((rule, idx) => (
              <motion.div
                key={rule.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="bg-[#0f0f0f] border border-[#1e1e1e] p-8 hover:border-red-600/40 transition-colors group relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 text-9xl font-black text-white/[0.02] pointer-events-none select-none">{rule.num}</div>
                <div className="w-12 h-12 bg-[#1a1a1a] border border-[#333] flex items-center justify-center mb-6 group-hover:border-red-500 transition-colors">
                  <rule.icon className="w-6 h-6 text-gray-500 group-hover:text-red-500 transition-colors" />
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-3 group-hover:text-red-400 transition-colors">{rule.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{rule.desc}</p>
                <span className="inline-block px-3 py-1 bg-black border border-[#222] text-[10px] font-bold text-gray-500 tracking-widest uppercase">{rule.badge}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANTRENMAN PROGRAMI ── */}
      <section id="program" className="py-24 px-6 bg-[#080808] border-y border-[var(--color-dark-border)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-[1px] bg-red-600"></div>
            <span className="text-red-500 text-xs font-bold uppercase tracking-widest">Akşam Antrenman Programı</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">PUSH · PULL<br/>· LEG</h2>
          <p className="text-gray-500 text-sm mb-10 max-w-xl leading-relaxed">
            Eski profesyonel yüzücü altyapısıyla tasarlandı. Yüksek hacim, ileri seviye, kas kütlesi odaklı.
          </p>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            {WORKOUT_TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveWorkout(tab.id)}
                className={`px-5 py-2.5 text-xs font-bold tracking-widest uppercase border transition-all ${
                  activeWorkout === tab.id
                    ? 'bg-red-600 border-red-500 text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]'
                    : 'bg-[#0f0f0f] border-[#222] text-gray-400 hover:border-red-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Exercises - 2 column on desktop */}
          <motion.div key={activeWorkout} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {WORKOUT_DATA[activeWorkout].map((ex, idx) => (
              <div key={idx} className="flex border border-[#1e1e1e] bg-[#0f0f0f] overflow-hidden group hover:border-red-900/50 transition-colors">
                <div className="bg-[#1a1a1a] w-12 flex items-center justify-center border-r border-[#1e1e1e] text-gray-600 font-mono text-xs font-bold flex-shrink-0">
                  {ex.num}
                </div>
                <div className="p-4 flex-1">
                  <h3 className="font-bold text-white text-sm mb-1">{ex.name}</h3>
                  <p className="text-xs text-gray-500">{ex.detail}</p>
                </div>
                <div className="bg-red-900/10 border-l border-[#1e1e1e] px-3 flex flex-col justify-center items-center min-w-[64px] flex-shrink-0">
                  <span className="text-[9px] text-red-500/70 font-bold tracking-widest uppercase">SET</span>
                  <span className="text-xs font-black text-white">{ex.sets}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <Flame className="w-16 h-16 text-red-600 mx-auto mb-6 animate-pulse" />
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">HAZIR MISIN?</h2>
          <p className="text-gray-500 mb-10">Başlarsan bitirirsin. Bir gün kaçırırsan sıfırdan başlarsın.</p>
          <button onClick={() => navigate('/login')}
            className="bg-red-600 hover:bg-red-700 text-white px-12 py-5 text-sm font-bold tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(220,38,38,0.6)]"
          >
            SAVAŞA BAŞLA →
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 border-t border-[var(--color-dark-border)] text-center text-gray-600 text-xs font-bold tracking-widest uppercase">
        75 HARD PROTOCOL · ZERO EXCUSES · ZERO EXCEPTIONS
      </footer>
    </div>
  );
}
