'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Lock, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Token de redefinição ausente. Solicite um novo link.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Token inválido ou ausente.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao redefinir a senha.');
      }

      setSuccess('Sua senha foi redefinida com sucesso! Redirecionando para o login...');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-lg bg-red-50 p-4 border border-red-200 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span className="text-sm text-red-700 font-medium leading-5">{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <span className="text-sm text-emerald-700 font-medium leading-5">{success}</span>
        </div>
      )}

      {!success && (
        <>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              Nova Senha
            </label>
            <div className="mt-1.5 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 h-5 text-slate-400" aria-hidden="true" />
              </div>
              <input
                id="password"
                type="password"
                required
                disabled={!token}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-slate-900 text-sm transition-all"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-semibold text-slate-700">
              Confirmar Nova Senha
            </label>
            <div className="mt-1.5 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 h-5 text-slate-400" aria-hidden="true" />
              </div>
              <input
                id="confirm-password"
                type="password"
                required
                disabled={!token}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-slate-900 text-sm transition-all"
                placeholder="Confirme sua nova senha"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-ipe-green-600 hover:bg-ipe-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ipe-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Salvar Nova Senha'
              )}
            </button>
          </div>
        </>
      )}

      <div className="text-center pt-2">
        <a
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Login
        </a>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-tr from-ipe-green-950 via-ipe-green-900 to-slate-950 min-h-screen relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-ipe-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-ipe-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 translate-x-1/2 translate-y-1/2"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <Image
            src="/logoH.png"
            alt="Logo Ipê Labor"
            width={240}
            height={68}
            className="h-16 w-auto object-contain drop-shadow-md"
            priority
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Definir Nova Senha
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl border border-slate-100 sm:px-10">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <div className="w-8 h-8 border-4 border-ipe-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-slate-500 font-medium">Verificando informações...</p>
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
