import prisma from '@/lib/prisma';
import { verifyJWT } from '@/lib/jwt';
import { getTier } from '@/lib/tiers';
import * as XLSX from 'xlsx';
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
      return new Response('Não autorizado.', { status: 403 });
    }

    // Get date 12 months ago
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

    // Fetch Accountants
    const accountants = await prisma.user.findMany({
      where: { role: 'CONTADOR' },
      include: {
        sales: {
          where: {
            saleDate: {
              gte: twelveMonthsAgo,
            },
          },
        },
        commissions: true,
      },
    });

    // Fetch All Sales
    const sales = await prisma.sale.findMany({
      orderBy: { saleDate: 'desc' },
      include: {
        accountant: {
          select: {
            name: true,
            companyName: true,
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

    // Create workbook
    const wb = XLSX.utils.book_new();

    // 1. Format Accountant Data
    const accountantsSheetData = accountants.map((acc) => {
      const activeClientsCount = acc.sales.length;
      const tierInfo = getTier(activeClientsCount);

      const paidCommissions = acc.commissions
        .filter((c) => c.status === 'PAID')
        .reduce((sum, c) => sum + c.value, 0);

      const pendingCommissions = acc.commissions
        .filter((c) => c.status === 'PENDING')
        .reduce((sum, c) => sum + c.value, 0);

      return {
        'ID': acc.id,
        'Nome': acc.name,
        'E-mail': acc.email,
        'Empresa Contabilidade': acc.companyName || 'N/A',
        'Telefone': acc.phone || 'N/A',
        'CPF/CNPJ': acc.cpfCnpj || 'N/A',
        'Status Conta': acc.status === 'ACTIVE' ? 'Ativo' : 'Inativo',
        'Clientes Fechados (12m)': activeClientsCount,
        'Nível Atual': tierInfo.name,
        'Comissões Pagas (R$)': paidCommissions,
        'Comissões Pendentes (R$)': pendingCommissions,
        'Total Recebido (R$)': paidCommissions + pendingCommissions,
        'Data Cadastro': acc.createdAt.toISOString().split('T')[0],
      };
    });

    const wsAccountants = XLSX.utils.json_to_sheet(accountantsSheetData);
    XLSX.utils.book_append_sheet(wb, wsAccountants, 'Contadores Parceiros');

    // 2. Format Sales Data
    const salesSheetData = sales.map((sale) => {
      const commission = sale.commissions[0];
      return {
        'ID Venda': sale.id,
        'Contador Parceiro': sale.accountant?.name || 'N/A',
        'Empresa do Contador': sale.accountant?.companyName || 'N/A',
        'Nome do Cliente': sale.clientName,
        'CNPJ do Cliente': sale.clientCnpj || 'N/A',
        'Serviço Vendido': sale.serviceType,
        'Valor da Venda (R$)': sale.value,
        'Qtd Vidas (NR-01)': sale.livesCount,
        'Tipo': sale.isRenewal ? 'Renovação' : 'Nova Venda',
        'Data Lançamento': sale.saleDate.toISOString().split('T')[0],
        'Valor da Comissão (R$)': commission?.value || 0,
        'Status Pagamento Comissão': commission?.status === 'PAID' ? 'Paga' : 'Pendente',
      };
    });

    const wsSales = XLSX.utils.json_to_sheet(salesSheetData);
    XLSX.utils.book_append_sheet(wb, wsSales, 'Histórico de Vendas');

    // Write buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="relatorio-portal-parceiros-ipelabor.xlsx"',
      },
    });
  } catch (error) {
    console.error('Error exporting sheet:', error);
    return new Response('Erro interno no servidor ao exportar planilha.', { status: 500 });
  }
}
