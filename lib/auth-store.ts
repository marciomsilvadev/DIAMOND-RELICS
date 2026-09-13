'use client';

export type UserRole = 'admin' | 'operator';

export interface AuthUser {
  id: string;
  name: string;
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
    id: 'usr-admin-master',
    name: 'Roberto Silveira (Curador Chefe)',
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
 * Obtém a lista de todos os usuários cadastrados
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
    return parsed;
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
 * Cadastra um novo usuário (Administrador ou Operador)
 */
export function addStoredUser(
  userData: Omit<AuthUser, 'id' | 'createdAt' | 'lastLogin'>
): { success: boolean; message: string; user?: AuthUser } {
  const users = getStoredUsers();
  const normalizedEmail = userData.email.trim().toLowerCase();

  // Validar se e-mail já existe
  const exists = users.some(
    (u) => u.email.trim().toLowerCase() === normalizedEmail
  );
  if (exists) {
    return { success: false, message: 'Já existe um usuário com este e-mail cadastrado.' };
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
    email: normalizedEmail,
    password: userData.password,
    role: userData.role,
    department: userData.department.trim() || (userData.role === 'admin' ? 'Diretoria' : 'Operações'),
    avatar: userData.avatar || (userData.role === 'admin'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'),
    active: userData.active ?? true,
    createdAt: new Date().toISOString(),
  };

  const updated = [...users, newUser];
  saveStoredUsers(updated);
  return { success: true, message: 'Usuário cadastrado com sucesso!', user: newUser };
}

/**
 * Atualiza os dados de um usuário existente
 */
export function updateStoredUser(
  user: AuthUser
): { success: boolean; message: string } {
  const users = getStoredUsers();
  const normalizedEmail = user.email.trim().toLowerCase();

  // Verifica duplicação de e-mail com outro usuário
  const conflict = users.find(
    (u) => u.id !== user.id && u.email.trim().toLowerCase() === normalizedEmail
  );
  if (conflict) {
    return { success: false, message: 'Outro usuário já utiliza este e-mail.' };
  }

  const updated = users.map((u) => {
    if (u.id === user.id) {
      return {
        ...user,
        email: normalizedEmail,
        name: user.name.trim(),
      };
    }
    return u;
  });

  saveStoredUsers(updated);

  // Se o usuário atual for o mesmo da sessão, sincroniza a sessão
  const session = getCurrentSession();
  if (session && session.user.id === user.id) {
    saveCurrentSession({
      ...session,
      user: { ...user, email: normalizedEmail, name: user.name.trim() },
    });
  }

  return { success: true, message: 'Usuário atualizado com sucesso!' };
}

/**
 * Alterna status ativo/inativo de um usuário
 */
export function toggleUserStatus(userId: string): { success: boolean; message: string } {
  const session = getCurrentSession();
  if (session && session.user.id === userId) {
    return { success: false, message: 'Você não pode desativar o seu próprio usuário logado.' };
  }

  const users = getStoredUsers();
  const target = users.find((u) => u.id === userId);
  if (!target) return { success: false, message: 'Usuário não encontrado.' };

  const updated = users.map((u) => {
    if (u.id === userId) {
      return { ...u, active: !u.active };
    }
    return u;
  });

  saveStoredUsers(updated);
  return {
    success: true,
    message: `Usuário ${target.name} ${!target.active ? 'ativado' : 'desativado'} com sucesso!`,
  };
}

/**
 * Remove um usuário (com proteção)
 */
export function deleteStoredUser(userId: string): { success: boolean; message: string } {
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

  const updated = users.filter((u) => u.id !== userId);
  saveStoredUsers(updated);
  return { success: true, message: `Usuário ${target.name} removido com sucesso.` };
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
 * Realiza autenticação com e-mail/usuário e senha
 */
export function login(
  identifier: string,
  password: string
): { success: boolean; message: string; session?: AuthSession } {
  const users = getStoredUsers();
  const cleanId = identifier.trim().toLowerCase();

  // Permite login por e-mail ou apelido direto ("admin" ou "operador")
  const user = users.find((u) => {
    const userEmail = u.email.trim().toLowerCase();
    const isDirectMatch =
      userEmail === cleanId ||
      (cleanId === 'admin' && u.role === 'admin') ||
      (cleanId === 'operador' && u.role === 'operator') ||
      (cleanId === 'operator' && u.role === 'operator');
    return isDirectMatch;
  });

  if (!user) {
    return {
      success: false,
      message: 'Usuário não localizado. Verifique o e-mail informado.',
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

  // Atualiza lastLogin do usuário
  const now = new Date().toISOString();
  const updatedUsers = users.map((u) => (u.id === user.id ? { ...u, lastLogin: now } : u));
  saveStoredUsers(updatedUsers);

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
