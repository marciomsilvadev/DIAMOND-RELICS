'use client';

import { getSupabase, isSupabaseConfigured, safeExecute } from './supabase';

export type UserRole = 'admin' | 'operator';

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  avatar?: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  loggedInAt: string;
}

const USERS_STORAGE_KEY = 'diamond_relics_users_v1';
const SESSION_STORAGE_KEY = 'diamond_relics_session_v1';

export const DEFAULT_USERS: AuthUser[] = [
  {
    id: 'usr-admin-marcio',
    name: 'Márcio Silva (Administrador)',
    username: 'marcio',
    email: 'marcio.msrs@hotmail.com',
    password: 'admin123',
    role: 'admin',
    department: 'Diretoria Executiva',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    active: true,
    createdAt: '2025-01-01T10:00:00.000Z',
  },
  {
    id: 'usr-admin-master',
    name: 'Roberto Silveira (Curador Chefe)',
    username: 'admin',
    email: 'admin@diamondrelics.com',
    password: 'admin123',
    role: 'admin',
    department: 'Diretoria & Curadoria Geral',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    active: true,
    createdAt: '2025-01-01T10:00:00.000Z',
  },
  {
    id: 'usr-operator-acervo',
    name: 'Carlos Mendes (Operações)',
    username: 'operador',
    email: 'operador@diamondrelics.com',
    password: 'operador123',
    role: 'operator',
    department: 'Operações & Logística Segura',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    active: true,
    createdAt: '2025-01-15T14:30:00.000Z',
  },
];

/**
 * Gera automaticamente uma sugestão de nome de usuário limpo e amigável
 * Ex: "Márcio Silva" -> "marcio.silva", ou "mb@mb.com.br" -> "mb"
 */
export function generateUsernameSuggestion(name?: string, email?: string): string {
  if (name && name.trim()) {
    const cleaned = name
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z0-9\s._-]/g, '') // remove caracteres especiais
      .replace(/\s+/g, '.') // substitui espaços por ponto
      .replace(/\.+/g, '.') // remove múltiplos pontos
      .replace(/^\.|\.$/g, ''); // remove pontos nas pontas
    if (cleaned.length >= 2) return cleaned;
  }

  if (email && email.includes('@')) {
    const userPart = email
      .split('@')[0]
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9._-]/g, '');
    if (userPart.length >= 2) return userPart;
  }

  return `usuario.${Math.floor(100 + Math.random() * 900)}`;
}

/**
 * Converte modelo da aplicação para linha do Supabase
 */
export function mapUserToDb(u: AuthUser): Record<string, any> {
  const row: Record<string, any> = {
    id: u.id,
    name: u.name.trim(),
    email: u.email.trim().toLowerCase(),
    password: u.password,
    role: u.role,
    department: u.department || (u.role === 'admin' ? 'Diretoria Executiva' : 'Operações'),
    avatar: u.avatar || null,
    active: u.active ?? true,
    created_at: u.createdAt,
    last_login: u.lastLogin || null,
  };

  if (u.username && u.username.trim()) {
    row.username = u.username.trim().toLowerCase();
  }

  return row;
}

/**
 * Converte registro do banco Supabase para objeto AuthUser
 */
export function mapDbToUser(row: any): AuthUser {
  return {
    id: row.id,
    name: row.name || 'Usuário',
    username: row.username || generateUsernameSuggestion(row.name, row.email),
    email: (row.email || '').trim().toLowerCase(),
    password: row.password || '',
    role: (row.role === 'admin' || row.role === 'operator') ? row.role : 'operator',
    department: row.department || (row.role === 'admin' ? 'Diretoria Executiva' : 'Operações'),
    avatar: row.avatar || undefined,
    active: row.active !== false,
    createdAt: row.created_at || new Date().toISOString(),
    lastLogin: row.last_login || undefined,
  };
}

/**
 * Obtém a lista de todos os usuários cadastrados localmente
 */
