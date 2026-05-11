'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Team } from '@/lib/standings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Loader2, Save } from 'lucide-react';

interface TeamEditFormProps {
  team: Team;
  onSave: () => Promise<void>;
}

export function TeamEditForm({ team, onSave }: TeamEditFormProps) {
  const [name, setName] = useState(team.name);
  const [logoUrl, setLogoUrl] = useState(team.logo_url || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('teams')
        .update({ name, logo_url: logoUrl })
        .eq('id', team.id);

      if (error) throw error;
      
      await onSave();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error(error);
      alert('Error al guardar el equipo');
    } finally {
      setSaving(false);
    }
  };

  const getTeamLogo = (teamName: string | undefined) => {
    if (!teamName) return null;
    const slug = teamName.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/ñ/g, 'n');
    return `/logos/${slug}.png`;
  };

  return (
    <div className="glass-panel rounded-xl p-4 border border-[#e9c176]/10 hover:bg-[#e9c176]/5 transition-all">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg border border-[#44474d]/30 bg-white/5 p-1 flex items-center justify-center overflow-hidden shrink-0">
          <img src={logoUrl || getTeamLogo(name) || ''} alt="" className="w-full h-full object-contain" />
        </div>
        <div className="flex-1">
          <label className="text-[9px] font-bold uppercase text-[#e9c176] tracking-widest ml-1">Nombre del Equipo</label>
          <Input 
            className="bg-[#0c0f10] border-[#e9c176]/20 h-9 text-sm text-white rounded-lg focus:border-[#e9c176]" 
            value={name} 
            onChange={e => setName(e.target.value)} 
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="text-[9px] font-bold uppercase text-[#e9c176] tracking-widest ml-1">URL del Logo (Opcional)</label>
        <Input 
          className="bg-[#0c0f10] border-[#e9c176]/20 h-9 text-[10px] text-white rounded-lg focus:border-[#e9c176]" 
          value={logoUrl} 
          onChange={e => setLogoUrl(e.target.value)} 
          placeholder="/logos/nombre_equipo.png"
        />
      </div>
      
      <Button 
        className={`w-full h-9 rounded-lg transition-all border text-[10px] font-black uppercase italic ${
          success 
            ? 'bg-[#4ade80] text-black border-[#4ade80]' 
            : 'bg-white/5 hover:bg-[#e9c176] hover:text-black border-[#e9c176]/20'
        }`}
        onClick={handleSave}
        disabled={saving || !name}
      >
        {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : success ? <Check className="w-3 h-3" /> : (
          <>
            <Save className="w-3 h-3 mr-2" /> Actualizar Equipo
          </>
        )}
      </Button>
    </div>
  );
}
