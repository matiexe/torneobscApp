import { StandingEntry } from '@/lib/standings';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface StandingsTableProps {
  standings: StandingEntry[];
}

export function StandingsTable({ standings }: StandingsTableProps) {
  const getTeamLogo = (teamName: string | undefined) => {
    if (!teamName) return null;
    const slug = teamName.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/ñ/g, 'n');
    return `/logos/${slug}.png`;
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden border-[#e9c176]/20">
      <Table>
        <TableHeader className="bg-[#e9c176]/10">
          <TableRow className="border-[#e9c176]/10 hover:bg-transparent">
            <TableHead className="w-12 text-center font-bold text-[#e9c176]">POS</TableHead>
            <TableHead className="font-bold text-[#e9c176]">EQUIPO</TableHead>
            <TableHead className="text-center font-bold text-[#e9c176]">PJ</TableHead>
            <TableHead className="text-center font-bold text-[#e9c176]">G</TableHead>
            <TableHead className="text-center font-bold text-[#e9c176]">E</TableHead>
            <TableHead className="text-center font-bold text-[#e9c176]">P</TableHead>
            <TableHead className="text-center font-bold text-[#e9c176]">GD</TableHead>
            <TableHead className="text-center font-bold text-[#e9c176]">PTS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings.map((entry, index) => (
            <TableRow key={entry.teamId} className="border-[#e9c176]/5 hover:bg-[#e9c176]/5 transition-colors">
              <TableCell className="text-center font-black italic text-[#e9c176]/60">{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <img src={getTeamLogo(entry.teamName) || ''} alt="" className="w-6 h-6 object-contain" />
                  <span className="font-anybody font-bold text-sm uppercase">{entry.teamName}</span>
                </div>
              </TableCell>
              <TableCell className="text-center font-lexend text-xs">{entry.played}</TableCell>
              <TableCell className="text-center font-lexend text-xs text-[#4ade80]">{entry.won}</TableCell>
              <TableCell className="text-center font-lexend text-xs text-[#fbbf24]">{entry.drawn}</TableCell>
              <TableCell className="text-center font-lexend text-xs text-[#f87171]">{entry.lost}</TableCell>
              <TableCell className="text-center font-lexend text-xs font-bold">{entry.gd > 0 ? `+${entry.gd}` : entry.gd}</TableCell>
              <TableCell className="text-center font-anybody font-black text-[#e9c176]">{entry.pts}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
