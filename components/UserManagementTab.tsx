'use client';

import { useState, useEffect } from 'react';
import {
  AuthUser,
  getStoredUsers,
  addStoredUser,
  updateStoredUser,
  deleteStoredUser,
  toggleUserStatus,
  resetStoredUsers,
  syncUsersFromSupabase,
  generateUsernameSuggestion,
} from '@/lib/auth-store';

interface UserManagementTabProps {
  currentUser: AuthUser;
}

export function UserManagementTab({ currentUser }: UserManagementTabProps) {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'operator'>('all');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal de Adição
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'operator'>('operator');
  const [newDepartment, setNewDepartment] = useState('Operações & Logística');
  const [newActive, setNewActive] = useState(true);

  // Modal de Edição
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'operator'>('operator');
  const [editDepartment, setEditDepartment] = useState('');
  const [editActive, setEditActive] = useState(true);

  // Modal de Confirmação de Exclusão
  const [userToDelete, setUserToDelete] = useState<AuthUser | null>(null);

  const loadUsers = async () => {
    // 1. Carrega local de imediato
    setUsers(getStoredUsers());

    // 2. Sincroniza em segundo plano com o Supabase
    setIsSyncing(true);
    try {
      const fresh = await syncUsersFromSupabase();
      if (Array.isArray(fresh) && fresh.length > 0) {
        setUsers(fresh);
      }
    } catch (err) {
      console.warn('Erro ao sincronizar com banco de dados:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadUsers();

    const handleUpdate = () => {
      setUsers(getStoredUsers());
    };
    window.addEventListener('diamond_auth_updated', handleUpdate);
    return () => window.removeEventListener('diamond_auth_updated', handleUpdate);
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // Sugestão automática de nome de usuário
  const handleGenerateAddUsername = () => {
    const sug = generateUsernameSuggestion(newName, newEmail);
    setNewUsername(sug);
  };

  const handleGenerateEditUsername = () => {
    const sug = generateUsernameSuggestion(editName, editEmail);
    setEditUsername(sug);
  };

  // Cadastrar Novo Usuário
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      showNotification('error', 'Por favor, preencha todos os campos obrigatórios (Nome, E-mail e Senha).');
      return;
    }

    const finalUsername = newUsername.trim() || generateUsernameSuggestion(newName, newEmail);

    setIsSubmitting(true);

    try {
      const res = await addStoredUser({
        name: newName,
        username: finalUsername,
        email: newEmail,
        password: newPassword,
        role: newRole,
        department: newDepartment,
        active: newActive,
      });

      setIsSubmitting(false);

      if (res.success) {
        showNotification('success', res.message);
        setShowAddModal(false);
        setNewName('');
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
        setNewRole('operator');
        setNewDepartment('Operações & Logística');
        setNewActive(true);
        loadUsers();
      } else {
        showNotification('error', res.message);
      }
    } catch {
      setIsSubmitting(false);
      showNotification('error', 'Erro ao salvar novo usuário no banco de dados.');
    }
  };

  // Abrir Edição
  const handleOpenEdit = (u: AuthUser) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditUsername(u.username || generateUsernameSuggestion(u.name, u.email));
    setEditEmail(u.email);
    setEditPassword(''); // Deixar em branco caso não queira alterar
    setEditRole(u.role);
    setEditDepartment(u.department || '');
    setEditActive(u.active);
  };

  // Salvar Edição
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editName.trim() || !editEmail.trim()) {
      showNotification('error', 'Nome e E-mail são obrigatórios.');
      return;
    }

    const finalUsername = editUsername.trim() || generateUsernameSuggestion(editName, editEmail);

    const updatedData: AuthUser = {
      ...editingUser,
      name: editName.trim(),
      username: finalUsername,
      email: editEmail.trim().toLowerCase(),
      role: editRole,
      department: editDepartment.trim() || (editRole === 'admin' ? 'Diretoria Executiva' : 'Operações'),
      active: editActive,
      password: editPassword.trim() ? editPassword.trim() : editingUser.password,
    };

    setIsSubmitting(true);

    try {
      const res = await updateStoredUser(updatedData);
      setIsSubmitting(false);

      if (res.success) {
        showNotification('success', res.message);
        setEditingUser(null);
        loadUsers();
      } else {
        showNotification('error', res.message);
      }
    } catch {
      setIsSubmitting(false);
      showNotification('error', 'Erro ao atualizar dados no banco de dados.');
    }
  };

  // Alternar Ativo/Inativo
  const handleToggleActive = async (u: AuthUser) => {
    const res = await toggleUserStatus(u.id);
    if (res.success) {
      showNotification('success', res.message);
      loadUsers();
    } else {
      showNotification('error', res.message);
    }
  };

  // Confirmar Exclusão
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    const res = await deleteStoredUser(userToDelete.id);
    if (res.success) {
      showNotification('success', res.message);
      setUserToDelete(null);
      loadUsers();
    } else {
      showNotification('error', res.message);
    }
  };

  // Restaurar padrões
  const handleResetDefaults = () => {
    if (
      confirm(
        'Deseja restaurar os usuários padrões do sistema (Admin Master e Operador de Acervo)? Novos usuários locais serão limpos.'
      )
    ) {
      resetStoredUsers();
      loadUsers();
      showNotification('success', 'Usuários padrões restaurados com sucesso.');
    }
  };

  // Filtros
  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === 'all' ? true : u.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch =
      u.name.toLowerCase().includes(q) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      u.email.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q));
    return matchRole && matchSearch;
  });

  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalOperators = users.filter((u) => u.role === 'operator').length;
  const activeCount = users.filter((u) => u.active).length;

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Mensagem Toast Flutuante / Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-lg text-xs font-['Space_Grotesk'] border flex items-center justify-between gap-3 shadow-lg ${
            feedback.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-[0_4px_16px_rgba(16,185,129,0.2)]'
              : 'bg-red-950/90 border-red-500 text-red-200 shadow-[0_4px_16px_rgba(239,68,68,0.2)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">
              {feedback.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-white/60 hover:text-white"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Banner de Aviso de Permissão para Operador */}
      {!isAdmin && (
        <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-lg flex items-start gap-3 text-amber-200 text-xs font-['Space_Grotesk']">
          <span className="material-symbols-outlined text-xl text-amber-400 shrink-0 mt-0.5">
            security
          </span>
          <div>
            <strong className="block text-amber-300 font-bold mb-0.5">
              Acesso Operador (Modo Informativo)
            </strong>
            Você está autenticado com o perfil de <strong>Operador</strong>. A criação, edição e exclusão de novos administradores e operadores são privilégios reservados a usuários com perfil de <strong>Administrador</strong>.
          </div>
        </div>
      )}

      {/* Cards de Métricas da Equipe */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block">
              Total da Equipe
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-600/30 px-1.5 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {isSyncing ? 'Sincronizando...' : 'Banco Supabase'}
            </span>
          </div>
          <span className="text-2xl font-bold font-['Playfair_Display'] text-[#F4F1EA]">
            {users.length} {users.length === 1 ? 'Usuário' : 'Usuários'}
          </span>
          <span className="text-[10px] text-[#10B981] font-['Space_Grotesk'] block">
            {activeCount} ativo(s) no momento
          </span>
        </div>

        <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-4 space-y-1">
          <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-[#f2ca50]">shield_person</span>
            Administradores
          </span>
          <span className="text-2xl font-bold font-['Playfair_Display'] text-[#f2ca50]">
            {totalAdmins}
          </span>
          <span className="text-[10px] text-[#9CA3AF] font-['Space_Grotesk'] block">
            Acesso Total &amp; Gestão de Acessos
          </span>
        </div>

        <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-4 space-y-1">
          <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block flex items-center gap-1">
            <span className="material-symbols-outlined text-sm text-[#10B981]">badge</span>
            Operadores
          </span>
          <span className="text-2xl font-bold font-['Playfair_Display'] text-[#10B981]">
            {totalOperators}
          </span>
          <span className="text-[10px] text-[#9CA3AF] font-['Space_Grotesk'] block">
            Operação de Produtos e Pedidos
          </span>
        </div>

        <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-4 space-y-1">
          <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block">
            Sua Sessão Ativa
          </span>
          <span className="text-sm font-bold font-['Space_Grotesk'] text-[#E5C875] truncate block">
            {currentUser.name}
          </span>
          <span className="text-[10px] text-[#9CA3AF] font-['Space_Grotesk'] block">
            Usuário: <span className="font-mono text-[#f2ca50]">@{currentUser.username || 'admin'}</span> | Perfil: <span className="uppercase font-semibold text-[#f2ca50]">{currentUser.role}</span>
          </span>
        </div>
      </div>

      {/* Barra de Controle: Busca, Filtros e Botão de Novo Usuário */}
      <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filtros e Busca */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, usuário, e-mail..."
              className="w-full pl-9 pr-3 py-2 bg-[#08090B] border border-[#282E3A] rounded-lg text-xs font-['Space_Grotesk'] text-[#F4F1EA] placeholder-[#9CA3AF] focus:outline-none focus:border-[#f2ca50] transition-colors"
            />
          </div>

          <div className="flex items-center border border-[#282E3A] bg-[#08090B] rounded-lg overflow-hidden text-xs font-['Space_Grotesk']">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-2 transition-colors ${
                roleFilter === 'all'
                  ? 'bg-[#f2ca50] text-[#08090B] font-bold'
                  : 'text-[#9CA3AF] hover:text-[#F4F1EA]'
              }`}
            >
              Todos ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-2 transition-colors ${
                roleFilter === 'admin'
                  ? 'bg-[#f2ca50] text-[#08090B] font-bold'
                  : 'text-[#9CA3AF] hover:text-[#F4F1EA]'
              }`}
            >
              Administradores ({totalAdmins})
            </button>
            <button
              onClick={() => setRoleFilter('operator')}
              className={`px-3 py-2 transition-colors ${
                roleFilter === 'operator'
                  ? 'bg-[#f2ca50] text-[#08090B] font-bold'
                  : 'text-[#9CA3AF] hover:text-[#F4F1EA]'
              }`}
            >
              Operadores ({totalOperators})
            </button>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadUsers}
            disabled={isSyncing}
            className="p-2 bg-[#1A1E26] hover:bg-[#282E3A] border border-[#282E3A] text-[#9CA3AF] hover:text-[#f2ca50] text-xs font-['Space_Grotesk'] rounded-lg transition-colors flex items-center gap-1.5"
            title="Sincronizar com Banco de Dados na Nuvem"
          >
            <span className={`material-symbols-outlined text-base ${isSyncing ? 'animate-spin text-[#f2ca50]' : ''}`}>
              sync
            </span>
            <span className="hidden sm:inline">Sincronizar</span>
          </button>

          {isAdmin && (
            <button
              onClick={handleResetDefaults}
              className="px-3 py-2 bg-[#1A1E26] hover:bg-[#282E3A] border border-[#282E3A] text-[#9CA3AF] hover:text-[#F4F1EA] text-xs font-['Space_Grotesk'] rounded-lg transition-colors"
              title="Restaura os dois usuários originais"
            >
              Restaurar Padrões
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => {
                setShowAddModal(true);
                setNewName('');
                setNewUsername('');
                setNewEmail('');
                setNewPassword('');
              }}
              className="px-4 py-2 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-['Space_Grotesk'] font-bold text-xs uppercase rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              Cadastrar Usuário
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-[#12151B] border border-[#282E3A] rounded-lg overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A1E26] border-b border-[#282E3A] text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase tracking-wider">
                <th className="py-3.5 px-4">Membro / Usuário</th>
                <th className="py-3.5 px-4">E-mail de Login</th>
                <th className="py-3.5 px-4">Perfil de Acesso</th>
                <th className="py-3.5 px-4">Setor / Departamento</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Cadastro / Último Login</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282E3A] text-xs font-['Space_Grotesk'] text-[#F4F1EA]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#9CA3AF]">
                    <span className="material-symbols-outlined text-4xl block mb-2 text-[#6B7280]">
                      group_off
                    </span>
                    Nenhum usuário encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  const isUserAdmin = u.role === 'admin';

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-[#1A1E26]/60 transition-colors ${
                        isCurrent ? 'bg-[#f2ca50]/5' : ''
                      }`}
                    >
                      {/* Nome e Usuário */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#1A1E26] border border-[#282E3A] flex items-center justify-center overflow-hidden shrink-0">
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt={u.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-bold text-[#f2ca50]">
                                {u.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-[#F4F1EA] flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/40 px-1.5 py-0.2 rounded font-normal">
                                  Você
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-[#f2ca50] tracking-wide">
                              @{u.username || 'usuario'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* E-mail */}
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] text-[#9CA3AF] font-mono">
                          {u.email}
                        </span>
                      </td>

                      {/* Perfil */}
                      <td className="py-3.5 px-4">
                        {isUserAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#f2ca50]/15 text-[#f2ca50] border border-[#f2ca50]/30 font-bold text-[10px] tracking-wide uppercase">
                            <span className="material-symbols-outlined text-xs">shield_person</span>
                            Administrador
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-600/30 font-bold text-[10px] tracking-wide uppercase">
                            <span className="material-symbols-outlined text-xs">badge</span>
                            Operador
                          </span>
                        )}
                      </td>

                      {/* Departamento */}
                      <td className="py-3.5 px-4 text-[#9CA3AF]">
                        {u.department || 'Operações'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {u.active ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-[#10B981]">
                            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-[#EF4444]">
                            <span className="w-2 h-2 rounded-full bg-[#EF4444]"></span>
                            Inativo
                          </span>
                        )}
                      </td>

                      {/* Cadastro / Último Login */}
                      <td className="py-3.5 px-4 text-[11px] text-[#9CA3AF]">
                        <div>
                          Cadastrado: {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-[10px] text-[#6B7280]">
                          {u.lastLogin
                            ? `Último acesso: ${new Date(u.lastLogin).toLocaleDateString('pt-BR')} às ${new Date(
                                u.lastLogin
                              ).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                            : 'Nenhum login registrado'}
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right">
                        {isAdmin ? (
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Botão Editar */}
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="p-1.5 rounded bg-[#1A1E26] hover:bg-[#282E3A] text-[#9CA3AF] hover:text-[#f2ca50] transition-colors"
                              title="Editar Usuário"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>

                            {/* Botão Alternar Status */}
                            {!isCurrent && (
                              <button
                                onClick={() => handleToggleActive(u)}
                                className={`p-1.5 rounded transition-colors ${
                                  u.active
                                    ? 'bg-[#1A1E26] hover:bg-red-950/40 text-[#9CA3AF] hover:text-red-400'
                                    : 'bg-[#1A1E26] hover:bg-emerald-950/40 text-[#9CA3AF] hover:text-emerald-400'
                                }`}
                                title={u.active ? 'Desativar Acesso' : 'Ativar Acesso'}
                              >
                                <span className="material-symbols-outlined text-base">
                                  {u.active ? 'toggle_on' : 'toggle_off'}
                                </span>
                              </button>
                            )}

                            {/* Botão Excluir */}
                            {!isCurrent && (
                              <button
                                onClick={() => setUserToDelete(u)}
                                className="p-1.5 rounded bg-[#1A1E26] hover:bg-red-950/60 text-[#9CA3AF] hover:text-red-400 transition-colors"
                                title="Excluir Usuário"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#6B7280] italic">
                            Somente leitura
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CADASTRAR NOVO USUÁRIO */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08090B]/90 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#12151B] border border-[#f2ca50]/50 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#282E3A] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f2ca50] text-xl">
                  person_add
                </span>
                <h3 className="text-base font-bold font-['Playfair_Display'] text-[#F4F1EA]">
                  Cadastrar Novo Usuário no Sistema
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#9CA3AF] hover:text-[#F4F1EA]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-['Space_Grotesk']">
              {/* 1. Nome Completo */}
              <div>
                <label className="text-[#9CA3AF] block mb-1 font-semibold">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    if (!newUsername) {
                      setNewUsername(generateUsernameSuggestion(e.target.value, newEmail));
                    }
                  }}
                  className="w-full bg-[#08090B] border border-[#282E3A] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              {/* 2. Nome de Usuário (com botão de sugestão automática) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#9CA3AF] font-semibold">
                    Nome de Usuário de Login (Sugestão Automática)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateAddUsername}
                    className="text-[10px] text-[#f2ca50] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">auto_fix_high</span>
                    Gerar Sugestão
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f2ca50] font-mono text-xs">
                    @
                  </span>
                  <input
                    type="text"
                    placeholder="ex: joao.silva (gerado automaticamente caso em branco)"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded-lg pl-8 pr-3 py-2 text-[#F4F1EA] font-mono focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>
                <span className="text-[10px] text-[#6B7280] block mt-1">
                  Pode ser usado no login no lugar do e-mail. Se deixado em branco, geramos uma sugestão automática.
                </span>
              </div>

              {/* 3. E-mail de Login */}
              <div>
                <label className="text-[#9CA3AF] block mb-1 font-semibold">
                  E-mail de Login *
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ex: joao@diamondrelics.com"
                  value={newEmail}
                  onChange={(e) => {
                    setNewEmail(e.target.value);
                    if (!newUsername && !newName) {
                      setNewUsername(generateUsernameSuggestion('', e.target.value));
                    }
                  }}
                  className="w-full bg-[#08090B] border border-[#282E3A] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              {/* 4. Senha de Acesso */}
              <div>
                <label className="text-[#9CA3AF] block mb-1 font-semibold">
                  Senha de Acesso *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Mínimo 4 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#08090B] border border-[#282E3A] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Perfil / Nível de Acesso *
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'admin' | 'operator')}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  >
                    <option value="operator">Operador (Catálogo & Vendas)</option>
                    <option value="admin">Administrador (Acesso Total)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Setor / Departamento
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Operações, Vendas, Curadoria"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>
              </div>

              {/* Descrição do Perfil Selecionado */}
              <div className="p-3 bg-[#08090B] border border-[#282E3A] rounded-lg text-[11px] text-[#9CA3AF]">
                {newRole === 'admin' ? (
                  <p>
                    <strong className="text-[#f2ca50]">Perfil Administrador:</strong> Permite gerenciar todo o acervo, configurações do site (CMS), pedidos e a equipe de usuários.
                  </p>
                ) : (
                  <p>
                    <strong className="text-emerald-400">Perfil Operador:</strong> Permite gerenciar produtos do acervo e pedidos da loja.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="text-[#9CA3AF] font-semibold flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newActive}
                    onChange={(e) => setNewActive(e.target.checked)}
                    className="rounded border-[#282E3A] text-[#f2ca50] focus:ring-[#f2ca50]"
                  />
                  <span>Usuário Ativo Imediatamente</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#282E3A]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#1A1E26] hover:bg-[#282E3A] text-[#9CA3AF] hover:text-[#F4F1EA] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#f2ca50] hover:bg-[#E5C875] disabled:opacity-50 text-[#08090B] font-bold rounded-lg uppercase transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#08090B] border-t-transparent rounded-full animate-spin"></span>
                      <span>Salvando no Banco...</span>
                    </>
                  ) : (
                    <span>Salvar no Banco de Dados</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR USUÁRIO */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08090B]/90 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#12151B] border border-[#282E3A] rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#282E3A] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f2ca50] text-xl">edit</span>
                <h3 className="text-base font-bold font-['Playfair_Display'] text-[#F4F1EA]">
                  Editar Usuário: {editingUser.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-[#9CA3AF] hover:text-[#F4F1EA]"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-['Space_Grotesk']">
              {/* Nome */}
              <div>
                <label className="text-[#9CA3AF] block mb-1 font-semibold">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#08090B] border border-[#282E3A] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              {/* Nome de Usuário */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[#9CA3AF] font-semibold">
                    Nome de Usuário de Login
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateEditUsername}
                    className="text-[10px] text-[#f2ca50] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-xs">auto_fix_high</span>
                    Gerar Sugestão
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#f2ca50] font-mono text-xs">
                    @
                  </span>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded-lg pl-8 pr-3 py-2 text-[#F4F1EA] font-mono focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>
              </div>

              {/* E-mail de Login */}
              <div>
                <label className="text-[#9CA3AF] block mb-1 font-semibold">
                  E-mail de Login *
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-[#08090B] border border-[#282E3A] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              {/* Nova Senha */}
              <div>
                <label className="text-[#9CA3AF] block mb-1 font-semibold flex items-center justify-between">
                  <span>Nova Senha de Acesso</span>
                  <span className="text-[10px] text-[#6B7280]">Deixe em branco para manter a senha atual</span>
                </label>
                <input
                  type="password"
                  placeholder="•••••••• (deixe em branco se não quiser alterar)"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full bg-[#08090B] border border-[#282E3A] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Perfil / Nível de Acesso
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as 'admin' | 'operator')}
                    disabled={editingUser.id === currentUser.id}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50] disabled:opacity-50"
                  >
                    <option value="operator">Operador</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Setor / Departamento
                  </label>
                  <input
                    type="text"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="text-[#9CA3AF] font-semibold flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editActive}
                    disabled={editingUser.id === currentUser.id}
                    onChange={(e) => setEditActive(e.target.checked)}
                    className="rounded border-[#282E3A] text-[#f2ca50] focus:ring-[#f2ca50] disabled:opacity-50"
                  />
                  <span>Usuário Ativo (Acesso Liberado)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#282E3A]">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-[#1A1E26] hover:bg-[#282E3A] text-[#9CA3AF] hover:text-[#F4F1EA] rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#f2ca50] hover:bg-[#E5C875] disabled:opacity-50 text-[#08090B] font-bold rounded-lg uppercase transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#08090B] border-t-transparent rounded-full animate-spin"></span>
                      <span>Salvando no Banco...</span>
                    </>
                  ) : (
                    <span>Salvar Alterações no Banco</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR EXCLUSÃO */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#08090B]/90 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#12151B] border border-red-500/80 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="text-sm font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase">
                Confirmar Remoção de Usuário
              </h3>
            </div>

            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Tem certeza que deseja remover o usuário <strong>{userToDelete.name}</strong> ({userToDelete.email})?
              Esta ação excluirá permanentemente o acesso deste colaborador tanto do sistema quanto do banco de dados na nuvem.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 bg-[#1A1E26] hover:bg-[#282E3A] text-[#9CA3AF] hover:text-[#F4F1EA] rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs uppercase transition-colors"
              >
                Sim, Remover do Banco
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
