import { motion } from 'framer-motion';
import { CheckCircle2, Lock, Flame } from 'lucide-react';

export default function Calendar75({ currentDay, completedDays = {}, dayHistory = {} }) {
  const days = Array.from({ length: 75 }, (_, i) => i + 1);

  const getStatus = (day) => {
    if (day > currentDay) return 'future';
    if (day === currentDay) return 'today';
    if (completedDays[String(day)]) return 'completed';
    return 'missed';
  };

  const getColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-red-600 border-red-500 text-white shadow-[0_0_6px_rgba(220,38,38,0.5)]';
      case 'today':     return 'bg-red-600/20 border-red-500 text-red-400 ring-2 ring-red-500 ring-offset-1 ring-offset-black';
      case 'missed':    return 'bg-[#1a1a1a] border-red-900/30 text-red-900';
      case 'future':    return 'bg-[#111] border-[#222] text-gray-700';
      default:          return 'bg-[#111] border-[#222] text-gray-700';
    }
  };

  const completedCount = Object.keys(completedDays).length;
  const missedCount = Math.max(0, currentDay - 1 - completedCount);
  const streakDays = (() => {
    let streak = 0;
    for (let d = currentDay - 1; d >= 1; d--) {
      if (completedDays[String(d)]) streak++;
      else break;
    }
    return streak;
  })();

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#0f0f0f] border border-[#1e1e1e] p-4 text-center">
          <div className="text-3xl font-black text-red-500">{completedCount}</div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Tamamlanan</div>
        </div>
        <div className="bg-[#0f0f0f] border border-[#1e1e1e] p-4 text-center">
          <div className="text-3xl font-black text-white flex items-center justify-center gap-1">
            {streakDays} <Flame className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Seri</div>
        </div>
        <div className="bg-[#0f0f0f] border border-[#1e1e1e] p-4 text-center">
          <div className="text-3xl font-black text-gray-500">{missedCount}</div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Kaçırılan</div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-600 inline-block"></span> Tamamlandı</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-600/20 border border-red-500 inline-block"></span> Bugün</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#1a1a1a] border border-red-900/30 inline-block"></span> Kaçırıldı</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#111] border border-[#222] inline-block"></span> Gelecek</span>
      </div>

      {/* 75-Day Grid */}
      <div className="grid grid-cols-10 gap-1.5">
        {days.map((day) => {
          const status = getStatus(day);
          const score = dayHistory[String(day)];
          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: day * 0.005 }}
              title={`Gün ${day}${score !== undefined ? ` — ${score}%` : ''}`}
              className={`aspect-square border flex items-center justify-center text-[10px] font-black transition-all cursor-default relative group ${getColor(status)}`}
            >
              {status === 'completed' ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : status === 'future' ? (
                day <= currentDay + 3 ? (
                  <span className="text-gray-700">{day}</span>
                ) : (
                  <Lock className="w-2.5 h-2.5 opacity-30" />
                )
              ) : (
                <span>{day}</span>
              )}

              {/* Tooltip */}
              {score !== undefined && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-20 bg-black border border-[#333] px-2 py-1 text-[9px] whitespace-nowrap font-bold">
                  Gün {day} — {score}%
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Overall Progress Bar */}
      <div>
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
          <span>Genel İlerleme</span>
          <span>{Math.round((completedCount / 75) * 100)}% ({completedCount}/75 gün)</span>
        </div>
        <div className="h-3 w-full bg-[#111] border border-[#222] overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-red-700 to-red-500 shadow-[0_0_8px_rgba(220,38,38,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / 75) * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}
