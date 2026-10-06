'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Match, StandingEntry, Team } from '@/lib/standings';
import {
  calculatePlayoffBracket,
  detectPlayoffMatches,
  isPlaceholderTeam,
} from '@/lib/playoffs';
import { PlayoffBracket } from './PlayoffBracket';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTeamLogo } from '@/lib/utils';
import {
  Trophy,
  Swords,
  Sparkles,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AdminPlayoffManagerProps {
  standings: StandingEntry[];
  teams: Team[];
  matches: Match[];
  allTeams: Team[]; // Includes placeholders if present
  onRefresh: () => Promise<void>;
}

export function AdminPlayoffManager({
  standings,
  teams,
  matches,
  allTeams,
  onRefresh,
}: AdminPlayoffManagerProps) {
  const [loading, setLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [tieTieSF1Winner, setTieSF1Winner] = useState<string>('');
  const [tieTieSF2Winner, setTieSF2Winner] = useState<string>('');

  const bracket = calculatePlayoffBracket(standings, matches);
  const { sf1Match, sf2Match, finalMatch } = detectPlayoffMatches(matches, standings);

  const top1 = standings[0];
  const top2 = standings[1];
  const top3 = standings[2];
  const top4 = standings[3];

  const hasEnoughTeams = standings.length >= 4;

  // Resolving winners with tie-breaker overrides if available
  const sf1WinnerId =
    bracket.semifinal1.winnerTeamId ||
    (bracket.semifinal1.isTie ? tieTieSF1Winner || null : null);
  const sf2WinnerId =
    bracket.semifinal2.winnerTeamId ||
    (bracket.semifinal2.isTie ? tieTieSF2Winner || null : null);

  const sf1WinnerTeam = allTeams.find((t) => t.id === sf1WinnerId);
  const sf2WinnerTeam = allTeams.find((t) => t.id === sf2WinnerId);

  const canGenerateFinalWithTieBreaker = Boolean(sf1WinnerTeam && sf2WinnerTeam);

  // Generate / Update Semifinals in Supabase
  const handleGenerateSemifinals = async () => {
    if (!hasEnoughTeams || !top1 || !top2 || !top3 || !top4) {
      toast.error('Se necesitan al menos 4 equipos en la tabla de posiciones');
      return;
    }

    setLoading(true);
    try {
      const team1 = allTeams.find((t) => t.id === top1.teamId);
      const team2 = allTeams.find((t) => t.id === top2.teamId);
      const team3 = allTeams.find((t) => t.id === top3.teamId);
      const team4 = allTeams.find((t) => t.id === top4.teamId);

      if (!team1 || !team2 || !team3 || !team4) {
        throw new Error('No se encontraron los equipos clasificados en la base de datos');
      }

      // Default date for new matches if needed (1 week from today)
      const defaultDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      // 1. Update or create Semifinal 1 (1º vs 4º)
      if (sf1Match) {
        const { error } = await supabase
          .from('matches')
          .update({
            home_team_id: team1.id,
            away_team_id: team4.id,
          })
          .eq('id', sf1Match.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('matches').insert({
          home_team_id: team1.id,
          away_team_id: team4.id,
          match_date: defaultDate,
          status: 'pending',
        });
        if (error) throw error;
      }

      // 2. Update or create Semifinal 2 (2º vs 3º)
      if (sf2Match) {
        const { error } = await supabase
          .from('matches')
          .update({
            home_team_id: team2.id,
            away_team_id: team3.id,
          })
          .eq('id', sf2Match.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('matches').insert({
          home_team_id: team2.id,
          away_team_id: team3.id,
          match_date: defaultDate,
          status: 'pending',
        });
        if (error) throw error;
      }

      toast.success(
        `Cruces generados con éxito: SF1 (${team1.name} vs ${team4.name}) y SF2 (${team2.name} vs ${team3.name})`
      );
      await onRefresh();
    } catch (err: any) {
      console.error(err);
      toast.error(`Error al generar semifinales: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate / Update Final in Supabase
  const handleGenerateFinal = async () => {
    if (!sf1WinnerTeam || !sf2WinnerTeam) {
      toast.error('Ambas semifinales deben tener un ganador definido');
      return;
    }

    setLoading(true);
    try {
      const defaultDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

      if (finalMatch) {
        const { error } = await supabase
          .from('matches')
          .update({
            home_team_id: sf1WinnerTeam.id,
            away_team_id: sf2WinnerTeam.id,
          })
          .eq('id', finalMatch.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('matches').insert({
          home_team_id: sf1WinnerTeam.id,
          away_team_id: sf2WinnerTeam.id,
          match_date: defaultDate,
          status: 'pending',
        });
        if (error) throw error;
      }

      toast.success(`Gran Final configurada con éxito: ${sf1WinnerTeam.name} vs ${sf2WinnerTeam.name}`);
      await onRefresh();
    } catch (err: any) {
      console.error(err);
      toast.error(`Error al generar la final: ${err.message || 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // Revert matches back to placeholders if requested
  const handleRevertToPlaceholders = async () => {
    setLoading(true);
    setResetDialogOpen(false);
    try {
      const p1 = allTeams.find((t) => t.name.toUpperCase() === '1RO');
      const p4 = allTeams.find((t) => t.name.toUpperCase() === '4TO');
      const p2 = allTeams.find((t) => t.name.toUpperCase() === '2DO');
      const p3 = allTeams.find((t) => t.name.toUpperCase() === '3ERO');
      const f1 = allTeams.find((t) => t.name.toUpperCase() === 'FINALISTA 1');
      const f2 = allTeams.find((t) => t.name.toUpperCase() === 'FINALISTA 2');

      if (!p1 || !p4 || !p2 || !p3 || !f1 || !f2) {
        throw new Error(
          'No se encontraron todos los equipos placeholders (1RO, 4TO, etc.) en la base de datos.'
        );
      }

      if (sf1Match) {
        await supabase
          .from('matches')
          .update({ home_team_id: p1.id, away_team_id: p4.id, status: 'pending', home_score: null, away_score: null })
          .eq('id', sf1Match.id);
      }
      if (sf2Match) {
        await supabase
          .from('matches')
          .update({ home_team_id: p2.id, away_team_id: p3.id, status: 'pending', home_score: null, away_score: null })
          .eq('id', sf2Match.id);
      }
      if (finalMatch) {
        await supabase
          .from('matches')
          .update({ home_team_id: f1.id, away_team_id: f2.id, status: 'pending', home_score: null, away_score: null })
          .eq('id', finalMatch.id);
      }

      toast.success('Partidos de playoffs restablecidos a placeholders');
      await onRefresh();
    } catch (err: any) {
      console.error(err);
      toast.error(`No se pudo restablecer: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Overview Banner */}
      <div className="glass-panel rounded-xl p-6 border-l-4 border-l-[#e9c176] bg-black/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-[#e9c176]" />
              <h3 className="font-anybody text-lg font-bold text-white uppercase tracking-wider">
                Generador de Cruces Finales & Playoffs
              </h3>
            </div>
            <p className="text-xs text-[#c5c6cd]">
              Calcula y asigna automáticamente los partidos de eliminación directa en la base de datos a partir de la tabla de posiciones: <span className="text-[#e9c176] font-semibold">1º vs 4º</span> y <span className="text-[#e9c176] font-semibold">2º vs 3º</span>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRefresh()}
              className="border-[#e9c176]/30 text-[#e9c176] hover:bg-[#e9c176]/10 text-xs font-bold uppercase gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Actualizar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setResetDialogOpen(true)}
              className="text-[#ffb4ab] hover:text-white hover:bg-[#ffb4ab]/10 text-xs font-bold uppercase gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restablecer
            </Button>
          </div>
        </div>
      </div>

      {/* Standings Qualifiers Cards */}
      <div className="space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-[#e9c176]/20">
          <h4 className="font-anybody text-sm font-bold text-[#e9c176] uppercase tracking-wider flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#4ade80]" />
            Equipos Clasificados según Tabla Actual
          </h4>
          <span className="text-[10px] text-[#c5c6cd]">Top 4 clasifica a Semifinales</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { pos: '1º Lugar', team: top1, seed: 'Local SF 1', badge: '1º vs 4º' },
            { pos: '2º Lugar', team: top2, seed: 'Local SF 2', badge: '2º vs 3º' },
            { pos: '3º Lugar', team: top3, seed: 'Visitante SF 2', badge: '2º vs 3º' },
            { pos: '4º Lugar', team: top4, seed: 'Visitante SF 1', badge: '1º vs 4º' },
          ].map((item, idx) => (
            <div
              key={idx}
              className="glass-panel rounded-xl p-3 border-[#e9c176]/20 bg-black/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#e9c176]/10 border border-[#e9c176]/30 flex items-center justify-center font-anybody font-black text-xs text-[#e9c176] shrink-0">
                  {idx + 1}
                </div>
                {item.team ? (
                  <div className="min-w-0">
                    <p className="font-anybody text-xs font-bold uppercase text-white truncate">
                      {item.team.teamName}
                    </p>
                    <p className="text-[10px] text-[#c5c6cd]">
                      {item.team.pts} Pts • DG {item.team.gd > 0 ? `+${item.team.gd}` : item.team.gd}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[#c5c6cd]/40 italic">Por definir</p>
                )}
              </div>

              <Badge className="bg-[#e9c176]/10 text-[#e9c176] border-none text-[8px] font-black uppercase shrink-0">
                {item.seed}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Action Sections: 1. Semifinales | 2. Gran Final */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Semifinales */}
        <div className="glass-panel rounded-xl p-5 border-[#e9c176]/30 bg-[#0a192f]/40 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#e9c176]/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#e9c176] text-black font-black text-xs flex items-center justify-center font-anybody">
                  1
                </span>
                <h4 className="font-anybody text-sm font-bold text-white uppercase tracking-wider">
                  Cruces de Semifinales
                </h4>
              </div>
              <Badge
                className={`text-[8px] font-black uppercase ${
                  bracket.semifinal1.isConfirmed && bracket.semifinal2.isConfirmed
                    ? 'bg-[#4ade80]/15 text-[#4ade80]'
                    : 'bg-[#e9c176]/15 text-[#e9c176]'
                }`}
              >
                {bracket.semifinal1.isConfirmed && bracket.semifinal2.isConfirmed
                  ? 'Asignados en BD'
                  : 'Pendiente de Aplicar'}
              </Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#e9c176] uppercase block">
                    Semifinal 1 (1º vs 4º)
                  </span>
                  <span className="font-anybody font-bold text-white uppercase">
                    {top1?.teamName || '1º'} vs {top4?.teamName || '4º'}
                  </span>
                </div>
                <Badge variant="outline" className="text-[8px] border-white/10 text-[#c5c6cd]">
                  {sf1Match ? 'Partido vinculado' : 'Se creará en BD'}
                </Badge>
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#e9c176] uppercase block">
                    Semifinal 2 (2º vs 3º)
                  </span>
                  <span className="font-anybody font-bold text-white uppercase">
                    {top2?.teamName || '2º'} vs {top3?.teamName || '3º'}
                  </span>
                </div>
                <Badge variant="outline" className="text-[8px] border-white/10 text-[#c5c6cd]">
                  {sf2Match ? 'Partido vinculado' : 'Se creará en BD'}
                </Badge>
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerateSemifinals}
            disabled={loading || !hasEnoughTeams}
            className="w-full bg-[#e9c176] hover:bg-[#ffdea5] text-black font-anybody font-black uppercase tracking-wider italic h-12 rounded-xl shadow-lg shadow-[#e9c176]/10 gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Swords className="w-4 h-4" />
            )}
            {bracket.semifinal1.isConfirmed ? 'Actualizar Cruces de Semifinales' : 'Generar Cruces en Base de Datos'}
          </Button>
        </div>

        {/* Step 2: Gran Final */}
        <div className="glass-panel rounded-xl p-5 border-[#e9c176]/30 bg-[#0a192f]/40 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#e9c176]/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#e9c176] text-black font-black text-xs flex items-center justify-center font-anybody">
                  2
                </span>
                <h4 className="font-anybody text-sm font-bold text-white uppercase tracking-wider">
                  Definición de la Gran Final
                </h4>
              </div>
              <Badge
                className={`text-[8px] font-black uppercase ${
                  bracket.finalMatch.isConfirmed
                    ? 'bg-[#4ade80]/15 text-[#4ade80]'
                    : canGenerateFinalWithTieBreaker
                    ? 'bg-[#38bdf8]/15 text-[#38bdf8]'
                    : 'bg-white/10 text-[#c5c6cd]'
                }`}
              >
                {bracket.finalMatch.isConfirmed
                  ? 'Finalista Confirmados'
                  : canGenerateFinalWithTieBreaker
                  ? 'Listos para Asignar'
                  : 'Esperando SF'}
              </Badge>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#e9c176] uppercase">Ganador SF 1:</span>
                  <span className="font-anybody font-bold text-white uppercase">
                    {sf1WinnerTeam?.name || bracket.semifinal1.winnerTeamName || 'Pendiente de resultado'}
                  </span>
                </div>
                {bracket.semifinal1.isTie && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                    <span className="text-[#fbbf24] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Empate en SF1:
                    </span>
                    <select
                      value={tieTieSF1Winner}
                      onChange={(e) => setTieSF1Winner(e.target.value)}
                      className="bg-[#111415] border border-[#e9c176]/30 text-white rounded px-2 py-0.5 text-xs font-anybody uppercase"
                    >
                      <option value="">Seleccionar Ganador (Penales)</option>
                      {bracket.semifinal1.homeTeamId && (
                        <option value={bracket.semifinal1.homeTeamId}>
                          {bracket.semifinal1.homeTeamName}
                        </option>
                      )}
                      {bracket.semifinal1.awayTeamId && (
                        <option value={bracket.semifinal1.awayTeamId}>
                          {bracket.semifinal1.awayTeamName}
                        </option>
                      )}
                    </select>
                  </div>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#e9c176] uppercase">Ganador SF 2:</span>
                  <span className="font-anybody font-bold text-white uppercase">
                    {sf2WinnerTeam?.name || bracket.semifinal2.winnerTeamName || 'Pendiente de resultado'}
                  </span>
                </div>
                {bracket.semifinal2.isTie && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
                    <span className="text-[#fbbf24] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Empate en SF2:
                    </span>
                    <select
                      value={tieTieSF2Winner}
                      onChange={(e) => setTieSF2Winner(e.target.value)}
                      className="bg-[#111415] border border-[#e9c176]/30 text-white rounded px-2 py-0.5 text-xs font-anybody uppercase"
                    >
                      <option value="">Seleccionar Ganador (Penales)</option>
                      {bracket.semifinal2.homeTeamId && (
                        <option value={bracket.semifinal2.homeTeamId}>
                          {bracket.semifinal2.homeTeamName}
                        </option>
                      )}
                      {bracket.semifinal2.awayTeamId && (
                        <option value={bracket.semifinal2.awayTeamId}>
                          {bracket.semifinal2.awayTeamName}
                        </option>
                      )}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerateFinal}
            disabled={loading || !canGenerateFinalWithTieBreaker}
            className="w-full bg-gradient-to-r from-[#e9c176] to-[#f59e0b] hover:from-[#ffdea5] hover:to-[#fbbf24] text-black font-anybody font-black uppercase tracking-wider italic h-12 rounded-xl shadow-lg shadow-[#e9c176]/10 gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trophy className="w-4 h-4" />
            )}
            Asignar Finalistas a la Gran Final
          </Button>
        </div>
      </div>

      {/* Visual Bracket Preview in Admin */}
      <div className="space-y-4 pt-4 border-t border-[#e9c176]/20">
        <h4 className="font-anybody text-sm font-bold text-[#e9c176] uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#e9c176]" />
          Vista Previa del Cuadro (Como se ve en la web)
        </h4>
        <PlayoffBracket bracket={bracket} showAdminHints={true} />
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent className="bg-[#191c1d] border border-[#e9c176]/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-anybody uppercase text-[#e9c176]">
              ¿Restablecer cruces a placeholders?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#c5c6cd] text-xs">
              Esta acción revertirá los equipos de los partidos de semifinales y final a los nombres comodín (1RO, 4TO, 2DO, 3ERO, FINALISTA 1, FINALISTA 2) y restablecerá sus marcadores a pendientes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/10 hover:bg-white/20 text-white border-none">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevertToPlaceholders}
              className="bg-red-600 hover:bg-red-700 text-white font-anybody font-bold uppercase"
            >
              Sí, Restablecer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