export function getStoredUsers(): AuthUser[] {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    // Garante que todo usuário tenha a propriedade username
    return parsed.map((u: any) => ({
      ...u,
      username: u.username || generateUsernameSuggestion(u.name, u.email),
    }));
  } catch (err) {
    console.error('Erro ao ler usuários:', err);
    return DEFAULT_USERS;
  }
}

/**
 * Grava a lista atualizada de usuários no localStorage
 */
export function saveStoredUsers(users: AuthUser[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event('diamond_auth_updated'));
  } catch (err) {
    console.error('Erro ao salvar usuários:', err);
  }
}

/**
 * Sincroniza a lista de usuários com a nuvem Supabase em segundo plano
 */
export async function syncUsersFromSupabase(): Promise<AuthUser[]> {
  const supabase = getSupabase();
  if (!supabase) return getStoredUsers();

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Aviso ao consultar usuários no Supabase:', error.message);
      return getStoredUsers();
    }

    if (Array.isArray(data) && data.length > 0) {
      const cloudUsers = data.map(mapDbToUser);
      if (typeof window !== 'undefined') {
        saveStoredUsers(cloudUsers);
      }
      return cloudUsers;
    } else if (Array.isArray(data) && data.length === 0) {
      // Se tabela vazia, insere os usuários padrão
      const defaults = DEFAULT_USERS.map(mapUserToDb);
      for (const row of defaults) {
        try {
          await supabase.from('admin_users').upsert(row);
        } catch {
          // caso a coluna username ainda não exista, tenta sem username
          delete row.username;
          await supabase.from('admin_users').upsert(row);
        }
      }
    }
    return getStoredUsers();
  } catch (err) {
    console.error('Erro na sincronização de usuários Supabase:', err);
    return getStoredUsers();
  }
}

/**
 * Cadastra um novo usuário (Administrador ou Operador) e sincroniza imediatamente com o Supabase
 */
export async function addStoredUser(
  userData: Omit<AuthUser, 'id' | 'createdAt' | 'lastLogin'>
): Promise<{ success: boolean; message: string; user?: AuthUser }> {
  const users = getStoredUsers();
  const normalizedEmail = userData.email.trim().toLowerCase();
  const normalizedUsername = (
    userData.username?.trim() || generateUsernameSuggestion(userData.name, userData.email)
  ).toLowerCase();

  // Validar se e-mail já existe localmente
  const emailExists = users.some(
    (u) => u.email.trim().toLowerCase() === normalizedEmail
  );
  if (emailExists) {
    return { success: false, message: 'Já existe um usuário com este e-mail cadastrado.' };
  }

  // Validar se nome de usuário já existe localmente
  const usernameExists = users.some(
    (u) => u.username?.trim().toLowerCase() === normalizedUsername
  );
  if (usernameExists) {
    return {
      success: false,
      message: `O nome de usuário "${normalizedUsername}" já está em uso. Escolha outro.`,
    };
  }

  if (!userData.name.trim()) {
    return { success: false, message: 'O nome do usuário é obrigatório.' };
  }

  if (!userData.password || userData.password.length < 4) {
    return { success: false, message: 'A senha deve conter no mínimo 4 caracteres.' };
  }

  const newUser: AuthUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: userData.name.trim(),
    username: normalizedUsername,
    email: normalizedEmail,
    password: userData.password,
    role: userData.role,
    department: userData.department.trim() || (userData.role === 'admin' ? 'Diretoria Executiva' : 'Operações'),
    avatar: userData.avatar || (userData.role === 'admin'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'),
    active: userData.active ?? true,
    createdAt: new Date().toISOString(),
  };

  // Salva no banco de dados Supabase imediatamente
  const supabase = getSupabase();
  if (supabase) {
    try {
      const row = mapUserToDb(newUser);
      const { error } = await supabase.from('admin_users').insert(row);
      if (error) {
        if (error.code === '42703') {
          // Coluna username ainda não existe no Postgres; insere sem ela
          delete row.username;
          await supabase.from('admin_users').insert(row);
        } else {
          console.warn('Aviso ao inserir no Supabase:', error.message);
        }
      }
    } catch (err) {
      console.error('Erro ao gravar usuário no Supabase:', err);
    }
  }

  const updated = [...users, newUser];
  saveStoredUsers(updated);

  return {
    success: true,
    message: 'Usuário cadastrado com sucesso e sincronizado no banco de dados!',
    user: newUser,
  };
}

