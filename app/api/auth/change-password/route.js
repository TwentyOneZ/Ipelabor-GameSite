import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyJWT } from '@/lib/jwt';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'ipelabor_secret_key_12345_super_secure_nextjs_custom_jwt';

export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const payload = await verifyJWT(token, JWT_SECRET);
    if (!payload) {
      return NextResponse.json({ error: 'Sessão inválida.' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Senha atual e nova senha são obrigatórias.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve ter no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 400 });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({ success: true, message: 'Senha alterada com sucesso.' });
  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao alterar senha.' },
      { status: 500 }
    );
  }
}
