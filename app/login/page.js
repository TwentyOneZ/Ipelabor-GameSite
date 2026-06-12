'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Forgot Password Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocorreu um erro ao realizar o login.');
      }

      // Successful login
      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/portal');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ocorreu um erro ao enviar e-mail.');
      }

      setForgotSuccess(
        'E-mail de redefinição enviado! Verifique o console do servidor para acessar o link simulado.'
      );
      setForgotEmail('');
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-tr from-ipe-green-950 via-ipe-green-900 to-slate-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-ipe-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-ipe-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 translate-x-1/2 translate-y-1/2"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-slate-100 sm:px-10">
          <div className="mb-6 flex flex-col items-center text-center">
            <Image
              src="/logoS.png"
              alt="Logo Ipê Labor"
              width={260}
              height={100}
              className="w-[260px] h-auto object-contain mix-blend-multiply"
              priority
            />
            <h2 className="mt-4 text-center text-2xl font-black text-slate-800 tracking-tight">
              Portal do Contador Parceiro
            </h2>
            <p className="mt-1 text-center text-xs text-slate-500 font-semibold">
              Medicina & Segurança do Trabalho corporativa
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="rounded-lg bg-red-50 p-4 border border-red-200 flex items-start gap-3 animate-pulse">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <span className="text-sm text-red-700 font-medium leading-5">{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                E-mail Corporativo
              </label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 h-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-slate-900 text-sm transition-all"
                  placeholder="exemplo@contabilidade.com.br"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Senha
              </label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 h-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-slate-900 text-sm transition-all"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotModalOpen(true);
                    setForgotSuccess('');
                    setForgotError('');
                  }}
                  className="font-medium text-ipe-green-600 hover:text-ipe-green-700 transition-colors"
                >
                  Esqueceu sua senha?
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-ipe-green-600 hover:bg-ipe-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ipe-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg active:scale-[0.98]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    Acessar o Portal
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 overflow-hidden transform transition-all duration-300 scale-100">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Recuperação de Senha</h3>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-semibold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleForgotPassword} className="p-6 space-y-4">
              <p className="text-sm text-slate-600">
                Insira o seu e-mail cadastrado. Enviaremos um link seguro para você redefinir sua senha.
              </p>

              {forgotSuccess && (
                <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-emerald-800 font-medium leading-5">{forgotSuccess}</span>
                </div>
              )}

              {forgotError && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <span className="text-xs text-red-700 font-medium leading-5">{forgotError}</span>
                </div>
              )}

              <div>
                <label htmlFor="forgot-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  E-mail do Contador
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="mt-1.5 block w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-slate-900 text-sm"
                  placeholder="nome@contabilidade.com"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-4 py-2 text-sm font-semibold text-white bg-ipe-green-600 hover:bg-ipe-green-700 rounded-xl shadow-sm disabled:opacity-50 transition-colors"
                >
                  {forgotLoading ? 'Enviando...' : 'Enviar Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