/**
 * Atualiza os dados de um usuário existente e sincroniza imediatamente com o Supabase
 */
export async function updateStoredUser(
  user: AuthUser
): Promise<{ success: boolean; message: string }> {
  const users = getStoredUsers();
  const normalizedEmail = user.email.trim().toLowerCase();
  const normalizedUsername = (
    user.username?.trim() || generateUsernameSuggestion(user.name, user.email)
  ).toLowerCase();

  // Verifica duplicação de e-mail com outro usuário
  const emailConflict = users.find(
    (u) => u.id !== user.id && u.email.trim().toLowerCase() === normalizedEmail
  );
  if (emailConflict) {
    return { success: false, message: 'Outro usuário já utiliza este e-mail.' };
  }

  // Verifica duplicação de nome de usuário com outro usuário
  const userConflict = users.find(
    (u) => u.id !== user.id && u.username?.trim().toLowerCase() === normalizedUsername
  );
  if (userConflict) {
    return {
      success: false,
      message: `O nome de usuário "${normalizedUsername}" já está sendo utilizado por outro usuário.`,
    };
  }

  const updatedUser: AuthUser = {
    ...user,
    name: user.name.trim(),
    username: normalizedUsername,
    email: normalizedEmail,
  };

  // Atualiza no banco de dados Supabase de imediato
  const supabase = getSupabase();
  if (supabase) {
    try {
      const row = mapUserToDb(updatedUser);
      const { error } = await supabase
        .from('admin_users')
        .update(row)
        .eq('id', user.id);

      if (error) {
        if (error.code === '42703') {
          // Se a coluna username ainda não existir no Postgres, tenta atualizar sem ela
          delete row.username;
          await supabase.from('admin_users').update(row).eq('id', user.id);
        } else {
          console.warn('Aviso ao atualizar no Supabase:', error.message);
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar usuário no Supabase:', err);
    }
  }

  const updatedList = users.map((u) => (u.id === user.id ? updatedUser : u));
  saveStoredUsers(updatedList);

  // Se o usuário atual for o mesmo da sessão, sincroniza a sessão
  const session = getCurrentSession();
  if (session && session.user.id === user.id) {
    saveCurrentSession({
      ...session,
      user: updatedUser,
    });
  }

  return {
    success: true,
    message: 'Dados atualizados com sucesso e sincronizados no banco de dados!',
  };
}

/**
 * Alterna status ativo/inativo de um usuário e sincroniza com o Supabase
 */
export async function toggleUserStatus(userId: string): Promise<{ success: boolean; message: string }> {
  const session = getCurrentSession();
  if (session && session.user.id === userId) {
    return { success: false, message: 'Você não pode desativar o seu próprio usuário logado.' };
  }

  const users = getStoredUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return { success: false, message: 'Usuário não encontrado.' };

  const newStatus = !target.active;

  // Atualiza no Supabase
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase
        .from('admin_users')
        .update({ active: newStatus })
        .eq('id', userId);
    } catch (err) {
      console.error('Erro ao alternar status no Supabase:', err);
    }
  }

  const updated = users.map((u) => {
    if (u.id === userId) {
      return { ...u, active: newStatus };
    }
    return u;
  });

  saveStoredUsers(updated);
  return {
    success: true,
    message: `Usuário ${target.name} ${newStatus ? 'ativado' : 'desativado'} com sucesso no banco de dados.`,
  };
}

