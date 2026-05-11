import { ReactNode } from 'react';
import WorkspaceNav from '@/components/shared/WorkspaceNav';
import WorkspaceSidebar from '@/components/shared/WorkspaceSidebar';

export default function WorkspacesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <WorkspaceNav />
      <div className="flex">
        <WorkspaceSidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}