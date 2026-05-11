import { Trophy } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  goals: number;
  team: { name: string };
}

interface ScorersListProps {
  players: Player[];
}

export function ScorersList({ players }: ScorersListProps) {
  const getTeamLogo = (teamName: string | undefined) => {
    if (!teamName) return null;
    const slug = teamName.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/ñ/g, 'n');
    return `/logos/${slug}.png`;
  };

  return (
    <div className="flex flex-col gap-4">
      {players.map((player, index) => (
        <div key={player.id} className="glass-panel flex items-center justify-between p-4 rounded-xl border-[#e9c176]/10 hover:bg-[#e9c176]/5 transition-all">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-[#111415] border border-[#e9c176]/20 flex items-center justify-center font-anybody font-bold text-[#e9c176]">
              {index + 1}
            </div>
            <div>
              <p className="font-anybody font-bold text-lg uppercase tracking-tight">{player.name}</p>
              <div className="flex items-center gap-2">
                <img src={getTeamLogo(player.team.name) || ''} alt="" className="w-4 h-4 object-contain opacity-70" />
                <p className="text-[10px] font-bold text-[#c5c6cd] uppercase">{player.team.name}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#e9c176]/10 rounded-lg border border-[#e9c176]/20">
            <Trophy className="w-4 h-4 text-[#e9c176]" />
            <span className="font-anybody text-2xl font-black text-[#e9c176] gold-glow">{player.goals}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
