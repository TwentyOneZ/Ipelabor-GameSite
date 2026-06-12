'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Download,
  Check,
  Clock,
  User,
  Shield,
  Activity,
  FileSpreadsheet,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Percent,
  Search,
  UserPlus
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();

  // Active Tab: 'overview', 'accountants', 'sales'
  const [activeTab, setActiveTab] = useState('overview');

  // Auth/Session State
  const [adminUser, setAdminUser] = useState(null);

  // Accountants Data
  const [accountants, setAccountants] = useState([]);
  const [loadingAccs, setLoadingAccs] = useState(true);
  const [accSearch, setAccSearch] = useState('');

  // Sales Data
  const [sales, setSales] = useState([]);
  const [loadingSales, setLoadingSales] = useState(true);

  // Form states - Accountant CRUD
  const [accFormId, setAccFormId] = useState(null); // null = create, id = edit
  const [accName, setAccName] = useState('');
  const [accEmail, setAccEmail] = useState('');
  const [accPassword, setAccPassword] = useState('');
  const [accCompanyName, setAccCompanyName] = useState('');
  const [accPhone, setAccPhone] = useState('');
  const [accCpfCnpj, setAccCpfCnpj] = useState('');
  const [accStatus, setAccStatus] = useState('ACTIVE');
  const [accFormError, setAccFormError] = useState('');
  const [accFormSuccess, setAccFormSuccess] = useState('');

  // Form states - Sale Recording
  const [saleAccountantId, setSaleAccountantId] = useState('');
  const [saleClientName, setSaleClientName] = useState('');
  const [saleClientCnpj, setSaleClientCnpj] = useState('');
  const [saleServiceType, setSaleServiceType] = useState('PGR/LTCAT');
  const [saleValue, setSaleValue] = useState('');
  const [saleLivesCount, setSaleLivesCount] = useState('');
  const [saleIsRenewal, setSaleIsRenewal] = useState(false);
  const [saleDate, setSaleDate] = useState('');
  const [saleFormError, setSaleFormError] = useState('');
  const [saleFormSuccess, setSaleFormSuccess] = useState('');
  const [saleFormLoading, setSaleFormLoading] = useState(false);

  useEffect(() => {
    fetchSession();
    fetchAccountants();
    fetchSales();
  }, []);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error('Não autenticado');
      const data = await res.json();
      if (data.user.role !== 'ADMIN') {
        router.push('/portal');
      } else {
        setAdminUser(data.user);
      }
    } catch (err) {
      router.push('/login');
    }
  };

  const fetchAccountants = async () => {
    setLoadingAccs(true);
    try {
      const res = await fetch('/api/admin/accountants');
      const data = await res.json();
      if (res.ok) {
        setAccountants(data.accountants);
      }
    } catch (err) {
      console.error('Error fetching accountants:', err);
    } finally {
      setLoadingAccs(false);
    }
  };

  const fetchSales = async () => {
    setLoadingSales(true);
    try {
      const res = await fetch('/api/admin/sales');
      const data = await res.json();
      if (res.ok) {
        setSales(data.sales);
      }
    } catch (err) {
      console.error('Error fetching sales:', err);
    } finally {
      setLoadingSales(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Create or Update Accountant
  const handleAccSubmit = async (e) => {
    e.preventDefault();
    setAccFormError('');
    setAccFormSuccess('');

    const url = accFormId ? `/api/admin/accountants/${accFormId}` : '/api/admin/accountants';
    const method = accFormId ? 'PUT' : 'POST';

    // Password is required for create, optional for edit
    if (!accFormId && !accPassword) {
      setAccFormError('Senha é obrigatória para novas contas.');
      return;
    }

    const body = {
      name: accName,
      email: accEmail,
      companyName: accCompanyName,
      phone: accPhone,
      cpfCnpj: accCpfCnpj,
      status: accStatus,
    };

    if (accPassword) {
      body.password = accPassword;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar contador.');
      }

      setAccFormSuccess(accFormId ? 'Contador atualizado com sucesso!' : 'Contador criado com sucesso!');
      clearAccForm();
      fetchAccountants();
    } catch (err) {
      setAccFormError(err.message);
    }
  };

  // Edit accountant trigger
  const handleEditAcc = (acc) => {
    setAccFormId(acc.id);
    setAccName(acc.name);
    setAccEmail(acc.email);
    setAccPassword(''); // Reset password input
    setAccCompanyName(acc.companyName === 'N/A' ? '' : acc.companyName);
    setAccPhone(acc.phone === 'N/A' ? '' : acc.phone);
    setAccCpfCnpj(acc.cpfCnpj === 'N/A' ? '' : acc.cpfCnpj);
    setAccStatus(acc.status);
    setActiveTab('accountants');
    setAccFormError('');
    setAccFormSuccess('');
  };

  // Delete Accountant
  const handleDeleteAcc = async (id) => {
    if (!confirm('Deseja realmente remover este contador? Todas as vendas e comissões associadas serão perdidas permanentemente.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/accountants/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao remover contador.');
      }

      fetchAccountants();
      fetchSales(); // Sales are deleted on cascade
    } catch (err) {
      alert(err.message);
    }
  };

  const clearAccForm = () => {
    setAccFormId(null);
    setAccName('');
    setAccEmail('');
    setAccPassword('');
    setAccCompanyName('');
    setAccPhone('');
    setAccCpfCnpj('');
    setAccStatus('ACTIVE');
  };

  // Submit Sale Recording
  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    setSaleFormError('');
    setSaleFormSuccess('');
    setSaleFormLoading(true);

    if (!saleAccountantId) {
      setSaleFormError('Selecione um contador parceiro.');
      setSaleFormLoading(false);
      return;
    }

    if (saleServiceType === 'NR-01' && (!saleLivesCount || parseInt(saleLivesCount) <= 0)) {
      setSaleFormError('Para o serviço NR-01, a quantidade de vidas é obrigatória e deve ser maior que zero.');
      setSaleFormLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountantId: parseInt(saleAccountantId),
          clientName: saleClientName,
          clientCnpj: saleClientCnpj,
          serviceType: saleServiceType,
          value: parseFloat(saleValue),
          livesCount: saleServiceType === 'NR-01' ? parseInt(saleLivesCount) : 0,
          isRenewal: saleIsRenewal,
          saleDate: saleDate || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao registrar venda.');
      }

      setSaleFormSuccess(`Venda registrada com sucesso! Comissão calculada: R$ ${data.commissionValue.toFixed(2).replace('.', ',')} (${data.calculatedTier}).`);
      
      // Clear fields
      setSaleClientName('');
      setSaleClientCnpj('');
      setSaleValue('');
      setSaleLivesCount('');
      setSaleIsRenewal(false);
      setSaleDate('');

      fetchSales();
      fetchAccountants();
    } catch (err) {
      setSaleFormError(err.message);
    } finally {
      setSaleFormLoading(false);
    }
  };

  // Toggle commission payment status
  const handleToggleCommission = async (commId, currentStatus) => {
    const nextStatus = currentStatus === 'PENDING' ? 'PAID' : 'PENDING';
    
    try {
      const res = await fetch(`/api/admin/commissions/${commId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao atualizar pagamento.');
      }

      fetchSales();
      fetchAccountants();
    } catch (err) {
      alert(err.message);
    }
  };

  // Export report to Excel
  const handleExportXLSX = () => {
    window.open('/api/admin/export', '_blank');
  };

  // Filter accountants by search term
  const filteredAccountants = accountants.filter(
    (acc) =>
      acc.name.toLowerCase().includes(accSearch.toLowerCase()) ||
      acc.companyName.toLowerCase().includes(accSearch.toLowerCase()) ||
      acc.email.toLowerCase().includes(accSearch.toLowerCase())
  );

  // General Metrics
  const totalAccountants = accountants.length;
  const totalActiveClients = accountants.reduce((sum, acc) => sum + acc.activeClients, 0);
  const totalPaidCommissions = accountants.reduce((sum, acc) => sum + acc.paidCommissions, 0);
  const totalPendingCommissions = accountants.reduce((sum, acc) => sum + acc.pendingCommissions, 0);

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-800">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-ipe-green-950 text-white flex flex-col justify-between p-6 shrink-0 border-r border-ipe-green-900 z-20">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex justify-center md:justify-start">
            <Image
              src="/logoH.png"
              alt="Ipê Labor Logo"
              width={160}
              height={45}
              className="h-10 w-auto object-contain brightness-0 invert"
            />
          </div>

          {/* User badge */}
          <div className="bg-ipe-green-900/60 p-4 rounded-2xl flex items-center gap-3 border border-ipe-green-800">
            <div className="w-10 h-10 rounded-full bg-ipe-yellow-500 flex items-center justify-center font-bold text-ipe-green-950 text-lg shadow-inner shrink-0">
              {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate leading-tight">{adminUser?.name || 'Administrador'}</p>
              <p className="text-xs text-emerald-300 font-medium leading-none mt-1">Admin TI</p>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-ipe-yellow-500 text-ipe-green-950 shadow-md scale-[1.02]'
                  : 'text-emerald-100 hover:bg-ipe-green-900/40 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('accountants')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'accountants'
                  ? 'bg-ipe-yellow-500 text-ipe-green-950 shadow-md scale-[1.02]'
                  : 'text-emerald-100 hover:bg-ipe-green-900/40 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              Gestão de Contadores
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'sales'
                  ? 'bg-ipe-yellow-500 text-ipe-green-950 shadow-md scale-[1.02]'
                  : 'text-emerald-100 hover:bg-ipe-green-900/40 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Lançamento de Vendas
            </button>
          </nav>
        </div>

        {/* Footer actions */}
        <div className="space-y-3 pt-6 border-t border-ipe-green-900 mt-8">
          <button
            onClick={() => router.push('/profile')}
            className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-emerald-200 hover:text-white hover:bg-ipe-green-900/30 rounded-lg transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            Meu Perfil / Senha
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-200 hover:text-red-100 hover:bg-red-950/40 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair do Portal
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        
        {/* TAB 1: VISÃO GERAL */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Painel Administrativo</h1>
                <p className="text-sm text-slate-500">Monitore os parceiros e a evolução de indicações corporativas.</p>
              </div>
              <button
                onClick={handleExportXLSX}
                className="flex items-center gap-2 bg-ipe-green-600 hover:bg-ipe-green-700 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-md transition-all active:scale-95 hover:shadow-lg"
              >
                <Download className="w-4 h-4" />
                Exportar Relatório (XLSX)
              </button>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 hover-lift">
                <div className="p-3 bg-ipe-green-50 text-ipe-green-600 rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contadores</p>
                  <p className="text-2xl font-black text-slate-800 mt-0.5">{totalAccountants}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 hover-lift">
                <div className="p-3 bg-ipe-yellow-50 text-ipe-yellow-600 rounded-2xl">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clientes (12m)</p>
                  <p className="text-2xl font-black text-slate-800 mt-0.5">{totalActiveClients}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 hover-lift">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">A Pagar</p>
                  <p className="text-xl font-black text-red-600 mt-0.5">
                    R$ {totalPendingCommissions.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex items-center gap-4 hover-lift">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pagas</p>
                  <p className="text-xl font-black text-emerald-600 mt-0.5">
                    R$ {totalPaidCommissions.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </div>
            </div>

            {/* Overview Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg font-bold text-slate-800">Parceiros Registrados</h2>
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={accSearch}
                    onChange={(e) => setAccSearch(e.target.value)}
                    placeholder="Buscar contador..."
                    className="pl-9 pr-3 py-2 w-full text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500"
                  />
                </div>
              </div>

              {loadingAccs ? (
                <div className="flex flex-col items-center py-16 gap-3">
                  <div className="w-8 h-8 border-4 border-ipe-green-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500 font-semibold">Buscando contadores...</p>
                </div>
              ) : filteredAccountants.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-sm text-slate-500">Nenhum contador parceiro cadastrado ou encontrado.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Contador</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Clientes (12m)</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nível</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Comissão Pendente</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Comissão Paga</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {filteredAccountants.map((acc) => (
                        <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-ipe-green-100 text-ipe-green-800 font-bold flex items-center justify-center text-sm">
                                {acc.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{acc.name}</p>
                                <p className="text-xs text-slate-400 font-medium leading-none mt-1">{acc.companyName}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">
                            {acc.activeClients}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                              acc.level.includes('Diamante')
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : acc.level.includes('Ouro')
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : acc.level.includes('Bronze')
                                ? 'bg-orange-50 text-orange-700 border-orange-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                              {acc.level}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                            R$ {acc.pendingCommissions.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">
                            R$ {acc.paidCommissions.toFixed(2).replace('.', ',')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditAcc(acc)}
                                className="p-2 hover:bg-ipe-green-50 text-ipe-green-600 rounded-lg transition-colors"
                                title="Editar Contador"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAcc(acc.id)}
                                className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                title="Excluir Contador"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: GESTÃO DE CONTADORES */}
        {activeTab === 'accountants' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Gestão de Contadores</h1>
              <p className="text-sm text-slate-500">Crie, edite e configure as contas dos parceiros.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Form Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-1">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">
                  {accFormId ? 'Editar Parceiro' : 'Novo Contador Parceiro'}
                </h2>

                <form onSubmit={handleAccSubmit} className="space-y-4">
                  {accFormError && (
                    <div className="rounded-lg bg-red-50 p-4 border border-red-200 flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-red-700 font-semibold leading-relaxed">{accFormError}</span>
                    </div>
                  )}

                  {accFormSuccess && (
                    <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200 flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-emerald-700 font-semibold leading-relaxed">{accFormSuccess}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={accName}
                      onChange={(e) => setAccName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-sm text-slate-900"
                      placeholder="Ex: Pedro Alves"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase">E-mail de Login</label>
                    <input
                      type="email"
                      required
                      value={accEmail}
                      onChange={(e) => setAccEmail(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-sm text-slate-900"
                      placeholder="Ex: pedro@alvescontabil.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase">
                      Senha {accFormId && <span className="text-slate-400 font-normal">(deixe em branco para manter)</span>}
                    </label>
                    <input
                      type="password"
                      value={accPassword}
                      onChange={(e) => setAccPassword(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-sm text-slate-900"
                      placeholder={accFormId ? 'Nova senha opcional' : 'Mínimo 6 caracteres'}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase">Empresa de Contabilidade</label>
                    <input
                      type="text"
                      value={accCompanyName}
                      onChange={(e) => setAccCompanyName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-sm text-slate-900"
                      placeholder="Ex: Alves Contabilidade"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase">Telefone</label>
                      <input
                        type="text"
                        value={accPhone}
                        onChange={(e) => setAccPhone(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-sm text-slate-900"
                        placeholder="(35) 9999-9999"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase">CPF / CNPJ</label>
                      <input
                        type="text"
                        value={accCpfCnpj}
                        onChange={(e) => setAccCpfCnpj(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-sm text-slate-900"
                        placeholder="Cnpj ou CPF"
                      />
                    </div>
                  </div>

                  {accFormId && (
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase">Status da Conta</label>
                      <select
                        value={accStatus}
                        onChange={(e) => setAccStatus(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-sm text-slate-900"
                      >
                        <option value="ACTIVE">Ativo (Permitir Acesso)</option>
                        <option value="INACTIVE">Inativo (Bloquear Acesso)</option>
                      </select>
                    </div>
                  )}

                  <div className="pt-3 flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-ipe-green-600 hover:bg-ipe-green-700 transition-colors"
                    >
                      {accFormId ? 'Salvar Edições' : 'Criar Conta'}
                    </button>
                    {accFormId && (
                      <button
                        type="button"
                        onClick={clearAccForm}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold rounded-xl transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Table List Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2 overflow-hidden">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">
                  Lista de Contadores cadastrados
                </h2>
                
                {loadingAccs ? (
                  <div className="flex flex-col items-center py-12 gap-3">
                    <div className="w-8 h-8 border-4 border-ipe-green-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500 font-semibold">Carregando...</p>
                  </div>
                ) : accountants.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-10">Nenhum contador cadastrado.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Nome / Empresa</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">E-mail / Telefone</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {accountants.map((acc) => (
                          <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className="text-sm font-bold text-slate-800">{acc.name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{acc.companyName}</p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className="text-sm font-medium text-slate-700">{acc.email}</p>
                              <p className="text-xs text-slate-400 mt-0.5">{acc.phone}</p>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                                acc.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                              }`}>
                                {acc.status === 'ACTIVE' ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-xs">
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => handleEditAcc(acc)}
                                  className="p-1.5 hover:bg-ipe-green-50 text-ipe-green-600 rounded transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAcc(acc.id)}
                                  className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                                  title="Remover"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LANÇAMENTO DE VENDAS */}
        {activeTab === 'sales' && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Lançamento de Vendas</h1>
              <p className="text-sm text-slate-500">Vincule serviços contratados a contadores para gerar comissões.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Form Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-1">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">
                  Registrar Nova Venda
                </h2>

                <form onSubmit={handleSaleSubmit} className="space-y-4">
                  {saleFormError && (
                    <div className="rounded-lg bg-red-50 p-4 border border-red-200 flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-red-700 font-semibold leading-relaxed">{saleFormError}</span>
                    </div>
                  )}

                  {saleFormSuccess && (
                    <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200 flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-emerald-700 font-semibold leading-relaxed">{saleFormSuccess}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase">Contador Parceiro</label>
                    <select
                      required
                      value={saleAccountantId}
                      onChange={(e) => setSaleAccountantId(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-sm text-slate-900 bg-white"
                    >
                      <option value="">-- Selecione o Contador --</option>
                      {accountants
                        .filter((acc) => acc.status === 'ACTIVE')
                        .map((acc) => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({acc.companyName})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase">Nome do Cliente (Empresa)</label>
                    <input
                      type="text"
                      required
                      value={saleClientName}
                      onChange={(e) => setSaleClientName(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-sm text-slate-900"
                      placeholder="Ex: Indústria Mineira Ltda"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase">CNPJ do Cliente</label>
                      <input
                        type="text"
                        value={saleClientCnpj}
                        onChange={(e) => setSaleClientCnpj(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-sm text-slate-900"
                        placeholder="CNPJ Opcional"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase">Tipo de Serviço</label>
                      <select
                        value={saleServiceType}
                        onChange={(e) => setSaleServiceType(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-sm text-slate-900 bg-white"
                      >
                        <option value="PGR/LTCAT">PGR/LTCAT (Pacote Anual)</option>
                        <option value="NR-01">NR-01 (Assessoria)</option>
                        <option value="Plano de Ação">Plano de Ação</option>
                        <option value="PCMSO">PCMSO</option>
                        <option value="ASO">ASO Individual</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase">Valor do Contrato (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={saleValue}
                        onChange={(e) => setSaleValue(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-sm text-slate-900"
                        placeholder="Ex: 2500,00"
                      />
                    </div>

                    {/* Dynamic Field: Lives count, only visible if service type is NR-01 */}
                    {saleServiceType === 'NR-01' ? (
                      <div className="animate-fade-in">
                        <label className="block text-xs font-bold text-ipe-yellow-600 uppercase flex items-center gap-1">
                          Vidas (NR-01) *
                        </label>
                        <input
                          type="number"
                          required
                          value={saleLivesCount}
                          onChange={(e) => setSaleLivesCount(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-ipe-yellow-500 bg-amber-50/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-ipe-yellow-500 focus:border-ipe-yellow-500 text-sm text-slate-900 font-bold"
                          placeholder="Número de vidas"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase">Data da Venda</label>
                        <input
                          type="date"
                          value={saleDate}
                          onChange={(e) => setSaleDate(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-sm text-slate-900"
                        />
                      </div>
                    )}
                  </div>

                  {saleServiceType === 'NR-01' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400">Data da Venda</label>
                      <input
                        type="date"
                        value={saleDate}
                        onChange={(e) => setSaleDate(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-ipe-green-500 focus:border-ipe-green-500 text-sm text-slate-900"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 py-2">
                    <input
                      id="saleIsRenewal"
                      type="checkbox"
                      checked={saleIsRenewal}
                      onChange={(e) => setSaleIsRenewal(e.target.checked)}
                      className="w-4 h-4 text-ipe-green-600 focus:ring-ipe-green-500 border-slate-300 rounded"
                    />
                    <label htmlFor="saleIsRenewal" className="text-xs font-semibold text-slate-600 uppercase cursor-pointer">
                      Esta venda é uma Renovação
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={saleFormLoading}
                      className="w-full py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-ipe-green-600 hover:bg-ipe-green-700 disabled:opacity-50 transition-colors"
                    >
                      {saleFormLoading ? 'Gravando Venda...' : 'Registrar e Comissionar'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Sales History and Commission Toggle Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2 overflow-hidden">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-5">
                  Histórico Recente de Lançamentos
                </h2>

                {loadingSales ? (
                  <div className="flex flex-col items-center py-12 gap-3">
                    <div className="w-8 h-8 border-4 border-ipe-green-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-500 font-semibold">Carregando histórico...</p>
                  </div>
                ) : sales.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-10">Nenhuma venda lançada ainda.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente / Serviço</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Parceiro</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Valor / Data</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Comissão</th>
                          <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">Ação Pagamento</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {sales.map((sale) => {
                          const comm = sale.commissions[0];
                          return (
                            <tr key={sale.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <p className="text-sm font-bold text-slate-800">{sale.clientName}</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {sale.serviceType}{' '}
                                  {sale.livesCount > 0 && `(${sale.livesCount} vidas)`}{' '}
                                  {sale.isRenewal && (
                                    <span className="text-[10px] bg-amber-50 text-amber-600 font-extrabold px-1 rounded border border-amber-200">
                                      RENOV
                                    </span>
                                  )}
                                </p>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-slate-600">
                                {sale.accountant?.name}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <p className="text-sm font-semibold text-slate-700">R$ {sale.value.toFixed(2).replace('.', ',')}</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {new Date(sale.saleDate).toLocaleDateString('pt-BR')}
                                </p>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <p className="text-sm font-black text-slate-800">
                                  R$ {comm ? comm.value.toFixed(2).replace('.', ',') : '0,00'}
                                </p>
                                <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mt-0.5 ${
                                  comm?.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                }`}>
                                  {comm?.status === 'PAID' ? 'Paga' : 'Pendente'}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-center">
                                {comm ? (
                                  <button
                                    onClick={() => handleToggleCommission(comm.id, comm.status)}
                                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                      comm.status === 'PAID'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                                        : 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700'
                                    }`}
                                  >
                                    {comm.status === 'PAID' ? 'Marcar Pendente' : 'Marcar Paga'}
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-400">N/A</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
