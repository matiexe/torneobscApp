import { StandingEntry } from '@/lib/standings';
import { getTeamLogo } from '@/lib/utils';

interface TeamFormListProps {
  standings: StandingEntry[];
}

export function TeamFormList({ standings }: TeamFormListProps) {
  return (
    <div className="flex flex-col gap-3">
      {standings.map((entry) => (
        <div key={entry.teamId} className="glass-panel flex items-center justify-between p-3 rounded-xl border-[#e9c176]/10 hover:bg-[#e9c176]/5 transition-all">
          <div className="flex items-center gap-3">
            <img src={getTeamLogo(entry.teamName) || ''} alt="" className="w-5 h-5 object-contain opacity-80" />
            <span className="font-lexend text-[10px] font-bold text-[#c5c6cd] uppercase tracking-wider">{entry.teamName}</span>
          </div>
          <div className="flex gap-1.5">
            {entry.form.map((res, i) => (
              <div 
                key={i} 
                className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black ${
                  res === 'W' ? 'bg-[#4ade80] text-black shadow-[0_0_8px_rgba(74,222,128,0.2)]' : 
                  res === 'D' ? 'bg-[#fbbf24] text-black shadow-[0_0_8px_rgba(251,191,36,0.2)]' : 
                  'bg-[#f87171] text-white shadow-[0_0_8px_rgba(248,113,113,0.2)]'
                }`}
              >
                {res}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
