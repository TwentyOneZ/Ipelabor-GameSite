import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token e nova senha são obrigatórios.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve ter no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    // Find user with matching, unexpired token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token de redefinição inválido ou expirado.' },
        { status: 400 }
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear token fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Senha redefinida com sucesso. Agora você pode fazer login.',
    });
  } catch (error) {
    console.error('Error in reset-password:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao redefinir a senha.' },
      { status: 500 }
    );
  }
}
