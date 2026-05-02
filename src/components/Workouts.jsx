import { useState } from 'react';
import { motion } from 'framer-motion';
import { WORKOUT_DATA, WORKOUT_TABS as TABS } from '../data/workouts';

export default function Workouts() {
  const [activeTab, setActiveTab] = useState('push');

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h2 className="text-xl font-black tracking-tighter uppercase mb-1">Combat Protocols</h2>
        <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">Eski profesyonel yüzücü altyapısı. Yüksek hacim, ileri seviye.</p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-2 text-xs font-bold tracking-widest uppercase border transition-all ${
              activeTab === tab.id 
                ? 'bg-red-600 border-red-500 text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]' 
                : 'bg-[#1a1a1a] border-[#333] text-gray-400 hover:border-red-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Workout List */}
      <motion.div 
        key={activeTab}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-3"
      >
        {WORKOUT_DATA[activeTab].map((ex, idx) => (
          <div key={idx} className="flex border border-[#262626] bg-[#121212] overflow-hidden group hover:border-red-900/50 transition-colors">
            <div className="bg-[#1a1a1a] w-12 flex items-center justify-center border-r border-[#262626] group-hover:border-red-900/50 transition-colors text-gray-500 font-mono text-sm font-bold">
              {ex.num}
            </div>
            <div className="p-3 flex-1">
              <h3 className="font-bold text-white tracking-tight text-sm mb-1">{ex.name}</h3>
              <p className="text-xs text-gray-500 leading-tight">{ex.detail}</p>
            </div>
            <div className="bg-red-900/10 border-l border-[#262626] group-hover:border-red-900/50 transition-colors px-3 flex flex-col justify-center items-center min-w-[70px]">
              <span className="text-[10px] text-red-500/80 font-bold tracking-widest uppercase mb-0.5">SET</span>
              <span className="text-xs font-black text-white">{ex.sets}</span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
