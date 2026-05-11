import { Match } from '@/lib/standings';
import { Swords } from 'lucide-react';
import { getTeamLogo } from '@/lib/utils';

interface MatchCardProps {
  match: Match;
  type: 'result' | 'fixture';
}

export function MatchCard({ match, type }: MatchCardProps) {
  if (type === 'result') {
    return (
      <div className="match-card-gradient border border-[#44474d]/30 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center text-[10px] text-[#c5c6cd] font-bold uppercase border-b border-[#44474d]/20 pb-2">
          <span className="text-[#e9c176]">Resultado Final</span>
          <span>Temporada 2026</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center flex-1 overflow-hidden">
            <img src={getTeamLogo(match.home_team?.name) || ''} alt="" className="w-8 h-8 object-contain mb-1" />
            <span className="text-[10px] font-bold uppercase truncate w-full text-center">{match.home_team?.name}</span>
          </div>
          <div className="flex items-center gap-4 px-4 py-1 bg-[#1d2021] rounded-lg border border-[#e9c176]/10">
            <span className="font-anybody text-xl font-bold">{match.home_score}</span>
            <span className="text-[#e9c176]/40">-</span>
            <span className="font-anybody text-xl font-bold">{match.away_score}</span>
          </div>
          <div className="flex flex-col items-center flex-1 overflow-hidden">
            <img src={getTeamLogo(match.away_team?.name) || ''} alt="" className="w-8 h-8 object-contain mb-1" />
            <span className="text-[10px] font-bold uppercase truncate w-full text-center">{match.away_team?.name}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between glass-panel rounded-lg p-3 md:px-6 hover:bg-[#e9c176]/5 transition-colors border-[#e9c176]/10 gap-2 sm:gap-4">
      {/* Mobile: Top Row with Date/Time */}
      <div className="w-full sm:w-24 flex justify-between sm:block border-b sm:border-b-0 border-[#e9c176]/10 pb-1 sm:pb-0">
        <span className="font-lexend text-[10px] md:text-[11px] font-bold text-[#c5c6cd] sm:text-inherit">
          {new Date(match.match_date).toLocaleDateString()}
        </span>
        <span className="sm:hidden font-lexend text-[10px] font-bold text-[#e9c176]">21:00 HRS</span>
      </div>

      {/* Teams section */}
      <div className="flex-1 w-full flex items-center justify-center gap-2 md:gap-4 overflow-hidden py-1 sm:py-0">
        <div className="flex items-center gap-1 md:gap-2 flex-1 justify-end overflow-hidden">
          <span className="text-[10px] font-bold uppercase truncate text-right">{match.home_team?.name}</span>
          <img src={getTeamLogo(match.home_team?.name) || ''} alt="" className="w-5 h-5 object-contain shrink-0" />
        </div>
        <div className="px-2 md:px-3 py-1 bg-[#0a192f] rounded border border-[#e9c176]/20 font-anybody text-[#e9c176] text-[10px] md:text-xs font-bold shrink-0">VS</div>
        <div className="flex items-center gap-1 md:gap-2 flex-1 justify-start overflow-hidden">
          <img src={getTeamLogo(match.away_team?.name) || ''} alt="" className="w-5 h-5 object-contain shrink-0" />
          <span className="text-[10px] font-bold uppercase truncate text-left">{match.away_team?.name}</span>
        </div>
      </div>

      {/* Desktop only Time */}
      <div className="hidden sm:block w-20 text-right shrink-0">
        <span className="font-lexend text-[10px] font-bold text-[#e9c176]">21:00 HRS</span>
      </div>
    </div>
  );
}
