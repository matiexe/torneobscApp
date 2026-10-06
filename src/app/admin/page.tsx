'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Match, Team, calculateStandings, StandingEntry } from '@/lib/standings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Settings, Trophy, Image as ImageIcon, Users, Plus, LogOut, LayoutDashboard, Flag, Share2, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { MatchScoreForm } from '@/components/shared/MatchScoreForm';
import { TeamEditForm } from '@/components/shared/TeamEditForm';
import { PlayerAddForm } from '@/components/shared/PlayerAddForm';
import { AdminPlayoffManager } from '@/components/shared/AdminPlayoffManager';
import { useRouter } from 'next/navigation';
import { getTeamLogo } from '@/lib/utils';
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
} from "@/components/ui/alert-dialog";

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
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'matches' | 'playoffs' | 'teams' | 'players'>('matches');
  const [matchFilter, setMatchFilter] = useState<'all' | 'pending' | 'finished'>('all');
  const [showPlayerAdd, setShowPlayerAdd] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, name: string, type: 'player' | 'team' | 'match' } | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: mData, error: mError } = await supabase
        .from('matches')
        .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*)')
        .order('match_date', { ascending: true });
      
      const { data: pData, error: pError } = await supabase
        .from('players')
        .select('id, name, goals, team_id, team:teams(name)')
        .order('goals', { ascending: false });

      const { data: tData, error: tError } = await supabase.from('teams').select('*').order('name');

      if (mError) throw mError;
      if (pError) throw pError;
      if (tError) throw tError;

      if (mData) setMatches(mData);
      if (pData) setPlayers(pData as unknown as Player[]);
      if (tData) {
        setAllTeams(tData);
        const regular = tData.filter((t: any) => !['1RO', '4TO', '2DO', '3ERO', 'FINALISTA 1', 'FINALISTA 2'].includes(t.name));
        setTeams(regular);
        if (mData) {
          setStandings(calculateStandings(regular, mData));
        }
      }
    } catch (error) {
      toast.error("Error al cargar los datos de la liga");
    } finally {
      setLoading(false);
    }
  }

  async function updateScore(matchId: string, homeScore: number, awayScore: number, streamUrl?: string, statusOverride?: 'pending' | 'finished') {
    const updateData: any = { stream_url: streamUrl };
    
    if (statusOverride === 'pending') {
      updateData.home_score = null;
      updateData.away_score = null;
      updateData.status = 'pending';
    } else if (!isNaN(homeScore) && !isNaN(awayScore)) {
      updateData.home_score = homeScore;
      updateData.away_score = awayScore;
      updateData.status = 'finished';
    }

    try {
      const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId);

      if (error) throw error;
      toast.success(statusOverride === 'pending' ? "Partido reestablecido a pendiente" : "Marcador guardado / modificado correctamente");
      fetchData();
    } catch (error) {
      toast.error("Error al actualizar el marcador");
    }
  }

  async function updatePlayerGoals(playerId: string, goals: number) {
    try {
      const { error } = await supabase
        .from('players')
        .update({ goals: goals })
        .eq('id', playerId);

      if (error) throw error;
      toast.success("Goles actualizados");
      fetchData();
    } catch (error) {
      toast.error("Error al actualizar goles");
    }
  }

  const handleDeleteRequest = (id: string, name: string, type: 'player' | 'team' | 'match') => {
    setDeleteTarget({ id, name, type });
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    const targetId = deleteTarget.id.trim();
    const targetType = deleteTarget.type;
    
    setDeletingId(targetId);
    setDeleteConfirmOpen(false);

    try {
      let table = '';
      if (targetType === 'player') table = 'players';
      else if (targetType === 'team') table = 'teams';
      else if (targetType === 'match') table = 'matches';

      const { data, error } = await supabase
        .from(table)
        .delete()
        .eq('id', targetId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("Permiso denegado por la base de datos (RLS). Tu usuario está conectado pero no tiene permiso de escritura real.");
      }
      
      toast.success(`${targetType === 'player' ? 'Jugador' : targetType === 'team' ? 'Equipo' : 'Partido'} eliminado correctamente`);
      
      if (targetType === 'player') setPlayers(prev => prev.filter(p => p.id !== targetId));
      if (targetType === 'team') setTeams(prev => prev.filter(t => t.id !== targetId));
      if (targetType === 'match') setMatches(prev => prev.filter(m => m.id !== targetId));
      
      await fetchData();
    } catch (error: any) {
      toast.error(`No se pudo eliminar: ${error.message}`);
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

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
            onClick={() => fetchData()}
            className="text-[#c5c6cd] hover:text-[#e9c176] transition-colors p-2"
            title="Refrescar Datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
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
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <button 
              onClick={() => setActiveSubTab('matches')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'matches' ? 'bg-[#e9c176] text-black' : 'bg-white/5 text-[#c5c6cd]'}`}
            >
              Partidos
            </button>
            <button 
              onClick={() => setActiveSubTab('playoffs')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${activeSubTab === 'playoffs' ? 'bg-[#e9c176] text-black' : 'bg-white/5 text-[#c5c6cd]'}`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Cruces / Playoffs
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

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Button 
            className="bg-gradient-to-r from-[#604403]/80 to-[#e9c176]/30 border border-[#e9c176]/40 hover:scale-[1.02] transition-transform text-[#e9c176] font-anybody font-black uppercase italic tracking-tighter h-16 rounded-xl shadow-xl gap-3"
            onClick={() => setActiveSubTab('playoffs')}
          >
            <Trophy className="w-5 h-5 text-[#e9c176]" />
            Cruces Semifinales (1º vs 3º)
          </Button>
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
                  toast.success('Enlace del banner copiado al portapapeles');
                }
              } catch (err) {
                // Silently handle share errors
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between metallic-border-bottom pb-4 gap-4">
                <h3 className="font-anybody text-lg font-bold text-[#e9c176] flex items-center gap-2 uppercase tracking-wider">
                  <Trophy className="w-5 h-5" /> Gestión y Modificación de Partidos
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMatchFilter('all')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      matchFilter === 'all' ? 'bg-[#e9c176] text-black font-black' : 'bg-white/5 text-[#c5c6cd] hover:bg-white/10'
                    }`}
                  >
                    Todos ({matches.length})
                  </button>
                  <button
                    onClick={() => setMatchFilter('pending')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      matchFilter === 'pending' ? 'bg-[#e9c176] text-black font-black' : 'bg-white/5 text-[#c5c6cd] hover:bg-white/10'
                    }`}
                  >
                    Pendientes ({matches.filter(m => m.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setMatchFilter('finished')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      matchFilter === 'finished' ? 'bg-[#e9c176] text-black font-black' : 'bg-white/5 text-[#c5c6cd] hover:bg-white/10'
                    }`}
                  >
                    Finalizados ({matches.filter(m => m.status === 'finished').length})
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches
                  .filter(m => matchFilter === 'all' ? true : m.status === matchFilter)
                  .map(match => (
                    <MatchScoreForm 
                      key={match.id} 
                      match={match} 
                      onSave={updateScore} 
                      onDelete={async (id) => handleDeleteRequest(id, `${match.home_team?.name} vs ${match.away_team?.name}`, 'match')} 
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'playoffs' && (
          <AdminPlayoffManager
            standings={standings}
            teams={teams}
            matches={matches}
            allTeams={allTeams}
            onRefresh={fetchData}
          />
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
                <TeamEditForm 
                  key={team.id} 
                  team={team} 
                  onSave={fetchData} 
                  onDelete={async (id) => handleDeleteRequest(id, team.name, 'team')} 
                />
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
              {players.map((player) => (
                <div key={player.id} className="flex items-center justify-between gap-4 p-4 hover:bg-[#e9c176]/5 transition-colors">
                  <div className="flex items-center gap-3 flex-1 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg border border-[#44474d]/30 bg-[#ffffff0d] p-1 flex items-center justify-center overflow-hidden shrink-0">
                      <img src={getTeamLogo(player.team?.name)} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-anybody font-bold text-white uppercase italic text-sm truncate">{player.name}</p>
                      <p className="font-lexend text-[9px] font-bold text-[#c5c6cd] uppercase tracking-wider truncate">{player.team?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                       <span className="text-[8px] font-bold text-[#e9c176]/50 uppercase">Goles</span>
                       <input 
                        type="number" 
                        className="w-14 h-10 bg-[#0c0f10] border border-[#e9c176]/20 text-[#e9c176] text-center font-anybody font-black text-lg rounded-lg focus:outline-none focus:border-[#e9c176] transition-colors"
                        defaultValue={player.goals}
                        onBlur={(e) => updatePlayerGoals(player.id, parseInt(e.target.value))}
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:bg-red-500/20 hover:text-red-400 h-10 w-10 transition-colors mt-4"
                      onClick={() => handleDeleteRequest(player.id, player.name, 'player')}
                      disabled={deletingId === player.id}
                      title="Eliminar Jugador"
                    >
                      {deletingId === player.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Global Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-[#1d2021] border border-[#e9c176]/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-anybody text-[#e9c176] uppercase italic">¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#c5c6cd] text-xs">
              Estás a punto de eliminar a <span className="text-white font-bold">"{deleteTarget?.name}"</span>. 
              Esta acción es permanente y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white rounded-lg text-[10px] font-bold uppercase">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 text-white hover:bg-red-700 rounded-lg text-[10px] font-bold uppercase"
            >
              {deletingId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Eliminar Permanentemente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
