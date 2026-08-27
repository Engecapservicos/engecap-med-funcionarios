'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminHome() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { location.href = '/'; return; }
      const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (p?.role !== 'admin') { location.href = '/app.html'; return; }
      setOk(true);
    })();
  }, []);
  if (!ok) return <p style={{ padding: 40 }}>Checando admin...</p>;
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: 24 }}>
      <a href="/app.html" style={{ fontSize: 13 }}>← sistema</a>
      <h1>Admin</h1>
      <p style={{ color: '#64748b' }}>Acessos e CSV. Mesma lógica do Diário.</p>
      <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
        <a href="/admin/usuarios" style={card}>Criar / editar / excluir acessos</a>
        <a href="/admin/csv" style={card}>Subir CSV de funcionários + log</a>
      </div>
    </main>
  );
}
const card = {
  display: 'block',
  background: '#fff',
  border: '2px solid #e2e8f0',
  borderRadius: 12,
  padding: 16,
  color: '#0f172a',
  textDecoration: 'none',
  fontWeight: 600
};
