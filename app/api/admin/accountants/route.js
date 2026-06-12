import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyJWT } from '@/lib/jwt';
import { getTier } from '@/lib/tiers';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'ipelabor_secret_key_12345_super_secure_nextjs_custom_jwt';

// Helper to authenticate admin
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

    // Get date 12 months ago
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

    const accountants = await prisma.user.findMany({
      where: { role: 'CONTADOR' },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        phone: true,
        cpfCnpj: true,
        status: true,
        createdAt: true,
        sales: {
          where: {
            saleDate: {
              gte: twelveMonthsAgo,
            },
          },
          select: {
            id: true,
          },
        },
        commissions: {
          select: {
            value: true,
            status: true,
          },
        },
      },
    });

    const formattedAccountants = accountants.map((acc) => {
      const activeClientsCount = acc.sales.length;
      const tierInfo = getTier(activeClientsCount);

      const paidCommissions = acc.commissions
        .filter((c) => c.status === 'PAID')
        .reduce((sum, c) => sum + c.value, 0);

      const pendingCommissions = acc.commissions
        .filter((c) => c.status === 'PENDING')
        .reduce((sum, c) => sum + c.value, 0);

      return {
        id: acc.id,
        name: acc.name,
        email: acc.email,
        companyName: acc.companyName || 'N/A',
        phone: acc.phone || 'N/A',
        cpfCnpj: acc.cpfCnpj || 'N/A',
        status: acc.status,
        activeClients: activeClientsCount,
        level: tierInfo.name,
        paidCommissions,
        pendingCommissions,
      };
    });

    return NextResponse.json({ success: true, accountants: formattedAccountants });
  } catch (error) {
    console.error('Error listing accountants:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao listar contadores.' },
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

    const { name, email, password, companyName, phone, cpfCnpj } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, e-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Um usuário com este e-mail já existe.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAccountant = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'CONTADOR',
        companyName,
        phone,
        cpfCnpj,
        avatarUrl: `https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1535713875002-d1d0cf377fde' : '1494790108377-be9c29b29330'}?w=150`,
      },
    });

    return NextResponse.json({
      success: true,
      accountant: {
        id: newAccountant.id,
        name: newAccountant.name,
        email: newAccountant.email,
        companyName: newAccountant.companyName,
      },
    });
  } catch (error) {
    console.error('Error creating accountant:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao cadastrar contador.' },
      { status: 500 }
    );
  }
}
