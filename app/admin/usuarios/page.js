'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function Usuarios() {
  const [lista, setLista] = useState([]);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState('apontador');
  const [msg, setMsg] = useState('');
  const [ok, setOk] = useState(false);

  async function load() {
    const r = await fetch('/api/admin/users');
    const j = await r.json();
    if (!r.ok) { setMsg(j.error || 'Falha ao listar'); return; }
    setLista(j.users || []);
  }

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { location.href = '/'; return; }
      const { data: p } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (p?.role !== 'admin') { setMsg('Só admin gerencia acesso.'); return; }
      setOk(true);
      load();
    })();
  }, []);

  async function criar(e) {
    e.preventDefault();
    setMsg('');
    const { data: { session } } = await supabase.auth.getSession();
    const r = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
      body: JSON.stringify({ email, senha, role })
    });
    const j = await r.json();
    if (!r.ok) { setMsg(j.error || 'Não criou'); return; }
    setEmail(''); setSenha('');
    setMsg('Usuário criado.');
    load();
  }

  async function salvar(u) {
    const { data: { session } } = await supabase.auth.getSession();
    const r = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token },
      body: JSON.stringify(u)
    });
    const j = await r.json();
    setMsg(r.ok ? 'Atualizado.' : (j.error || 'Falha'));
    load();
  }

  async function excluir(id) {
    if (!confirm('Excluir este acesso?')) return;
    const { data: { session } } = await supabase.auth.getSession();
    const r = await fetch('/api/admin/users?id=' + id, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + session.access_token }
    });
    const j = await r.json();
    setMsg(r.ok ? 'Excluído.' : (j.error || 'Falha'));
    load();
  }

  if (!ok) return <p style={{ padding: 40 }}>{msg || 'Checando...'}</p>;

  return (
    <main style={{ maxWidth: 860, margin: '40px auto', padding: 24 }}>
      <a href="/admin" style={{ fontSize: 13 }}>← admin</a>
      <h1>Acessos</h1>
      <form onSubmit={criar} style={{ background: '#fff', border: '2px solid #e2e8f0', borderRadius: 12, padding: 16, margin: '16px 0', display: 'grid', gap: 8 }}>
        <b>Novo usuário</b>
        <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} style={inp} />
        <input placeholder="senha" type="password" value={senha} onChange={e=>setSenha(e.target.value)} style={inp} />
        <select value={role} onChange={e=>setRole(e.target.value)} style={inp}>
          <option value="admin">admin</option>
          <option value="engenheiro">engenheiro</option>
          <option value="apontador">apontador</option>
        </select>
        <button type="submit" style={btn}>Criar acesso</button>
      </form>
      {msg && <p>{msg}</p>}
      <div style={{ background: '#fff', border: '2px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        {lista.map(u => (
          <div key={u.id} style={{ padding: 12, borderBottom: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 160px 90px auto', gap: 8, alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{u.email}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{u.id.slice(0,8)}</div>
            </div>
            <select defaultValue={u.role} onChange={e => { u.role = e.target.value; }} id={'r-'+u.id} style={inp}>
              <option value="admin">admin</option>
              <option value="engenheiro">engenheiro</option>
              <option value="apontador">apontador</option>
            </select>
            <label style={{ fontSize: 12 }}>
              <input type="checkbox" defaultChecked={u.active} id={'a-'+u.id} /> ativo
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" onClick={() => salvar({
                id: u.id,
                role: document.getElementById('r-'+u.id).value,
                active: document.getElementById('a-'+u.id).checked
              })} style={btnSm}>Salvar</button>
              <button type="button" onClick={() => excluir(u.id)} style={{ ...btnSm, background: '#fff', color: '#b91c1c', border: '1px solid #fecaca' }}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

const inp = { padding: 8, border: '1px solid #cbd5e1', borderRadius: 8 };
const btn = { padding: 10, background: '#1e293b', color: '#fff', border: 0, borderRadius: 8, fontWeight: 600 };
const btnSm = { padding: '6px 10px', background: '#1e293b', color: '#fff', border: 0, borderRadius: 8, fontSize: 12 };
