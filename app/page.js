'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) location.href = '/app.html';
    });
  }, []);

  async function entrar(e) {
    e.preventDefault();
    setErro('');
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) { setErro(error.message); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const role = profile?.role || 'apontador';
    localStorage.setItem('engecap_mo_sessao', JSON.stringify({ email: user.email, role }));
    location.href = role === 'apontador' ? '/app.html#lancamento' : '/app.html';
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <form onSubmit={entrar} style={{ width: 380, background: '#fff', border: '2px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
        <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 700, letterSpacing: 1 }}>ENGECAP · CONTROLE DE M.O.</p>
        <h1 style={{ margin: '6px 0 8px' }}>Entrar</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Mesmos perfis do Diário: admin, engenheiro, apontador.</p>
        <label style={{ fontSize: 12, color: '#64748b' }}>E-mail</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} style={{ width: '100%', padding: 10, margin: '6px 0 12px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
        <label style={{ fontSize: 12, color: '#64748b' }}>Senha</label>
        <input type="password" value={senha} onChange={e=>setSenha(e.target.value)} style={{ width: '100%', padding: 10, margin: '6px 0 16px', borderRadius: 8, border: '1px solid #cbd5e1' }} />
        <button type="submit" style={{ width: '100%', padding: 12, background: '#1e293b', color: '#fff', border: 0, borderRadius: 8, fontWeight: 600 }}>Entrar</button>
        {erro && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 12 }}>{erro}</p>}
        <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 16 }}>Depois do login, admin sobe o CSV em /admin/csv</p>
      </form>
    </main>
  );
}
