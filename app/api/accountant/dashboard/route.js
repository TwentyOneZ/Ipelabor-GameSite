import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { getTier, TIERS } from '@/lib/tiers';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'ipelabor_secret_key_12345_super_secure_nextjs_custom_jwt';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const payload = await verifyJWT(token, JWT_SECRET);
    if (!payload || payload.role !== 'CONTADOR') {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
    }

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

    // Fetch accountant details, sales, and commissions
    const accountant = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        sales: {
          orderBy: { saleDate: 'desc' },
          include: {
            commissions: true,
          },
        },
        commissions: {
          orderBy: { createdAt: 'desc' },
          include: {
            sale: {
              select: {
                clientName: true,
                serviceType: true,
                livesCount: true,
                value: true,
                isRenewal: true,
                saleDate: true,
              },
            },
          },
        },
      },
    });

    if (!accountant) {
      return NextResponse.json({ error: 'Contador não encontrado.' }, { status: 404 });
    }

    // Filter sales in the last 12 months to compute tier/level
    const activeSales = accountant.sales.filter(
      (sale) => new Date(sale.saleDate) >= twelveMonthsAgo
    );
    const activeClientsCount = activeSales.length;

    // Gamification: Tier assessment
    const currentTier = getTier(activeClientsCount);
    
    // Find next tier details
    const currentTierIndex = TIERS.findIndex((t) => t.name === currentTier.name);
    const nextTier = currentTierIndex < TIERS.length - 1 ? TIERS[currentTierIndex + 1] : null;

    let progressPercent = 100;
    let clientsNeeded = 0;
    let nextTierCopy = 'Você atingiu o nível máximo de parceiro! Parabéns pelo sucesso!';

    if (nextTier) {
      clientsNeeded = nextTier.minClients - activeClientsCount;
      const currentTierMin = currentTier.minClients;
      const nextTierMin = nextTier.minClients;
      
      const totalSteps = nextTierMin - currentTierMin;
      const currentStep = activeClientsCount - currentTierMin;
      progressPercent = Math.min(Math.round((currentStep / totalSteps) * 100), 100);
      
      nextTierCopy = `Faltam ${clientsNeeded} cliente${clientsNeeded > 1 ? 's' : ''} para o nível ${nextTier.name}! Você passará a ganhar R$ ${nextTier.packageCommission.toFixed(2).replace('.', ',')} por pacote e R$ ${nextTier.nr01LifeCommission.toFixed(2).replace('.', ',')}/vida na NR-01.`;
    }

    // Timeline milestones (placar de benefícios institucionais)
    const milestones = [
      { id: 1, clients: 10, reward: 'ASOs Gratuitos', desc: 'ASOs (Exames Clínicos ocupacionais) gratuitos para a sua própria contabilidade.', unlocked: activeClientsCount >= 10 },
      { id: 2, clients: 15, reward: 'PGR / PCMSO / LTCAT Gratuitos', desc: 'Elaboração gratuita dos programas de saúde e segurança (PGR, PCMSO, LTCAT) da sua contabilidade.', unlocked: activeClientsCount >= 15 },
      { id: 3, clients: 20, reward: 'NR-01 Integrado', desc: 'Assessoria de conformidade em NR-01 completa e sem custos para sua firma.', unlocked: activeClientsCount >= 20 },
      { id: 4, clients: 25, reward: 'NR-17 Ergonomia', desc: 'Análise Ergonômica do Trabalho (AET - NR-17) gratuita para o escritório de contabilidade.', unlocked: activeClientsCount >= 25 },
    ];

    // Achievements (Medals / Badges)
    const achievements = [
      {
        id: 'parceiro-oficial',
        title: 'Parceiro Oficial',
        description: 'Primeiros passos! Cadastro realizado com sucesso no Portal do Contador Parceiro.',
        unlocked: true,
        icon: 'ShieldCheck',
        date: accountant.createdAt.toISOString().split('T')[0],
      },
      {
        id: 'primeiros-10',
        title: 'Primeiros 10 Clientes!',
        description: 'Indique e feche os primeiros 10 contratos. Desbloqueia os ASOs gratuitos.',
        unlocked: activeClientsCount >= 10,
        icon: 'Trophy',
        date: activeClientsCount >= 10 ? activeSales[activeSales.length - 10]?.saleDate.toISOString().split('T')[0] : null,
      },
      {
        id: 'nr01-expert',
        title: 'Especialista em NR-01',
        description: 'Realize uma venda de serviço NR-01 vinculada ao seu código.',
        unlocked: accountant.sales.some((s) => s.serviceType === 'NR-01'),
        icon: 'Award',
        date: accountant.sales.find((s) => s.serviceType === 'NR-01')?.saleDate.toISOString().split('T')[0] || null,
      },
      {
        id: 'renovacao-garantida',
        title: 'Renovação Garantida',
        description: 'Consolide a parceria realizando a renovação de contrato de um cliente indicado.',
        unlocked: accountant.sales.some((s) => s.isRenewal),
        icon: 'RotateCcw',
        date: accountant.sales.find((s) => s.isRenewal)?.saleDate.toISOString().split('T')[0] || null,
      },
      {
        id: 'mestre-indicacoes',
        title: 'Mestre das Indicações',
        description: 'Atinja a marca histórica de 20 clientes ativos na plataforma.',
        unlocked: activeClientsCount >= 20,
        icon: 'Sparkles',
        date: activeClientsCount >= 20 ? activeSales[activeSales.length - 20]?.saleDate.toISOString().split('T')[0] : null,
      },
      {
        id: 'diamante-badge',
        title: 'Elite Diamante',
        description: 'Alcance a categoria mais alta de comissionamento e benefícios com 40+ clientes ativos.',
        unlocked: activeClientsCount >= 40,
        icon: 'Crown',
        date: activeClientsCount >= 40 ? activeSales[activeSales.length - 40]?.saleDate.toISOString().split('T')[0] : null,
      },
    ];

    // Calculate overall financial balances
    const paidCommissionsSum = accountant.commissions
      .filter((c) => c.status === 'PAID')
      .reduce((sum, c) => sum + c.value, 0);

    const pendingCommissionsSum = accountant.commissions
      .filter((c) => c.status === 'PENDING')
      .reduce((sum, c) => sum + c.value, 0);

    // Format Statement List
    const statement = accountant.commissions.map((comm) => ({
      id: comm.id,
      clientName: comm.sale.clientName,
      serviceType: comm.sale.serviceType,
      value: comm.value,
      status: comm.status,
      saleValue: comm.sale.value,
      livesCount: comm.sale.livesCount,
      isRenewal: comm.sale.isRenewal,
      createdAt: comm.createdAt,
    }));

    return NextResponse.json({
      success: true,
      profile: {
        name: accountant.name,
        companyName: accountant.companyName,
        email: accountant.email,
        phone: accountant.phone,
        avatarUrl: accountant.avatarUrl,
      },
      metrics: {
        activeClients: activeClientsCount,
        pendingCommissions: pendingCommissionsSum,
        paidCommissions: paidCommissionsSum,
      },
      gamification: {
        level: currentTier.name,
        progressPercent,
        clientsNeeded,
        nextTierName: nextTier ? nextTier.name : null,
        nextTierCopy,
        currentTierRates: {
          package: currentTier.packageCommission,
          life: currentTier.nr01LifeCommission,
        },
      },
      milestones,
      achievements,
      statement,
    });
  } catch (error) {
    console.error('Error fetching accountant dashboard:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao carregar dados do parceiro.' },
      { status: 500 }
    );
  }
}
