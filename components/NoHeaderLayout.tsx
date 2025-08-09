'use client';

import { ReactNode } from 'react';

interface NoHeaderLayoutProps {
  children: ReactNode;
}

export default function NoHeaderLayout({ children }: NoHeaderLayoutProps) {
  return (
    <div style={{ marginTop: '-80px', paddingTop: '0' }}>
      {children}
    </div>
  );
}
