import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'ipelabor_secret_key_12345_super_secure_nextjs_custom_jwt';

async function checkAdmin(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  const payload = await verifyJWT(token, JWT_SECRET);
  if (!payload || payload.role !== 'ADMIN') return null;
  return payload;
}

export async function PUT(request, { params }) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
    }

    const commissionId = parseInt(params.id);
    if (isNaN(commissionId)) {
      return NextResponse.json({ error: 'ID da comissão inválido.' }, { status: 400 });
    }

    const { status } = await request.json();

    if (status !== 'PENDING' && status !== 'PAID') {
      return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
    }

    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
    });

    if (!commission) {
      return NextResponse.json({ error: 'Comissão não encontrada.' }, { status: 404 });
    }

    const updatedCommission = await prisma.commission.update({
      where: { id: commissionId },
      data: {
        status,
        paidAt: status === 'PAID' ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      commission: updatedCommission,
    });
  } catch (error) {
    console.error('Error updating commission:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao atualizar comissão.' },
      { status: 500 }
    );
  }
}
