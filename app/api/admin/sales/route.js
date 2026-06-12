import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { getTier } from '@/lib/tiers';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'ipelabor_secret_key_12345_super_secure_nextjs_custom_jwt';

async function checkAdmin(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  const payload = await verifyJWT(token, JWT_SECRET);
  if (!payload || payload.role !== 'ADMIN') return null;
  return payload;
}

export async function GET(request) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
    }

    const sales = await prisma.sale.findMany({
      orderBy: { saleDate: 'desc' },
      include: {
        accountant: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        commissions: {
          select: {
            id: true,
            value: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, sales });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao carregar vendas.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
    }

    const { accountantId, clientName, clientCnpj, serviceType, saleDate, value, livesCount, isRenewal } = await request.json();

    if (!accountantId || !clientName || !serviceType || !value) {
      return NextResponse.json(
        { error: 'Contador, nome do cliente, tipo de serviço e valor são obrigatórios.' },
        { status: 400 }
      );
    }

    const accountant = await prisma.user.findUnique({
      where: { id: parseInt(accountantId) },
    });

    if (!accountant || accountant.role !== 'CONTADOR') {
      return NextResponse.json({ error: 'Contador parceiro não encontrado.' }, { status: 404 });
    }

    // Determine the active clients volume in the last 12 months up to the input sale date
    // Note: We use the input sale date or default to now
    const targetSaleDate = saleDate ? new Date(saleDate) : new Date();
    const twelveMonthsAgo = new Date(targetSaleDate);
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

    const activeSalesCount = await prisma.sale.count({
      where: {
        accountantId: accountant.id,
        saleDate: {
          gte: twelveMonthsAgo,
          lte: targetSaleDate
        },
      },
    });

    // Determine tier based on the new client count (existing in last 12m + 1)
    const newClientVolume = activeSalesCount + 1;
    const tier = getTier(newClientVolume);

    // Calculate commission
    let commissionValue = tier.packageCommission;
    if (serviceType === 'NR-01') {
      const lives = livesCount ? parseInt(livesCount) : 0;
      commissionValue = lives * tier.nr01LifeCommission;
    }

    // Create the Sale and the associated Commission in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          accountantId: accountant.id,
          clientName,
          clientCnpj,
          serviceType,
          saleDate: targetSaleDate,
          value: parseFloat(value),
          livesCount: livesCount ? parseInt(livesCount) : 0,
          isRenewal: !!isRenewal,
        },
      });

      const newCommission = await tx.commission.create({
        data: {
          accountantId: accountant.id,
          saleId: newSale.id,
          value: commissionValue,
          status: 'PENDING',
        },
      });

      return { sale: newSale, commission: newCommission };
    });

    return NextResponse.json({
      success: true,
      sale: result.sale,
      commission: result.commission,
      calculatedTier: tier.name,
      commissionValue,
    });
  } catch (error) {
    console.error('Error creating sale and commission:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao registrar venda.' },
      { status: 500 }
    );
  }
}
