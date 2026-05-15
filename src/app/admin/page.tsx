'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Match, Team } from '@/lib/standings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Settings, Trophy, Image as ImageIcon, Users, Plus, LogOut, LayoutDashboard, Flag, Share2, Trash2 } from 'lucide-react';
import { MatchScoreForm } from '@/components/shared/MatchScoreForm';
import { TeamEditForm } from '@/components/shared/TeamEditForm';
import { PlayerAddForm } from '@/components/shared/PlayerAddForm';
import { useRouter } from 'next/navigation';
import { getTeamLogo } from '@/lib/utils';

interface Player {
  id: string;
  name: string;
  goals: number;
  team_id: string;
  team?: { name: string };
}

export default function AdminPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'matches' | 'teams' | 'players'>('matches');
  const [showPlayerAdd, setShowPlayerAdd] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: mData } = await supabase
      .from('matches')
      .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
      .order('match_date', { ascending: true });
    
    const { data: pData } = await supabase
      .from('players')
      .select('id, name, goals, team:teams(name)')
      .order('goals', { ascending: false });

    const { data: tData } = await supabase.from('teams').select('*').order('name');

    if (mData) setMatches(mData);
    if (pData) setPlayers(pData as any);
    if (tData) setTeams(tData);
    setLoading(false);
  }

  async function updateScore(matchId: string, homeScore: number, awayScore: number, streamUrl?: string) {
    const { error } = await supabase
      .from('matches')
      .update({ 
        home_score: homeScore, 
        away_score: awayScore, 
        status: (homeScore !== null && awayScore !== null) ? 'finished' : 'pending',
        stream_url: streamUrl 
      })
      .eq('id', matchId);

    if (error) throw error;
    fetchData();
  }

  async function updatePlayerGoals(playerId: string, goals: number) {
    const { error } = await supabase
      .from('players')
      .update({ goals: goals })
      .eq('id', playerId);

    if (error) console.error(error);
    fetchData();
  }

  async function deletePlayer(playerId: string) {
    if (!confirm('¿Estás seguro de eliminar este jugador? Esta acción no se puede deshacer.')) return;
    
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId);

    if (error) {
      console.error(error);
      alert('Error al eliminar el jugador');
    } else {
      fetchData();
    }
  }

  async function deleteTeam(teamId: string) {
    if (!confirm('¿Estás seguro de eliminar este equipo? Se podrían ver afectados los partidos asociados.')) return;
    
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) {
      console.error(error);
      alert('Error al eliminar el equipo (Asegúrate de que no tenga partidos asociados)');
    } else {
      fetchData();
    }
  }

  async function deleteMatch(matchId: string) {
    if (!confirm('¿Estás seguro de eliminar este partido?')) return;
    
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId);

    if (error) {
      console.error(error);
      alert('Error al eliminar el partido');
    } else {
      fetchData();
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-screen bg-[#111415] text-[#e9c176]">
      <div className="w-12 h-12 border-2 border-[#e9c176]/20 border-t-[#e9c176] rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em]">Cargando Elite Admin...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#111415] text-[#e1e3e4] pb-20 stadium-bg font-inter">
      {/* Admin Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#111415]/80 backdrop-blur-xl border-b border-[#e9c176]/30 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#604403]/30 flex items-center justify-center border border-[#e9c176]/40 overflow-hidden p-1">
            <img 
              alt="BSC Logo" 
              className="w-full h-full object-contain" 
              src="/logos/league_logo.png" 
            />
          </div>
          <h1 className="font-anybody text-xl font-bold tracking-wider uppercase text-[#e9c176]">ELITE ADMIN</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/')}
            className="text-[#c5c6cd] hover:text-[#e9c176] transition-colors flex items-center gap-2 text-xs font-bold uppercase"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden md:inline">Ver Sitio</span>
          </button>
          <button 
            onClick={handleLogout}
            className="text-[#ffb4ab] hover:text-white transition-colors flex items-center gap-2 text-xs font-bold uppercase"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Salir</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto pt-24 px-4">
        {/* Welcome Section */}
        <section className="mb-8 relative overflow-hidden rounded-xl metallic-border p-8 text-center bg-[#191c1d]/50 backdrop-blur-md border-b-2 border-[#e9c176]">
          <h2 className="font-anybody text-4xl font-black gold-gradient-text uppercase mb-2 italic">Panel de Control</h2>
          <div className="flex justify-center gap-4 mt-4">
            <button 
              onClick={() => setActiveSubTab('matches')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'matches' ? 'bg-[#e9c176] text-black' : 'bg-white/5 text-[#c5c6cd]'}`}
            >
              Partidos
            </button>
            <button 
              onClick={() => setActiveSubTab('teams')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'teams' ? 'bg-[#e9c176] text-black' : 'bg-white/5 text-[#c5c6cd]'}`}
            >
              Equipos
            </button>
            <button 
              onClick={() => setActiveSubTab('players')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'players' ? 'bg-[#e9c176] text-black' : 'bg-white/5 text-[#c5c6cd]'}`}
            >
              Jugadores
            </button>
          </div>
        </section>

        {/* Quick Actions (Promoted to top) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <Button 
            className="bg-gradient-to-r from-[#e9c176] to-[#ffdea5] hover:scale-[1.02] transition-transform text-[#412d00] font-anybody font-black uppercase italic tracking-tighter h-16 rounded-xl shadow-xl shadow-[#e9c176]/10 gap-3" 
            onClick={() => {
              const nextMatch = matches.find(m => m.status === 'pending');
              if (nextMatch) {
                window.open(`/api/og?matchId=${nextMatch.id}`, '_blank');
              } else {
                window.open('/api/og', '_blank');
              }
            }}
          >
            <ImageIcon className="w-5 h-5" />
            Generar Historia Instagram
          </Button>

          <Button 
            className="bg-[#3b82f6] hover:bg-[#2563eb] hover:scale-[1.02] transition-transform text-white font-anybody font-black uppercase italic tracking-tighter h-16 rounded-xl shadow-xl shadow-[#3b82f6]/10 gap-3 border-none" 
            onClick={async () => {
              const nextMatch = matches.find(m => m.status === 'pending');
              const shareUrl = nextMatch 
                ? `${window.location.origin}/api/og?matchId=${nextMatch.id}`
                : `${window.location.origin}/api/og`;
              
              const shareData = {
                title: 'Súper Liga BSC - Próximo Partido',
                text: nextMatch 
                  ? `¡No te pierdas el próximo partido!\n⚽ ${nextMatch.home_team?.name} vs ${nextMatch.away_team?.name}\n🏟️ La Curtiembre`
                  : 'Sigue la Súper Liga BSC en vivo.',
                url: shareUrl,
              };

              try {
                if (navigator.share) {
                  await navigator.share(shareData);
                } else {
                  await navigator.clipboard.writeText(shareUrl);
                  alert('Enlace del banner copiado al portapapeles');
                }
              } catch (err) {
                console.error('Error al compartir:', err);
              }
            }}
          >
            <Share2 className="w-5 h-5" />
            Compartir Banner
          </Button>
        </section>

        {activeSubTab === 'matches' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-12 space-y-6">
              <div className="flex items-center justify-between metallic-border-bottom pb-2">
                <h3 className="font-anybody text-lg font-bold text-[#e9c176] flex items-center gap-2 uppercase tracking-wider">
                  <Trophy className="w-5 h-5" /> Gestión de Partidos
                </h3>
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-[#e9c176]/30 text-[#e9c176] text-[9px] uppercase">
                    {matches.filter(m => m.status === 'pending').length} Pendientes
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.filter(m => m.status === 'pending').map(match => (
                  <MatchScoreForm key={match.id} match={match} onSave={updateScore} onDelete={deleteMatch} />
                ))}
              </div>

              {matches.filter(m => m.status === 'finished').length > 0 && (
                <>
                  <h4 className="font-anybody text-sm font-bold text-[#c5c6cd] uppercase tracking-widest pt-4">Resultados Recientes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matches.filter(m => m.status === 'finished').slice(-4).map(match => (
                      <MatchScoreForm key={match.id} match={match} onSave={updateScore} onDelete={deleteMatch} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'teams' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between metallic-border-bottom pb-4 mb-6">
              <h3 className="font-anybody text-lg font-bold text-[#e9c176] flex items-center gap-2 uppercase tracking-wider">
                <Flag className="w-5 h-5" /> Gestión de Equipos
              </h3>
              <Button className="bg-[#e9c176]/10 text-[#e9c176] border border-[#e9c176]/20 hover:bg-[#e9c176] hover:text-black text-[10px] font-black uppercase">
                <Plus className="w-4 h-4 mr-2" /> Nuevo Equipo
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map(team => (
                <TeamEditForm key={team.id} team={team} onSave={fetchData} onDelete={deleteTeam} />
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'players' && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center justify-between metallic-border-bottom pb-4 mb-6">
              <h3 className="font-anybody text-lg font-bold text-[#e9c176] flex items-center gap-2 uppercase tracking-wider">
                <Users className="w-5 h-5" /> Tabla de Goleadores
              </h3>
              <Button 
                onClick={() => setShowPlayerAdd(!showPlayerAdd)}
                className={`${showPlayerAdd ? 'bg-white/10 text-white' : 'bg-[#e9c176]/10 text-[#e9c176]'} border border-[#e9c176]/20 hover:bg-[#e9c176] hover:text-black text-[10px] font-black uppercase transition-all`}
              >
                {showPlayerAdd ? 'Cerrar' : <><Plus className="w-4 h-4 mr-2" /> Nuevo Jugador</>}
              </Button>
            </div>

            {showPlayerAdd && (
              <PlayerAddForm 
                teams={teams} 
                onSave={async () => {
                  await fetchData();
                  setShowPlayerAdd(false);
                }} 
              />
            )}

            <div className="glass-panel rounded-xl overflow-hidden divide-y divide-[#44474d]/20">
              {players.map(player => (
                <div key={player.id} className="flex items-center justify-between gap-4 p-4 hover:bg-[#e9c176]/5 transition-colors">
                  <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg border border-[#44474d]/30 bg-white/5 p-1 flex items-center justify-center overflow-hidden shrink-0">
                      <img src={getTeamLogo(player.team?.name)} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-anybody font-bold text-white uppercase italic text-sm truncate">{player.name}</p>
                      <p className="font-lexend text-[9px] font-bold text-[#c5c6cd] uppercase tracking-wider truncate">{player.team?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="number" 
                      className="w-14 h-10 bg-[#0c0f10] border border-[#e9c176]/20 text-[#e9c176] text-center font-anybody font-black text-lg rounded-lg focus:outline-none focus:border-[#e9c176] transition-colors"
                      defaultValue={player.goals}
                      onBlur={(e) => updatePlayerGoals(player.id, parseInt(e.target.value))}
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-[#ffb4ab] hover:bg-[#ffb4ab]/10 hover:text-white h-10 w-10"
                      onClick={() => deletePlayer(player.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
