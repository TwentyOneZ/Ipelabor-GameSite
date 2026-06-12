import './globals.css';

export const metadata = {
  title: 'Portal do Contador Parceiro - Ipê Labor',
  description: 'Programa de indicação, fidelidade e benefícios para contadores parceiros da Ipê Labor.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
