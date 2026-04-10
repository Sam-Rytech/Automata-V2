'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { FlowBuilderContent } from './components/FlowBuilderContent';

export default function BuildPage() {
  return (
    <AuthGuard>
      <FlowBuilderContent />
    </AuthGuard>
  )
}
