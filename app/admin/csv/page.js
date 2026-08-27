'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

function parseCsv(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const out = [];
  lines.forEach((ln, i) => {
    if (i === 0 && /chapa/i.test(ln) && /nome/i.test(ln)) return;
    const parts = ln.split(/[;,]/).map(s => s.trim());
    if (parts.length < 3) return;
    const [chapa, nome, funcao] = parts;
    if (!chapa) return;
    out.push({ chapa, nome, funcao });
  });
  return out;
}

export default function CsvPage() {
  const [msg, setMsg] = useState('');
  const [lista, setLista] = useState([]);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { location.href = '/'; return; }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (!['admin', 'engenheiro'].includes(profile?.role)) {
        setMsg('Só admin ou engenheiro sobe CSV.');
        return;
      }
      setOk(true);
      const { data } = await supabase.from('funcionarios').select('*').order('funcao').order('nome');
      setLista(data || []);
    })();
  }, []);

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const rows = parseCsv(text);
    if (!rows.length) { setMsg('CSV vazio ou formato errado. Use chapa;nome;funcao'); return; }
    const { error } = await supabase.from('funcionarios').upsert(rows, { onConflict: 'chapa' });
    if (error) { setMsg(error.message); return; }
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('csv_uploads').insert({ uploaded_by: user.id, filename: file.name, rows_ok: rows.length });
    setMsg(rows.length + ' linhas gravadas/atualizadas.');
    const { data } = await supabase.from('funcionarios').select('*').order('funcao').order('nome');
    setLista(data || []);
  }

  if (!ok && !msg) return <p style={{ padding: 40 }}>Checando acesso...</p>;

  return (
    <main style={{ maxWidth: 800, margin: '40px auto', padding: 24 }}>
      <a href="/app.html" style={{ fontSize: 13 }}>← voltar ao sistema</a>
      <h1>CSV de funcionários</h1>
      <p style={{ color: '#64748b' }}>Mesmo formato do Diário: <code>chapa;nome;funcao</code></p>
      {ok && <input type="file" accept=".csv,text/csv" onChange={onFile} />}
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
      <h2 style={{ marginTop: 32, fontSize: 16 }}>{lista.length} funcionários no banco</h2>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
        {lista.map(f => (
          <div key={f.id} style={{ display: 'flex', gap: 12, padding: '8px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
            <b style={{ width: 80 }}>{f.chapa}</b>
            <span style={{ flex: 1 }}>{f.nome}</span>
            <span style={{ color: '#64748b' }}>{f.funcao}</span>
          </div>
        ))}
      </div>
    </main>
  );
}
