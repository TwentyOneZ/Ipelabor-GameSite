import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signJWT } from '@/lib/jwt';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'ipelabor_secret_key_12345_super_secure_nextjs_custom_jwt';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Credenciais inválidas ou conta desativada.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: 401 }
      );
    }

    // Sign JWT
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    
    const token = await signJWT(payload, JWT_SECRET);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
      },
    });

    // Set HTTP-Only Cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return response;
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor ao realizar login.' },
      { status: 500 }
    );
  }
}
