'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Team } from '@/lib/standings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Loader2, Plus, UserPlus } from 'lucide-react';

interface PlayerAddFormProps {
  teams: Team[];
  onSave: () => Promise<void>;
}

export function PlayerAddForm({ teams, onSave }: PlayerAddFormProps) {
  const [name, setName] = useState('');
  const [teamId, setTeamId] = useState('');
  const [goals, setGoals] = useState(0);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAdd = async () => {
    if (!name || !teamId) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('players')
        .insert([{ name, team_id: teamId, goals }]);

      if (error) throw error;
      
      await onSave();
      setSuccess(true);
      setName('');
      setTeamId('');
      setGoals(0);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error(error);
      alert('Error al agregar el jugador');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-6 border border-[#e9c176]/30 bg-[#1d2021]/50 backdrop-blur-md mb-8 animate-in slide-in-from-top duration-300">
      <h3 className="font-anybody text-[#e9c176] font-bold uppercase text-sm mb-6 flex items-center gap-2 italic">
        <UserPlus className="w-4 h-4" /> Registrar Nuevo Jugador
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        <div className="md:col-span-5">
          <label className="text-[10px] font-bold uppercase text-[#e9c176] tracking-widest ml-1 mb-2 block">Nombre del Jugador</label>
          <Input 
            className="bg-[#0c0f10] border-[#e9c176]/20 h-12 text-white rounded-xl focus:border-[#e9c176] transition-all" 
            placeholder="Ej: Gasperin"
            value={name} 
            onChange={e => setName(e.target.value)} 
          />
        </div>
        
        <div className="md:col-span-4">
          <label className="text-[10px] font-bold uppercase text-[#e9c176] tracking-widest ml-1 mb-2 block">Equipo</label>
          <Select value={teamId} onValueChange={setTeamId}>
            <SelectTrigger className="bg-[#0c0f10] border-[#e9c176]/20 h-12 text-white rounded-xl focus:ring-[#e9c176] focus:border-[#e9c176]">
              <SelectValue placeholder="Seleccionar equipo" />
            </SelectTrigger>
            <SelectContent className="bg-[#1d2021] border-[#e9c176]/20 text-white">
              {teams.map(team => (
                <SelectItem key={team.id} value={team.id} className="focus:bg-[#e9c176] focus:text-black">
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-3">
          <label className="text-[10px] font-bold uppercase text-[#e9c176] tracking-widest ml-1 mb-2 block">Goles Iniciales</label>
          <div className="flex gap-2">
            <Input 
              type="number"
              className="bg-[#0c0f10] border-[#e9c176]/20 h-12 text-white text-center font-bold rounded-xl focus:border-[#e9c176] transition-all flex-1" 
              value={goals} 
              onChange={e => setGoals(parseInt(e.target.value) || 0)} 
            />
            <Button 
              className={`h-12 px-6 rounded-xl transition-all border text-[10px] font-black uppercase italic ${
                success 
                  ? 'bg-[#4ade80] text-black border-[#4ade80]' 
                  : 'bg-[#e9c176] hover:bg-[#d4ac5e] text-[#412d00] border-transparent shadow-lg shadow-[#e9c176]/10'
              }`}
              onClick={handleAdd}
              disabled={saving || !name || !teamId}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : success ? <Check className="w-4 h-4" /> : (
                <>
                  <Plus className="w-4 h-4 mr-2" /> Agregar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
