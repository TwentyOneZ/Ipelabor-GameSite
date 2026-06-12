'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Trophy,
  TrendingUp,
  Coins,
  Award,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Crown,
  LogOut,
  PlusCircle,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Info,
  Lock,
  Unlock,
  MessageSquare,
  User,
  Shield,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AccountantPortal() {
  const router = useRouter();

  // Dashboard Data
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isCtaModalOpen, setIsCtaModalOpen] = useState(false);

  // Selected Achievement Detail (for info modal/tooltip on mobile)
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/accountant/dashboard');
      if (!res.ok) {
        throw new Error('Não autorizado.');
      }
      const result = await res.json();
      setData(result);
      
      // Fire confetti celebration if they have unlocked achievements or reached a high level!
      if (result.metrics.activeClients > 0) {
        setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#10b981', '#f59e0b', '#ffffff']
          });
        }, 800);
      }
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const triggerManualConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#3b82f6']
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-ipe-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Carregando painel do parceiro...</p>
        </div>
      </div>
    );
  }

  const profile = data?.profile;
  const metrics = data?.metrics;
  const gamification = data?.gamification;
  const milestones = data?.milestones || [];
  const achievements = data?.achievements || [];
  const statement = data?.statement || [];

  // Icon mapping helper for achievements
  const renderBadgeIcon = (iconName, unlocked) => {
    const iconClass = `w-8 h-8 ${unlocked ? 'text-ipe-yellow-600' : 'text-slate-400'}`;
    switch (iconName) {
      case 'ShieldCheck':
        return <ShieldCheck className={iconClass} />;
      case 'Trophy':
        return <Trophy className={iconClass} />;
      case 'Award':
        return <Award className={iconClass} />;
      case 'RotateCcw':
        return <RotateCcw className={iconClass} />;
      case 'Sparkles':
        return <Sparkles className={iconClass} />;
      case 'Crown':
        return <Crown className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  return (
    <div className="flex-1 bg-slate-50 min-h-screen pb-16">
      
      {/* Top Header Navbar */}
      <nav className="glass-header sticky top-0 z-30 w-full px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Image
            src="/logoH.png"
            alt="Ipê Labor Logo"
            width={130}
            height={37}
            className="h-8 w-auto object-contain"
          />
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded bg-ipe-green-50 text-ipe-green-800 border border-ipe-green-100">
            Parceiro
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/profile')}
            className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-ipe-green-700 bg-slate-100 hover:bg-slate-200/80 px-3 py-2 rounded-xl transition-all"
          >
            <User className="w-3.5 h-3.5" />
            Minha Senha
          </button>
          
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sair do Portal"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Profile Card & Counter Badges */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 flex flex-col lg:flex-row justify-between items-center gap-6 relative overflow-hidden">
          {/* Decorative Background Icon */}
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 opacity-5 pointer-events-none">
            <Image
              src="/TreeIcon.png"
              alt="Tree Icon bg"
              width={256}
              height={256}
              className="object-contain"
            />
          </div>

          {/* User Profile Info */}
          <div className="flex flex-col sm:flex-row items-center gap-5 w-full lg:w-auto text-center sm:text-left">
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-ipe-green-500 shadow-md shrink-0">
              <img
                src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={profile?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seja bem-vindo(a),</p>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-0.5">{profile?.name}</h1>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {profile?.companyName} • CNPJ: {profile?.cpfCnpj || 'Não Informado'}
              </p>
            </div>
          </div>

          {/* Core Counters */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full lg:w-auto shrink-0">
            {/* Clientes 12m */}
            <div className="bg-ipe-green-50/50 border border-ipe-green-100 rounded-2xl p-4 flex items-center gap-3.5 hover-lift">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-ipe-green-600 shrink-0">
                <Image
                  src="/TreeIcon.png"
                  alt="Tree Icon"
                  width={32}
                  height={32}
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Clientes (12m)</p>
                <p className="text-xl font-black text-ipe-green-800 mt-1">{metrics?.activeClients}</p>
              </div>
            </div>

            {/* Comissões a Receber */}
            <div className="bg-ipe-yellow-50/40 border border-ipe-yellow-100 rounded-2xl p-4 flex items-center gap-3.5 hover-lift">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-ipe-yellow-600 shrink-0">
                <Coins className="w-6 h-6 text-ipe-yellow-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">A Receber</p>
                <p className="text-lg font-black text-ipe-yellow-800 mt-1">
                  R$ {metrics?.pendingCommissions.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA: Indicar Novo Cliente */}
        <div className="bg-gradient-to-r from-ipe-green-800 to-ipe-green-950 rounded-2xl shadow-md p-6 text-white flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-xl font-extrabold flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-5 h-5 text-ipe-yellow-500 animate-bounce" />
              Indique um Novo Cliente e Aumente seus Ganhos!
            </h2>
            <p className="text-xs text-emerald-100 font-medium">
              Envie contatos empresariais para nossa equipe. Cada contrato fechado gera comissões recorrentes.
            </p>
          </div>
          <button
            onClick={() => setIsCtaModalOpen(true)}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-ipe-yellow-500 hover:bg-ipe-yellow-600 text-ipe-green-950 font-bold text-sm px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            Indicar Novo Cliente
          </button>
        </div>

        {/* Dash Grid Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Tiers and Milestones (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Gamification Level Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 leading-none">Seu Nível de Parceria</h3>
                  <p className="text-xs text-slate-400 mt-1">Sua comissão aumenta à medida que seu volume de clientes cresce.</p>
                </div>
                <span className="inline-flex px-3 py-1 rounded-full text-xs font-black uppercase bg-ipe-yellow-100 text-ipe-yellow-800 border border-ipe-yellow-200">
                  {gamification?.level}
                </span>
              </div>

              {/* Progress bar container */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Clientes: {metrics?.activeClients}</span>
                  <span>{gamification?.nextTierName ? `Próximo: ${gamification.nextTierName}` : 'Nível Máximo!'}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-ipe-green-500 to-ipe-yellow-500 h-full rounded-full animate-progress"
                    style={{ width: `${gamification?.progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Explanatory text */}
              <div className="bg-slate-50 rounded-2xl p-4 flex gap-3 border border-slate-100 items-start">
                <Info className="w-5 h-5 text-ipe-green-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  {gamification?.nextTierCopy}
                </p>
              </div>

              {/* Reward list preview */}
              <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-medium text-slate-500">
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                  <p className="text-slate-400">Comissão Pacotes (PGR, etc.)</p>
                  <p className="text-sm font-black text-slate-700 mt-1">
                    R$ {gamification?.currentTierRates.package.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                  <p className="text-slate-400">Comissão Vida (NR-01)</p>
                  <p className="text-sm font-black text-slate-700 mt-1">
                    R$ {gamification?.currentTierRates.life.toFixed(2).replace('.', ',')}/vida
                  </p>
                </div>
              </div>
            </div>

            {/* Placar de Benefícios Timeline */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-800 leading-none">Benefícios para Sua Contabilidade</h3>
                <p className="text-xs text-slate-400 mt-1">Unlocks corporativos baseados na quantidade de clientes que você mantém ativos.</p>
              </div>

              {/* Vertical Timeline */}
              <div className="relative pl-6 space-y-8">
                {/* Timeline vertical bar */}
                <div className="absolute left-2.5 top-2 bottom-2 w-1.5 timeline-line rounded-full"></div>

                {milestones.map((milestone) => (
                  <div key={milestone.id} className="relative flex items-start gap-4">
                    {/* Node indicator */}
                    <div className={`absolute -left-[23px] w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-sm ${
                      milestone.unlocked
                        ? 'bg-ipe-green-500 border-white text-white'
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}>
                      {milestone.unlocked ? (
                        <CheckCircle2 className="w-4 h-4 fill-current" />
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black px-2 py-0.5 rounded ${
                          milestone.unlocked
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {milestone.clients} Clientes
                        </span>
                        <h4 className={`text-sm font-bold ${
                          milestone.unlocked ? 'text-slate-800' : 'text-slate-500'
                        }`}>
                          {milestone.reward}
                        </h4>
                      </div>
                      <p className={`text-xs mt-1 leading-relaxed ${
                        milestone.unlocked ? 'text-slate-600' : 'text-slate-400 font-medium'
                      }`}>
                        {milestone.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Achievements & Financial Statements (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Achievements Grid (Badges) */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-5">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 leading-none">Minhas Medalhas</h3>
                  <p className="text-xs text-slate-400 mt-1">Conquistas desbloqueadas de acordo com seu desempenho.</p>
                </div>
                <button
                  onClick={triggerManualConfetti}
                  className="text-[11px] font-bold text-ipe-green-600 hover:text-ipe-green-700 hover:underline"
                >
                  Comemorar! 🎉
                </button>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-3 gap-4">
                {achievements.map((badge) => (
                  <button
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                      badge.unlocked
                        ? 'bg-slate-50/50 border-slate-200 hover:bg-slate-50 hover:border-slate-300 scale-100 hover:scale-[1.03] active:scale-[0.98]'
                        : 'bg-slate-100/50 border-slate-100 opacity-60 cursor-pointer'
                    }`}
                    title={badge.title}
                  >
                    <div className={`p-2.5 rounded-2xl mb-2 flex items-center justify-center shadow-sm ${
                      badge.unlocked
                        ? 'bg-gradient-to-tr from-ipe-yellow-500/20 to-ipe-yellow-500/10 border border-ipe-yellow-300/30'
                        : 'bg-slate-200/50 border border-slate-200'
                    }`}>
                      {renderBadgeIcon(badge.icon, badge.unlocked)}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 truncate w-full">
                      {badge.title}
                    </span>
                    <span className={`text-[8px] font-bold mt-1 px-1 rounded-sm ${
                      badge.unlocked ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {badge.unlocked ? 'Liberada' : 'Bloqueada'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Statement (Extrato Financeiro) */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 leading-none">Extrato Financeiro</h3>
                <p className="text-xs text-slate-400 mt-1">Histórico de comissões ganhas por vendas ou renovações.</p>
              </div>

              {/* Statement List */}
              {statement.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-10">Nenhuma comissão registrada ainda.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {statement.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 border border-slate-100 rounded-2xl flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors text-xs"
                    >
                      <div className="space-y-1">
                        <p className="font-bold text-slate-800">{item.clientName}</p>
                        <p className="text-[10px] text-slate-400">
                          {item.serviceType}{' '}
                          {item.isRenewal && (
                            <span className="bg-amber-50 text-amber-700 font-extrabold text-[8px] px-1 rounded">
                              RENOV
                            </span>
                          )}
                        </p>
                        <p className="text-[9px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>

                      <div className="text-right space-y-1.5">
                        <p className="font-extrabold text-slate-800 text-sm">
                          R$ {item.value.toFixed(2).replace('.', ',')}
                        </p>
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                          item.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {item.status === 'PAID' ? 'Pago' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* CTA Modal: Indicar Novo Cliente */}
      {isCtaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-ipe-green-600" />
                Como Indicar um Cliente
              </h3>
              <button
                type="button"
                onClick={() => setIsCtaModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Para registrar uma nova indicação e garantir seu comissionamento no portal, siga os passos abaixo:
                </p>

                {/* Steps */}
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-7 h-7 bg-ipe-green-50 text-ipe-green-700 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border border-ipe-green-100">
                      1
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                      Fale com o cliente e apresente a <strong>Ipê Labor</strong> como solução ideal para exames médicos (ASO), PGR, LTCAT e assessorias.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-7 h-7 bg-ipe-green-50 text-ipe-green-700 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border border-ipe-green-100">
                      2
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                      Envie o contato do cliente diretamente para a nossa equipe comercial através do WhatsApp ou e-mail corporativo.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-7 h-7 bg-ipe-green-50 text-ipe-green-700 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border border-ipe-green-100">
                      3
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                      <strong>Importante:</strong> Ao fazer o contato, mencione que a indicação partiu de <strong>{profile?.companyName}</strong> para vincularmos a venda ao seu painel.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Contatos Diretos do Comercial</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/553532111000?text=Olá,%20gostaria%20de%20indicar%20um%20cliente%20de%20medicina%20e%20segurança%20do%20trabalho.%20Minha%20contabilidade:%20${encodeURIComponent(profile?.companyName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    Enviar via WhatsApp
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:comercial@ipelabor.com.br?subject=Indicação de Cliente - ${encodeURIComponent(profile?.companyName)}&body=Olá equipe comercial Ipê Labor, %0D%0A%0D%0AGostaria de indicar o seguinte cliente para cotação: %0D%0A%0D%0A- Nome da empresa: %0D%0A- Responsável: %0D%0A- Telefone: %0D%0A%0D%0AAtenciosamente,%0D%0A${encodeURIComponent(profile?.name)}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow transition-colors"
                  >
                    comercial@ipelabor.com.br
                  </a>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsCtaModalOpen(false)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-100 overflow-hidden transform transition-all duration-300 scale-100 p-6 space-y-4">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className={`p-4 rounded-3xl shadow-md ${
                selectedBadge.unlocked
                  ? 'bg-gradient-to-tr from-ipe-yellow-500/20 to-ipe-yellow-500/10 border border-ipe-yellow-300/30'
                  : 'bg-slate-100 border border-slate-200'
              }`}>
                {renderBadgeIcon(selectedBadge.icon, selectedBadge.unlocked)}
              </div>
              <h3 className="text-lg font-bold text-slate-800">{selectedBadge.title}</h3>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                selectedBadge.unlocked ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}>
                {selectedBadge.unlocked ? 'Medalha Conquistada' : 'Medalha Bloqueada'}
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">{selectedBadge.description}</p>

              {selectedBadge.unlocked && selectedBadge.date && (
                <p className="text-[10px] text-slate-400 font-bold">
                  Desbloqueada em: {new Date(selectedBadge.date + 'T12:00:00').toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setSelectedBadge(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
