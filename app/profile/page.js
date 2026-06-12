'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Lock, User, Shield, Briefcase, Phone, CardText, CheckCircle2, AlertCircle, ArrowLeft, Key } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  
  // User Session
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        throw new Error('Não autenticado.');
      }
      const data = await res.json();
      setProfile(data.user);
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword.length < 6) {
      setPassError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('A nova senha e a confirmação não coincidem.');
      return;
    }

    setPassLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao alterar a senha.');
      }

      setPassSuccess('Sua senha foi alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(err.message);
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-ipe-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const handleGoBack = () => {
    if (profile?.role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/portal');
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-12">
      {/* Top Navbar */}
      <nav className="glass-header sticky top-0 z-30 w-full px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoBack}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Image
              src="/logoH.png"
              alt="Ipê Labor"
              width={140}
              height={40}
              className="h-9 w-auto object-contain"
            />
            <span className="hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Perfil
            </span>
          </div>
        </div>

        <button
          onClick={handleGoBack}
          className="text-xs font-semibold text-white bg-ipe-green-600 hover:bg-ipe-green-700 px-4 py-2 rounded-xl transition-all shadow-sm"
        >
          Ir para o Painel
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Panel: Profile Info Card */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-ipe-green-500 shadow-md">
              <img
                src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={profile?.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            <h2 className="mt-4 text-xl font-bold text-slate-800">{profile?.name}</h2>
            <p className="text-sm text-slate-500">{profile?.email}</p>
            
            <span className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              profile?.role === 'ADMIN' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-ipe-green-100 text-ipe-green-800 border border-ipe-green-200'
            }`}>
              <Shield className="w-3.5 h-3.5" />
              {profile?.role === 'ADMIN' ? 'Administrador' : 'Contador Parceiro'}
            </span>

            <div className="w-full border-t border-slate-100 my-6"></div>

            <div className="w-full space-y-4 text-left text-sm">
              <div className="flex items-center gap-3">
                <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium leading-none">Empresa</p>
                  <p className="text-slate-700 font-semibold mt-0.5">{profile?.companyName || 'Não Informada'}</p>
                </div>
              </div>

              {profile?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-medium leading-none">Telefone</p>
                    <p className="text-slate-700 font-semibold mt-0.5">{profile?.phone}</p>
                  </div>
                </div>
              )}

              {profile?.cpfCnpj && (
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 text-slate-400 font-bold shrink-0 text-center text-xs">ID</span>
                  <div>
                    <p className="text-xs text-slate-400 font-medium leading-none">CPF / CNPJ</p>
                    <p className="text-slate-700 font-semibold mt-0.5">{profile?.cpfCnpj}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Change Password Card */}
          <div className="flex-[2] bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
              <div className="p-2 bg-ipe-green-50 rounded-lg text-ipe-green-600">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Alterar Senha</h3>
                <p className="text-xs text-slate-500">Mantenha sua conta segura trocando sua senha periodicamente.</p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passSuccess && (
                <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-emerald-800 font-medium leading-5">{passSuccess}</span>
                </div>
              )}

              {passError && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-200 flex items-start gap-3 animate-pulse">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700 font-medium leading-5">{passError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Senha Atual
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-slate-900 text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Nova Senha
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-slate-900 text-sm transition-all"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Confirmar Nova Senha
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-slate-900 text-sm transition-all"
                    placeholder="Confirme sua nova senha"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-ipe-green-600 hover:bg-ipe-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ipe-green-500 disabled:opacity-50 transition-colors"
                >
                  {passLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
