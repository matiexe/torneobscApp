'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Match } from '@/lib/standings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';

interface MatchScoreFormProps {
  match: Match;
  onSave: (id: string, h: number, a: number) => Promise<void>;
}

export function MatchScoreForm({ match, onSave }: MatchScoreFormProps) {
  const [h, setH] = useState(match.home_score?.toString() || '');
  const [a, setA] = useState(match.away_score?.toString() || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(match.id, parseInt(h), parseInt(a));
      setSuccess(true);
      setShowConfirm(false);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-panel rounded-xl p-5 border-l-4 border-l-[#e9c176] hover:bg-[#e9c176]/5 transition-all">
      <div className="flex justify-between items-center mb-6">
        <span className="font-lexend text-[10px] font-bold text-[#e9c176] uppercase tracking-[0.2em]">
          {new Date(match.match_date).toLocaleDateString()}
        </span>
        <Badge className={`border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ${
          match.status === 'finished' 
            ? 'bg-[#4ade80]/10 text-[#4ade80]' 
            : 'bg-[#e9c176]/10 text-[#e9c176] animate-pulse'
        }`}>
          {match.status === 'finished' ? 'Finalizado' : 'Pendiente'}
        </Badge>
      </div>
      
      <div className="grid grid-cols-7 items-center gap-2 mb-6">
        <div className="col-span-3 text-center">
          <p className="font-anybody text-[10px] font-black uppercase text-[#c5c6cd] mb-3 truncate">
            {match.home_team?.name}
          </p>
          <Input 
            type="number"
            className="bg-[#0c0f10] border-[#e9c176]/20 h-12 text-center font-anybody font-black text-2xl text-white rounded-xl focus:border-[#e9c176]" 
            value={h} 
            onChange={e => { setH(e.target.value); setShowConfirm(false); }} 
            placeholder="0"
          />
        </div>
        <div className="col-span-1 flex flex-col items-center">
          <span className="font-anybody font-black text-[#e9c176] italic text-xl mt-6 text-center">VS</span>
        </div>
        <div className="col-span-3 text-center">
          <p className="font-anybody text-[10px] font-black uppercase text-[#c5c6cd] mb-3 truncate">
            {match.away_team?.name}
          </p>
          <Input 
            type="number"
            className="bg-[#0c0f10] border-[#e9c176]/20 h-12 text-center font-anybody font-black text-2xl text-white rounded-xl focus:border-[#e9c176]" 
            value={a} 
            onChange={e => { setA(e.target.value); setShowConfirm(false); }} 
            placeholder="0"
          />
        </div>
      </div>
      
      {showConfirm ? (
        <div className="flex gap-2 animate-in fade-in zoom-in-95 duration-200">
          <Button 
            className="flex-1 font-anybody font-black uppercase italic text-[10px] h-11 rounded-lg bg-[#4ade80] text-black hover:bg-[#22c55e]"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
          </Button>
          <Button 
            className="flex-1 font-anybody font-black uppercase italic text-[10px] h-11 rounded-lg bg-white/5 text-[#c5c6cd] hover:bg-white/10"
            onClick={() => setShowConfirm(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
        </div>
      ) : (
        <Button 
          className={`w-full font-anybody font-black uppercase italic text-xs h-11 rounded-lg transition-all border ${
            success 
              ? 'bg-[#4ade80] text-black border-[#4ade80]' 
              : 'bg-white/5 hover:bg-[#e9c176] hover:text-[#412d00] text-white border-[#e9c176]/20'
          }`}
          onClick={() => setShowConfirm(true)}
          disabled={saving || h === '' || a === ''}
        >
          {success ? <Check className="w-4 h-4" /> : 'Guardar Marcador'}
        </Button>
      )}
    </div>
  );
}
