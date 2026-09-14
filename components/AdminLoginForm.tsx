'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { login, AuthSession } from '@/lib/auth-store';
import { getStoredSiteConfig } from '@/lib/site-config-store';

interface AdminLoginFormProps {
  onLoginSuccess: (session: AuthSession) => void;
}

export function AdminLoginForm({ onLoginSuccess }: AdminLoginFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/diamond-relics-logo.png');

  useEffect(() => {
    const cfg = getStoredSiteConfig();
    if (cfg.customLogoUrl) {
      setLogoUrl(cfg.customLogoUrl);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Por favor, informe seu e-mail ou nome de usuário.');
      return;
    }

    if (!password) {
      setErrorMsg('Por favor, digite a sua senha.');
      return;
    }

    setIsLoading(true);

    // Simulação leve de resposta para feedback suave
    setTimeout(() => {
      const result = login(identifier, password);
      setIsLoading(false);

      if (result.success && result.session) {
        onLoginSuccess(result.session);
      } else {
        setErrorMsg(result.message);
      }
    }, 350);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#08090B]">
      {/* Luz ambiente dourada decorativa de fundo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#f2ca50]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-[#f2ca50]/3 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Emblema & Cabeçalho */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <img
              src={logoUrl || '/diamond-relics-logo.png'}
              alt="Diamond Relics"
              className="h-20 sm:h-24 w-auto object-contain drop-shadow-[0_0_25px_rgba(242,202,80,0.35)]"
            />
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
            <span className="text-[11px] font-['Space_Grotesk'] tracking-[0.2em] text-[#f2ca50] uppercase font-bold">
              Painel de Gestão Restrito
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-['Playfair_Display'] font-bold text-[#F4F1EA] tracking-wide">
            Autenticação de Segurança
          </h2>

          <p className="text-xs font-['Manrope'] text-[#9CA3AF] max-w-sm mx-auto leading-relaxed">
            Entre com suas credenciais de Administrador ou Operador autorizado para gerenciar acervo, pedidos e operadores.
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-[#12151B] border border-[#282E3A] rounded-xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-sm">
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-xs font-['Space_Grotesk'] flex items-start gap-2.5 animate-fadeIn">
              <span className="material-symbols-outlined text-base text-red-400 shrink-0 mt-0.5">
                error
              </span>
              <div className="flex-1 leading-snug">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo E-mail / Usuário */}
            <div className="space-y-1.5">
              <label className="text-xs font-['Space_Grotesk'] text-[#F4F1EA] font-semibold block">
                E-mail ou Usuário
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-base">
                  account_circle
                </span>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  autoComplete="username"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#08090B] border border-[#282E3A] rounded-lg text-xs font-['Space_Grotesk'] text-[#F4F1EA] placeholder-[#6B7280] focus:outline-none focus:border-[#f2ca50] transition-colors"
                />
              </div>
            </div>

            {/* Campo Senha */}
            <div className="space-y-1.5">
              <label className="text-xs font-['Space_Grotesk'] text-[#F4F1EA] font-semibold block flex items-center justify-between">
                <span>Senha de Acesso</span>
                <span className="text-[10px] text-[#9CA3AF] font-normal">Criptografia SHA-256</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-base">
                  lock
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 bg-[#08090B] border border-[#282E3A] rounded-lg text-xs font-['Space_Grotesk'] text-[#F4F1EA] placeholder-[#6B7280] focus:outline-none focus:border-[#f2ca50] transition-colors tracking-wider"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#F4F1EA] transition-colors p-1"
                  title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  <span className="material-symbols-outlined text-sm">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Botão de Submeter Login */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#f2ca50] hover:bg-[#E5C875] disabled:opacity-50 text-[#08090B] font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_4px_14px_rgba(242,202,80,0.25)] hover:shadow-[0_6px_20px_rgba(242,202,80,0.35)] flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#08090B] border-t-transparent rounded-full animate-spin"></span>
                  <span>Verificando Credenciais...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">login</span>
                  <span>Acessar Painel da Loja</span>
                </>
              )}
            </button>
          </form>
        </div>


        {/* Rodapé do Login: Voltar para a Loja & Segurança */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-['Space_Grotesk'] text-[#9CA3AF] gap-3 px-2">
          <Link
            href="/"
            className="hover:text-[#f2ca50] transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Voltar para a Vitrine da Loja
          </Link>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="material-symbols-outlined text-sm text-[#f2ca50]">verified_user</span>
            <span>Criptografia SHA-256</span>
          </div>
        </div>
      </div>
    </div>
  );
}
