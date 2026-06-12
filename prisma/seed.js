const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  await prisma.commission.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding admin user...');
  const adminPasswordHash = await bcrypt.hash('ipelabor12345', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'ti@ipelabor.com.br',
      password: adminPasswordHash,
      name: 'TI Ipê Labor',
      role: 'ADMIN',
      companyName: 'Ipê Labor Medicina e Segurança do Trabalho',
      phone: '(35) 3211-1000',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
    },
  });
  console.log(`Admin created: ${admin.email}`);

  console.log('Seeding accountant users...');
  const accountantPasswordHash = await bcrypt.hash('contador123', 10);
  
  // Accountant 1: Pedro Alves (10 clients - Initial Tier, on the verge of Bronze)
  const accountant1 = await prisma.user.create({
    data: {
      email: 'pedro.alves@alvescontabil.com.br',
      password: accountantPasswordHash,
      name: 'Pedro Alves',
      role: 'CONTADOR',
      companyName: 'Alves Contabilidade',
      phone: '(35) 99988-1122',
      cpfCnpj: '12.345.678/0001-99',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
  });

  // Accountant 2: Mariana Souza (16 clients - Bronze Tier)
  const accountant2 = await prisma.user.create({
    data: {
      email: 'mariana.souza@souzaassociados.com.br',
      password: accountantPasswordHash,
      name: 'Mariana Souza',
      role: 'CONTADOR',
      companyName: 'Souza & Associados Contabilidade',
      phone: '(35) 98877-3344',
      cpfCnpj: '98.765.432/0001-11',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  console.log('Seeding sales and commissions for Pedro Alves (10 clients)...');
  const services = ['PGR/LTCAT', 'NR-01', 'Plano de Ação', 'PCMSO', 'ASO'];
  
  // 10 Sales for Pedro Alves (all in the last 12 months)
  // Let's create some sales and commissions.
  // We'll calculate commissions based on the tier:
  // Pedro has 10 clients, so he is in "Parceiro Inicial" (1-10 clients)
  // Initial rates: R$ 150 per package, R$ 1.00 per life in NR-01.
  const sales1 = [
    { client: 'Mercado Central', service: 'PGR/LTCAT', val: 1200, lives: 0, monthsAgo: 1, isRenewal: false },
    { client: 'Auto Escola Ipê', service: 'NR-01', val: 500, lives: 45, monthsAgo: 2, isRenewal: false }, // 45 lives * 1.00 = R$ 45.00
    { client: 'Clínica Sorriso', service: 'PCMSO', val: 800, lives: 0, monthsAgo: 3, isRenewal: false },
    { client: 'Restaurante Sabor', service: 'ASO', val: 300, lives: 0, monthsAgo: 4, isRenewal: false },
    { client: 'Oficina Rápida', service: 'PGR/LTCAT', val: 1500, lives: 0, monthsAgo: 5, isRenewal: true },
    { client: 'Padaria Alfa', service: 'Plano de Ação', val: 600, lives: 0, monthsAgo: 6, isRenewal: false },
    { client: 'Indústria Beta', service: 'NR-01', val: 2500, lives: 120, monthsAgo: 7, isRenewal: false }, // 120 lives * 1.00 = R$ 120.00
    { client: 'Hotel Floresta', service: 'PCMSO', val: 1800, lives: 0, monthsAgo: 8, isRenewal: false },
    { client: 'Academia Corpo Ativo', service: 'ASO', val: 400, lives: 0, monthsAgo: 9, isRenewal: false },
    { client: 'Construtora Nova', service: 'PGR/LTCAT', val: 3500, lives: 0, monthsAgo: 10, isRenewal: false }
  ];

  for (let i = 0; i < sales1.length; i++) {
    const s = sales1[i];
    const saleDate = new Date();
    saleDate.setMonth(saleDate.getMonth() - s.monthsAgo);

    const sale = await prisma.sale.create({
      data: {
        accountantId: accountant1.id,
        clientName: s.client,
        serviceType: s.service,
        value: s.val,
        livesCount: s.lives,
        isRenewal: s.isRenewal,
        saleDate: saleDate,
      }
    });

    // Calculate commission
    let commVal = 150; // Initial tier flat package rate
    if (s.service === 'NR-01') {
      commVal = s.lives * 1.0; // Initial tier NR-01 life rate
    }

    await prisma.commission.create({
      data: {
        accountantId: accountant1.id,
        saleId: sale.id,
        value: commVal,
        status: i % 3 === 0 ? 'PAID' : 'PENDING',
        paidAt: i % 3 === 0 ? new Date() : null,
        createdAt: saleDate
      }
    });
  }

  console.log('Seeding sales and commissions for Mariana Souza (16 clients)...');
  // 16 Sales for Mariana Souza (all in the last 12 months, placing her in Bronze tier)
  // Bronze tier rates: R$ 180 per package, R$ 1.25 per life in NR-01.
  const sales2 = [
    { client: 'Supermercado Sol', service: 'PGR/LTCAT', val: 2500, lives: 0, monthsAgo: 1, isRenewal: false },
    { client: 'Indústria Metalúrgica', service: 'NR-01', val: 4000, lives: 250, monthsAgo: 2, isRenewal: false }, // 250 lives * 1.25 = R$ 312.50
    { client: 'Escola Aquarela', service: 'PCMSO', val: 1200, lives: 0, monthsAgo: 3, isRenewal: false },
    { client: 'Transportadora Veloz', service: 'PGR/LTCAT', val: 3200, lives: 0, monthsAgo: 4, isRenewal: false },
    { client: 'Lojas Americanas Franquia', service: 'ASO', val: 600, lives: 0, monthsAgo: 4, isRenewal: false },
    { client: 'Panificadora Silva', service: 'Plano de Ação', val: 800, lives: 0, monthsAgo: 5, isRenewal: true },
    { client: 'Clínica Sorrir', service: 'PCMSO', val: 900, lives: 0, monthsAgo: 5, isRenewal: false },
    { client: 'Posto Gasolina Rio', service: 'NR-01', val: 1500, lives: 60, monthsAgo: 6, isRenewal: false }, // 60 lives * 1.25 = R$ 75.00
    { client: 'Agência Digital', service: 'ASO', val: 350, lives: 0, monthsAgo: 7, isRenewal: false },
    { client: 'Confecção Linha Fina', service: 'PGR/LTCAT', val: 1800, lives: 0, monthsAgo: 8, isRenewal: false },
    { client: 'Condomínio Spazio', service: 'Plano de Ação', val: 1200, lives: 0, monthsAgo: 8, isRenewal: false },
    { client: 'Restaurante Mineiro', service: 'PCMSO', val: 750, lives: 0, monthsAgo: 9, isRenewal: false },
    { client: 'Mercado do Bairro', service: 'ASO', val: 300, lives: 0, monthsAgo: 10, isRenewal: true },
    { client: 'Construtora Forte', service: 'PGR/LTCAT', val: 5500, lives: 0, monthsAgo: 10, isRenewal: false },
    { client: 'Farmácia Preço Baixo', service: 'Plano de Ação', val: 700, lives: 0, monthsAgo: 11, isRenewal: false },
    { client: 'Móveis Planejados', service: 'NR-01', val: 1300, lives: 32, monthsAgo: 11, isRenewal: false } // 32 lives * 1.25 = R$ 40.00
  ];

  for (let i = 0; i < sales2.length; i++) {
    const s = sales2[i];
    const saleDate = new Date();
    saleDate.setMonth(saleDate.getMonth() - s.monthsAgo);

    const sale = await prisma.sale.create({
      data: {
        accountantId: accountant2.id,
        clientName: s.client,
        serviceType: s.service,
        value: s.val,
        livesCount: s.lives,
        isRenewal: s.isRenewal,
        saleDate: saleDate,
      }
    });

    // Calculate commission based on Bronze rates (since they have > 10 sales)
    let commVal = 180;
    if (s.service === 'NR-01') {
      commVal = s.lives * 1.25;
    }

    await prisma.commission.create({
      data: {
        accountantId: accountant2.id,
        saleId: sale.id,
        value: commVal,
        status: i % 2 === 0 ? 'PAID' : 'PENDING',
        paidAt: i % 2 === 0 ? new Date() : null,
        createdAt: saleDate
      }
    });
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