/**
 * Remove um usuário e sincroniza com o Supabase
 */
export async function deleteStoredUser(userId: string): Promise<{ success: boolean; message: string }> {
  const session = getCurrentSession();
  if (session && session.user.id === userId) {
    return { success: false, message: 'Não é permitido excluir o usuário que está atualmente logado.' };
  }

  const users = getStoredUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return { success: false, message: 'Usuário não encontrado.' };

  // Não permitir excluir o último administrador
  const activeAdmins = users.filter((u) => u.role === 'admin' && u.active);
  if (target.role === 'admin' && activeAdmins.length <= 1) {
    return {
      success: false,
      message: 'Não é possível remover o único administrador ativo do sistema.',
    };
  }

  // Remove do Supabase
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.from('admin_users').delete().eq('id', userId);
    } catch (err) {
      console.error('Erro ao excluir usuário no Supabase:', err);
    }
  }

  const updated = users.filter((u) => u.id !== userId);
  saveStoredUsers(updated);
  return { success: true, message: `Usuário ${target.name} removido com sucesso do banco de dados.` };
}

/**
 * Restaura os usuários padrões de fábrica
 */
export function resetStoredUsers(): AuthUser[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USERS_STORAGE_KEY);
  }
  return getStoredUsers();
}

/**
 * Obtém a sessão atual logada
 */
export function getCurrentSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (!session || !session.user) return null;
    return session;
  } catch (err) {
    console.error('Erro ao ler sessão:', err);
    return null;
  }
}

/**
 * Grava a sessão logada no localStorage
 */
export function saveCurrentSession(session: AuthSession | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!session) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    }
    window.dispatchEvent(new Event('diamond_session_updated'));
  } catch (err) {
    console.error('Erro ao salvar sessão:', err);
  }
}

/**
 * Realiza autenticação com E-mail OU Nome de Usuário e Senha,
 * consultando o Supabase em tempo real caso não encontre localmente.
 */
