'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('El correo electrónico no ha sido verificado en Supabase. Por favor, ve al Dashboard de Supabase y marca al usuario como "Confirmed".');
        }
        throw error;
      }
      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111415] flex items-center justify-center p-4 stadium-bg">
      <Card className="w-full max-w-md bg-[#1d2021]/80 backdrop-blur-xl border-[#e9c176]/30 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-[#604403]/30 rounded-full flex items-center justify-center border border-[#e9c176]/40 mb-4">
            <ShieldAlert className="text-[#e9c176] w-6 h-6" />
          </div>
          <CardTitle className="font-anybody text-2xl font-bold text-[#e9c176] uppercase italic">Acceso Administrativo</CardTitle>
          <CardDescription className="text-[#c5c6cd]">Ingresa tus credenciales para gestionar el torneo.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-[#e9c176] tracking-widest ml-1">Email</label>
              <Input 
                type="email" 
                placeholder="admin@torneobsc.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#111415] border-[#44474d] text-white focus:border-[#e9c176] transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-[#e9c176] tracking-widest ml-1">Contraseña</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#111415] border-[#44474d] text-white focus:border-[#e9c176] transition-colors"
              />
            </div>
            {error && (
              <p className="text-[#ffb4ab] text-xs font-bold bg-[#ffb4ab]/10 p-2 rounded border border-[#ffb4ab]/20">
                {error}
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#e9c176] hover:bg-[#d4ac5e] text-[#412d00] font-anybody font-bold uppercase py-6 rounded-xl shadow-lg shadow-[#e9c176]/10"
            >
              {loading ? 'Verificando...' : 'Entrar al Panel'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
