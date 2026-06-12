import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'O e-mail é obrigatório.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // For security reasons, don't reveal if the user exists or not.
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Se o e-mail estiver cadastrado, as instruções de redefinição foram enviadas.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour validity

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Mock sending email in console
    const resetUrl = `http://localhost:7004/reset-password?token=${resetToken}`;
    console.log('\n=================== MOCK EMAIL SENT ===================');
    console.log(`To: ${user.email}`);
    console.log(`Subject: Redefinição de Senha - Portal do Contador Ipê Labor`);
    console.log(`Olá, ${user.name}.`);
    console.log(`Recebemos uma solicitação de redefinição de senha para sua conta.`);
    console.log(`Para redefinir sua senha, clique no link abaixo (válido por 1 hora):`);
    console.log(resetUrl);
    console.log('=======================================================\n');

    return NextResponse.json({
      success: true,
      message: 'Se o e-mail estiver cadastrado, as instruções de redefinição foram enviadas.',
    });
  } catch (error) {
    console.error('Error in forgot-password:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao solicitar redefinição de senha.' },
      { status: 500 }
    );
  }
}