export async function login(
  identifier: string,
  password: string
): Promise<{ success: boolean; message: string; session?: AuthSession }> {
  const cleanId = identifier.trim().toLowerCase();

  if (!cleanId) {
    return { success: false, message: 'Por favor, informe seu e-mail ou nome de usuário.' };
  }

  let users = getStoredUsers();

  // 1. Tenta buscar usuário no cache local
  let user = users.find((u) => {
    const userEmail = u.email.trim().toLowerCase();
    const userUsername = (u.username || '').trim().toLowerCase();
    return (
      userEmail === cleanId ||
      userUsername === cleanId ||
      (cleanId === 'admin' && u.role === 'admin') ||
      (cleanId === 'operador' && u.role === 'operator') ||
      (cleanId === 'operator' && u.role === 'operator')
    );
  });

  // 2. Se não encontrou no cache local ou se tem Supabase configurado, consulta a nuvem
  const supabase = getSupabase();
  if (supabase) {
    try {
      // Busca por e-mail no Supabase
      let { data } = await supabase
        .from('admin_users')
        .select('*')
        .ilike('email', cleanId)
        .maybeSingle();

      // Se não encontrou por e-mail, tenta por username
      if (!data) {
        try {
          const resUser = await supabase
            .from('admin_users')
            .select('*')
            .ilike('username', cleanId)
            .maybeSingle();
          if (resUser && resUser.data) {
            data = resUser.data;
          }
        } catch {
          // coluna username pode não existir ainda no schema do banco
        }
      }

      if (data) {
        const cloudUser = mapDbToUser(data);
        // Atualiza ou insere na lista local
        const existingIdx = users.findIndex((u) => u.id === cloudUser.id);
        if (existingIdx >= 0) {
          users[existingIdx] = cloudUser;
        } else {
          users = [...users, cloudUser];
        }
        saveStoredUsers(users);
        user = cloudUser;
      }
    } catch (err) {
      console.warn('Erro ao consultar Supabase durante login:', err);
    }
  }

  if (!user) {
    return {
      success: false,
      message: 'Usuário não localizado. Verifique o e-mail ou nome de usuário informado.',
    };
  }

  if (user.password !== password) {
    return {
      success: false,
      message: 'Senha incorreta. Por favor, tente novamente.',
    };
  }

  if (!user.active) {
    return {
      success: false,
      message: 'Este usuário está inativado no sistema. Contate um Administrador.',
    };
  }

  // Atualiza lastLogin do usuário localmente e no Supabase
  const now = new Date().toISOString();
  const updatedUsers = users.map((u) => (u.id === user.id ? { ...u, lastLogin: now } : u));
  saveStoredUsers(updatedUsers);

  if (supabase) {
    try {
      await supabase
        .from('admin_users')
        .update({ last_login: now })
        .eq('id', user.id);
    } catch {
      // falha silenciosa se offline
    }
  }

  const session: AuthSession = {
    user: { ...user, lastLogin: now },
    token: `tok-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
    loggedInAt: now,
  };

  saveCurrentSession(session);
  return { success: true, message: `Bem-vindo, ${user.name}!`, session };
}

/**
 * Encerra a sessão ativa
 */
export function logout(): void {
  saveCurrentSession(null);
}

/**
 * Verifica se um e-mail existe no cadastro de usuários
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  const clean = email.trim().toLowerCase();
  if (!clean) return false;

  const users = getStoredUsers();
  const foundLocal = users.some(
    (u) =>
      u.email.trim().toLowerCase() === clean ||
      u.username?.trim().toLowerCase() === clean ||
      (clean === 'admin' && u.role === 'admin') ||
      (clean === 'operador' && u.role === 'operator')
  );
  if (foundLocal) return true;

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', clean)
        .maybeSingle();
      if (data) return true;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Redefine a senha de um usuário através do e-mail cadastrado
 * Atualiza no Supabase imediatamente.
 */
export async function resetPasswordByEmail(
  emailOrUsername: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const clean = emailOrUsername.trim().toLowerCase();

  if (!clean) {
    return { success: false, message: 'Por favor, informe seu e-mail ou nome de usuário cadastrado.' };
  }

  if (!newPassword || newPassword.length < 4) {
    return { success: false, message: 'A nova senha deve conter no mínimo 4 caracteres.' };
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      // Tenta por email
      const { error: errEmail } = await supabase
        .from('admin_users')
        .update({ password: newPassword })
        .eq('email', clean);

      // Tenta também por username
      try {
        await supabase
          .from('admin_users')
          .update({ password: newPassword })
          .eq('username', clean);
      } catch {
        // coluna pode não existir
      }
    } catch (e) {
      console.error('Erro ao atualizar senha no Supabase:', e);
    }
  }

  const users = getStoredUsers();
  const exists = users.some(
    (u) =>
      u.email.trim().toLowerCase() === clean ||
      u.username?.trim().toLowerCase() === clean ||
      (clean === 'admin' && u.role === 'admin') ||
      (clean === 'operador' && u.role === 'operator')
  );

  if (!exists) {
    return {
      success: false,
      message: 'Nenhum usuário localizado com esta credencial no sistema.',
    };
  }

  const updatedUsers = users.map((u) => {
    const match =
      u.email.trim().toLowerCase() === clean ||
      u.username?.trim().toLowerCase() === clean ||
      (clean === 'admin' && u.role === 'admin') ||
      (clean === 'operador' && u.role === 'operator');
    if (match) {
      return { ...u, password: newPassword };
    }
    return u;
  });

  saveStoredUsers(updatedUsers);

  return {
    success: true,
    message: 'Senha redefinida com sucesso! Você já pode entrar com sua nova senha.',
  };
}
