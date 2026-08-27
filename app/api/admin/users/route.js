import { createClient } from '@supabase/supabase-js';

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function assertAdmin(req) {
  const token = (req.headers.get('authorization') || '').replace('Bearer ', '');
  if (!token) return null;
  const pub = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: { user } } = await pub.auth.getUser(token);
  if (!user) return null;
  const { data: p } = await admin().from('profiles').select('role').eq('id', user.id).single();
  if (p?.role !== 'admin') return null;
  return user;
}

export async function GET() {
  const { data, error } = await admin().from('profiles').select('id,email,role,active,created_at').order('created_at');
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ users: data });
}

export async function POST(req) {
  const me = await assertAdmin(req);
  if (!me) return Response.json({ error: 'Só admin' }, { status: 403 });
  const { email, senha, role } = await req.json();
  if (!email || !senha || !role) return Response.json({ error: 'email, senha e perfil' }, { status: 400 });
  const { data, error } = await admin().auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { role }
  });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  await admin().from('profiles').upsert({ id: data.user.id, email, role, active: true });
  return Response.json({ ok: true });
}

export async function PATCH(req) {
  const me = await assertAdmin(req);
  if (!me) return Response.json({ error: 'Só admin' }, { status: 403 });
  const { id, role, active, senha } = await req.json();
  if (role || typeof active !== 'undefined') {
    const patch = {};
    if (role) patch.role = role;
    if (typeof active !== 'undefined') patch.active = active;
    const { error } = await admin().from('profiles').update(patch).eq('id', id);
    if (error) return Response.json({ error: error.message }, { status: 400 });
  }
  if (senha) {
    const { error } = await admin().auth.admin.updateUserById(id, { password: senha });
    if (error) return Response.json({ error: error.message }, { status: 400 });
  }
  return Response.json({ ok: true });
}

export async function DELETE(req) {
  const me = await assertAdmin(req);
  if (!me) return Response.json({ error: 'Só admin' }, { status: 403 });
  const id = new URL(req.url).searchParams.get('id');
  const { error } = await admin().auth.admin.deleteUser(id);
  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ ok: true });
}
