import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'ipelabor_secret_key_12345_super_secure_nextjs_custom_jwt';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Não autenticado.' },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token, JWT_SECRET);
    if (!payload) {
      return NextResponse.json(
        { error: 'Sessão expirada ou inválida.' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyName: true,
        phone: true,
        cpfCnpj: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Usuário não encontrado ou inativo.' },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao obter sessão.' },
      { status: 500 }
    );
  }
}
