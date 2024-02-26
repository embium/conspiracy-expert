import { ReactNode } from 'react';

import { Metadata } from 'next';

import { Document } from '@/app/Document';
import { NextLoader } from '@/app/NextLoader';

export const metadata: Metadata = {
  title: 'Conspiracy Expert',
  applicationName: 'Conspiracy Expert',
  description: 'The best way to keep up with the latest conspiracy theories.',
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Document>
      <NextLoader />
      {children}
    </Document>
  );
}
