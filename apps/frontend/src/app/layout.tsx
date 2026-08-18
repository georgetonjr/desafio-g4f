import type { Metadata } from 'next';
import Link from 'next/link';
import { Geist, Geist_Mono } from 'next/font/google';
import estilos from './layout.module.css';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Desafio G4F',
  description: 'CRUD de notícias e busca de CEP',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <nav className={estilos.navegacao}>
          <Link className={estilos.link} href="/">
            Início
          </Link>
          <Link className={estilos.link} href="/noticias">
            Notícias
          </Link>
          <Link className={estilos.link} href="/busca-cep">
            Busca de CEP
          </Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
