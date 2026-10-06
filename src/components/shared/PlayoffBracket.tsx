'use client';

import { PlayoffBracket as PlayoffBracketType, PlayoffMatchView } from '@/lib/playoffs';
import { getTeamLogo } from '@/lib/utils';
import { Trophy, Swords, Sparkles, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PlayoffBracketProps {
  bracket: PlayoffBracketType;
  onSelectMatch?: (match: PlayoffMatchView) => void;
  showAdminHints?: boolean;
}

function MatchCardBracket({
  matchView,
  onSelect,
}: {
  matchView: PlayoffMatchView;
  onSelect?: () => void;
}) {
  const isFinished = matchView.status === 'finished';
  const hasScores = matchView.homeScore !== null && matchView.awayScore !== null;
  const homeIsWinner =
    isFinished &&
    hasScores &&
    matchView.homeScore! > matchView.awayScore!;
  const awayIsWinner =
    isFinished &&
    hasScores &&
    matchView.awayScore! > matchView.homeScore!;

  return (
    <div
      onClick={onSelect}
      className={`glass-panel rounded-xl p-4 border transition-all ${
        onSelect ? 'cursor-pointer hover:border-[#e9c176]' : ''
      } ${
        matchView.stage === 'final'
          ? 'border-[#e9c176]/50 bg-gradient-to-b from-[#604403]/20 to-[#0a192f]/60 shadow-[0_0_20px_rgba(233,193,118,0.1)]'
          : 'border-[#e9c176]/20'
      }`}
    >
      {/* Top Header of the match card */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#e9c176]/10 text-[10px]">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[#e9c176]">
          {matchView.stage === 'final' ? (
            <Trophy className="w-3.5 h-3.5 text-[#e9c176]" />
          ) : (
            <Swords className="w-3.5 h-3.5 text-[#e9c176]" />
          )}
          <span>{matchView.title}</span>
        </div>

        <Badge
          className={`border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ${
            isFinished
              ? 'bg-[#4ade80]/15 text-[#4ade80]'
              : matchView.isProjected
              ? 'bg-[#38bdf8]/15 text-[#38bdf8]'
              : 'bg-[#e9c176]/15 text-[#e9c176]'
          }`}
        >
          {isFinished
            ? 'Finalizado'
            : matchView.isProjected
            ? 'Proyectado'
            : 'Confirmado'}
        </Badge>
      </div>

      {/* Teams and Scores */}
      <div className="space-y-2">
        {/* Home Team */}
        <div
          className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
            homeIsWinner
              ? 'bg-[#e9c176]/15 border border-[#e9c176]/30 font-bold'
              : 'bg-black/30'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-[9px] font-lexend text-[#c5c6cd]/70 w-5 text-center shrink-0">
              {matchView.stage === 'final' ? 'F1' : matchView.seedHomeLabel.split(' ')[0]}
            </span>
            <img
              src={getTeamLogo(matchView.homeTeamName)}
              alt=""
              className="w-5 h-5 object-contain shrink-0"
            />
            <span
              className={`font-anybody text-xs uppercase truncate ${
                homeIsWinner ? 'text-[#e9c176] font-bold' : 'text-white'
              }`}
            >
              {matchView.homeTeamName}
            </span>
          </div>
          <span
            className={`font-anybody font-black text-sm px-2 ${
              hasScores ? 'text-white' : 'text-[#c5c6cd]/30'
            }`}
          >
            {matchView.homeScore !== null ? matchView.homeScore : '-'}
          </span>
        </div>

        {/* Away Team */}
        <div
          className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
            awayIsWinner
              ? 'bg-[#e9c176]/15 border border-[#e9c176]/30 font-bold'
              : 'bg-black/30'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-[9px] font-lexend text-[#c5c6cd]/70 w-5 text-center shrink-0">
              {matchView.stage === 'final' ? 'F2' : matchView.seedAwayLabel.split(' ')[0]}
            </span>
            <img
              src={getTeamLogo(matchView.awayTeamName)}
              alt=""
              className="w-5 h-5 object-contain shrink-0"
            />
            <span
              className={`font-anybody text-xs uppercase truncate ${
                awayIsWinner ? 'text-[#e9c176] font-bold' : 'text-white'
              }`}
            >
              {matchView.awayTeamName}
            </span>
          </div>
          <span
            className={`font-anybody font-black text-sm px-2 ${
              hasScores ? 'text-white' : 'text-[#c5c6cd]/30'
            }`}
          >
            {matchView.awayScore !== null ? matchView.awayScore : '-'}
          </span>
        </div>
      </div>

      {/* Match Date / Venue */}
      <div className="mt-3 pt-2 border-t border-[#e9c176]/10 flex items-center justify-between text-[9px] text-[#c5c6cd]/70">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-[#e9c176]" />
          <span>
            {matchView.matchDate
              ? new Date(matchView.matchDate).toLocaleDateString()
              : 'Fecha a confirmar'}
          </span>
        </div>
        <span>21:00 HRS • La Curtiembre</span>
      </div>
    </div>
  );
}

export function PlayoffBracket({
  bracket,
  onSelectMatch,
  showAdminHints = false,
}: PlayoffBracketProps) {
  const { semifinal1, semifinal2, finalMatch, champion } = bracket;

  return (
    <div className="space-y-6">
      {/* Champion Banner if decided */}
      {champion && (
        <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#604403] via-[#e9c176]/30 to-[#604403] border-2 border-[#e9c176] shadow-[0_0_30px_rgba(233,193,118,0.3)] animate-in zoom-in-95 duration-500 text-center">
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-16 h-16 rounded-full bg-black/40 border-2 border-[#e9c176] flex items-center justify-center p-3 shadow-xl mb-1">
              <img
                src={getTeamLogo(champion.teamName)}
                alt={champion.teamName}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#e9c176] animate-pulse" />
              <span className="font-lexend text-xs font-black uppercase tracking-[0.3em] text-[#e9c176]">
                CAMPEÓN OFICIAL BSC 2026
              </span>
              <Sparkles className="w-5 h-5 text-[#e9c176] animate-pulse" />
            </div>
            <h3 className="font-anybody text-3xl md:text-5xl font-black gold-gradient-text uppercase italic tracking-wider">
              {champion.teamName}
            </h3>
          </div>
        </div>
      )}

      {/* Bracket Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Semifinals */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-[#e9c176]/20">
            <h4 className="font-anybody text-sm font-bold text-[#e9c176] uppercase tracking-wider flex items-center gap-2">
              <Swords className="w-4 h-4" /> Semifinales
            </h4>
            <span className="text-[10px] text-[#c5c6cd]">1º vs 4º & 2º vs 3º</span>
          </div>

          <div className="space-y-4">
            <MatchCardBracket
              matchView={semifinal1}
              onSelect={onSelectMatch ? () => onSelectMatch(semifinal1) : undefined}
            />
            <MatchCardBracket
              matchView={semifinal2}
              onSelect={onSelectMatch ? () => onSelectMatch(semifinal2) : undefined}
            />
          </div>
        </div>

        {/* Right Column: Gran Final */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-[#e9c176]/20">
            <h4 className="font-anybody text-sm font-bold text-[#e9c176] uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#e9c176]" /> Gran Final
            </h4>
            <span className="text-[10px] text-[#e9c176] font-bold">Por el Título</span>
          </div>

          <MatchCardBracket
            matchView={finalMatch}
            onSelect={onSelectMatch ? () => onSelectMatch(finalMatch) : undefined}
          />

          {/* Path explanation card */}
          <div className="glass-panel rounded-xl p-3 border-[#e9c176]/10 text-[10px] text-[#c5c6cd] space-y-1">
            <p className="flex items-center gap-1.5 font-bold text-white uppercase">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#e9c176]" />
              Formato de Definición:
            </p>
            <p>
              • Semifinal 1: <strong>1º Puesto</strong> vs <strong>4º Puesto</strong>
            </p>
            <p>
              • Semifinal 2: <strong>2º Puesto</strong> vs <strong>3º Puesto</strong>
            </p>
            <p>
              • Gran Final: <strong>Ganador SF 1</strong> vs <strong>Ganador SF 2</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
