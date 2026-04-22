import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@uigovpe/styles';
import { UiProvider, LayoutProvider } from '@uigovpe/components';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema de Gestão',
  description: 'Avaliação Técnica Full-Stack',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <LayoutProvider>
          <UiProvider>
            {children}
          </UiProvider>
        </LayoutProvider>
      </body>
    </html>
  );
}
