import { ReactNode } from 'react';

import { AppLayout } from '@/features/app/AppLayout';

export default function AutenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
