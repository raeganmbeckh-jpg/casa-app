import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function WorkspacesLayout({ children }: { children: ReactNode }) {
  return children;
}
