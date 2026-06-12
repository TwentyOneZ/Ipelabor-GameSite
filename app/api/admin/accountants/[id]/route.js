import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyJWT } from '@/lib/jwt';
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

export async function PUT(request, { params }) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
    }

    const accountantId = parseInt(params.id);
    if (isNaN(accountantId)) {
      return NextResponse.json({ error: 'ID do contador inválido.' }, { status: 400 });
    }

    const { name, email, password, companyName, phone, cpfCnpj, status } = await request.json();

    const accountant = await prisma.user.findUnique({
      where: { id: accountantId },
    });

    if (!accountant || accountant.role !== 'CONTADOR') {
      return NextResponse.json({ error: 'Contador não encontrado.' }, { status: 404 });
    }

    // Build update data
    const updateData = {};
    if (name) updateData.name = name;
    if (email) {
      const emailLower = email.toLowerCase().trim();
      // Check if email is in use by another user
      if (emailLower !== accountant.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: emailLower },
        });
        if (emailExists) {
          return NextResponse.json({ error: 'Este e-mail já está sendo utilizado.' }, { status: 400 });
        }
        updateData.email = emailLower;
      }
    }
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (companyName !== undefined) updateData.companyName = companyName;
    if (phone !== undefined) updateData.phone = phone;
    if (cpfCnpj !== undefined) updateData.cpfCnpj = cpfCnpj;
    if (status) updateData.status = status;

    const updatedAccountant = await prisma.user.update({
      where: { id: accountantId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      accountant: {
        id: updatedAccountant.id,
        name: updatedAccountant.name,
        email: updatedAccountant.email,
        status: updatedAccountant.status,
      },
    });
  } catch (error) {
    console.error('Error updating accountant:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao atualizar dados.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const admin = await checkAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
    }

    const accountantId = parseInt(params.id);
    if (isNaN(accountantId)) {
      return NextResponse.json({ error: 'ID do contador inválido.' }, { status: 400 });
    }

    const accountant = await prisma.user.findUnique({
      where: { id: accountantId },
    });

    if (!accountant || accountant.role !== 'CONTADOR') {
      return NextResponse.json({ error: 'Contador não encontrado.' }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: accountantId },
    });

    return NextResponse.json({
      success: true,
      message: 'Contador e dados vinculados removidos com sucesso.',
    });
  } catch (error) {
    console.error('Error deleting accountant:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao remover contador.' },
      { status: 500 }
    );
  }
}
