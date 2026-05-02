export default function ProgressChart({ dayHistory = {}, currentDay = 1 }) {
  // Son 14 günün verisini al
  const days = Array.from({ length: Math.min(currentDay, 14) }, (_, i) => {
    const day = Math.max(1, currentDay - 13 + i);
    return { day, score: dayHistory[String(day)] ?? null };
  });

  const maxScore = 100;
  const chartHeight = 80;

  if (days.length === 0 || days.every(d => d.score === null)) {
    return (
      <div className="border border-dashed border-[#333] py-8 text-center text-gray-600 text-xs font-bold uppercase tracking-widest">
        Henüz geçmiş veri yok
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-1">
        <span>Son 14 Gün — Tamamlanma Oranı</span>
        <span>%100</span>
      </div>

      {/* Bar Chart */}
      <div className="flex items-end gap-1 h-20 border-b border-l border-[#222] px-1 pb-0 relative">
        {/* Yatay kılavuz çizgiler */}
        {[25, 50, 75, 100].map(pct => (
          <div key={pct}
            className="absolute left-0 right-0 border-t border-[#1a1a1a]"
            style={{ bottom: `${(pct / 100) * chartHeight}px` }}
          />
        ))}

        {days.map(({ day, score }) => (
          <div key={day} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div
              className="w-full relative overflow-hidden transition-all duration-700"
              style={{ height: `${((score ?? 0) / maxScore) * chartHeight}px` }}
            >
              <div className={`w-full h-full ${
                score === 100 ? 'bg-red-600' : score >= 50 ? 'bg-red-800' : 'bg-red-950'
              }`} />
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10">
              <div className="bg-black border border-[#333] px-2 py-1 text-[9px] font-bold whitespace-nowrap">
                Gün {day}: {score !== null ? `${score}%` : '—'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* X-axis labels */}
      <div className="flex gap-1 px-1">
        {days.map(({ day }) => (
          <div key={day} className="flex-1 text-center text-[8px] font-bold text-gray-600">
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}
