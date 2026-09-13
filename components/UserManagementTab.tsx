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
} from '@/lib/auth-store';

interface UserManagementTabProps {
  currentUser: AuthUser;
}

export function UserManagementTab({ currentUser }: UserManagementTabProps) {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'operator'>('all');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal de Adição
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'operator'>('operator');
  const [newDepartment, setNewDepartment] = useState('Operações & Logística');
  const [newActive, setNewActive] = useState(true);

  // Modal de Edição
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'operator'>('operator');
  const [editDepartment, setEditDepartment] = useState('');
  const [editActive, setEditActive] = useState(true);

  // Modal de Confirmação de Exclusão
  const [userToDelete, setUserToDelete] = useState<AuthUser | null>(null);

  const loadUsers = () => {
    setUsers(getStoredUsers());
  };

  useEffect(() => {
    loadUsers();

    const handleUpdate = () => loadUsers();
    window.addEventListener('diamond_auth_updated', handleUpdate);
    return () => window.removeEventListener('diamond_auth_updated', handleUpdate);
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  };

  // Cadastrar Novo Usuário
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      showNotification('error', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const res = addStoredUser({
      name: newName,
      email: newEmail,
      password: newPassword,
      role: newRole,
      department: newDepartment,
      active: newActive,
    });

    if (res.success) {
      showNotification('success', res.message);
      setShowAddModal(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('operator');
      setNewDepartment('Operações & Logística');
      setNewActive(true);
      loadUsers();
    } else {
      showNotification('error', res.message);
    }
  };

  // Abrir Edição
  const handleOpenEdit = (u: AuthUser) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPassword(''); // Deixar em branco caso não queira alterar
    setEditRole(u.role);
    setEditDepartment(u.department || '');
    setEditActive(u.active);
  };

  // Salvar Edição
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editName.trim() || !editEmail.trim()) {
      showNotification('error', 'Nome e E-mail são obrigatórios.');
      return;
    }

    const updatedData: AuthUser = {
      ...editingUser,
      name: editName.trim(),
      email: editEmail.trim().toLowerCase(),
      role: editRole,
      department: editDepartment.trim() || (editRole === 'admin' ? 'Diretoria' : 'Operações'),
      active: editActive,
      password: editPassword.trim() ? editPassword.trim() : editingUser.password,
    };

    const res = updateStoredUser(updatedData);
    if (res.success) {
      showNotification('success', res.message);
      setEditingUser(null);
      loadUsers();
    } else {
      showNotification('error', res.message);
    }
  };

  // Alternar Ativo/Inativo
  const handleToggleActive = (u: AuthUser) => {
    const res = toggleUserStatus(u.id);
    if (res.success) {
      showNotification('success', res.message);
      loadUsers();
    } else {
      showNotification('error', res.message);
    }
  };

  // Confirmar Exclusão
  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    const res = deleteStoredUser(userToDelete.id);
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
        'Deseja restaurar os usuários padrões do sistema (Admin Master e Operador de Acervo)? Novos usuários criados serão removidos.'
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
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department && u.department.toLowerCase().includes(search.toLowerCase()));
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
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
              : 'bg-red-950/80 border-red-500/60 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">
              {feedback.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{feedback.message}</span>
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
          <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block">
            Total da Equipe
          </span>
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
            Perfil: <span className="uppercase font-semibold text-[#f2ca50]">{currentUser.role}</span>
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
              placeholder="Buscar por nome, e-mail ou setor..."
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
              onClick={() => setShowAddModal(true)}
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
                  <td colSpan={6} className="py-12 text-center text-[#9CA3AF]">
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
                      {/* Nome e E-mail */}
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
                            <span className="text-[11px] text-[#9CA3AF] font-mono">
                              {u.email}
                            </span>
                          </div>
                        </div>
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
                  Cadastrar Administrador ou Operador
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
              <div>
                <label className="text-[#9CA3AF] block mb-1 font-semibold">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#08090B] border border-[#282E3A] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              <div>
                <label className="text-[#9CA3AF] block mb-1 font-semibold">
                  E-mail de Login *
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ex: joao@diamondrelics.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#08090B] border border-[#282E3A] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              <div>
                <label className="text-[#9CA3AF] block mb-1 font-semibold">
                  Senha Provisória de Acesso *
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
                    <strong className="text-[#f2ca50]">Perfil Administrador:</strong> Permite gerenciar todo o catálogo de peças, editar textos institucionais (CMS), visualizar pedidos e gerenciar os outros operadores e administradores.
                  </p>
                ) : (
                  <p>
                    <strong className="text-emerald-400">Perfil Operador:</strong> Permite cadastrar e editar relíquias no catálogo e gerenciar pedidos/vendas. Sem permissão para alterar textos do CMS ou gerenciar usuários.
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
                  className="px-5 py-2 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-bold rounded-lg uppercase transition-colors"
                >
                  Salvar Usuário
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
              <div>
                <label className="text-[#9CA3AF] block mb-1 font-semibold">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#08090B] border border-[#282E3A] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              <div>
                <label className="text-[#9CA3AF] block mb-1 font-semibold">
                  E-mail de Login
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-[#08090B] border border-[#282E3A] rounded-lg px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              <div>
                <label className="text-[#9CA3AF] block mb-1 font-semibold flex items-center justify-between">
                  <span>Nova Senha</span>
                  <span className="text-[10px] text-[#6B7280]">Deixe em branco para manter a senha atual</span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
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
                  className="px-5 py-2 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-bold rounded-lg uppercase transition-colors"
                >
                  Salvar Alterações
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

            <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed">
              Tem certeza que deseja remover o usuário{' '}
              <strong className="text-[#F4F1EA] font-semibold">{userToDelete.name}</strong>{' '}
              ({userToDelete.email})? O acesso dele ao painel será cancelado imediatamente.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 bg-[#1A1E26] border border-[#282E3A] text-[#9CA3AF] hover:text-[#F4F1EA] text-xs font-['Space_Grotesk'] rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase font-['Space_Grotesk'] rounded-lg transition-colors"
              >
                Sim, Remover Usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
