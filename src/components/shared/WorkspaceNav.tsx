'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const workspaces = [
  { id: 'management', label: 'Management', path: '/management' },
  { id: 'investment', label: 'Investment', path: '/investment' },
  { id: 'development', label: 'Development', path: '/development' },
  { id: 'land', label: 'Land', path: '/land' },
  { id: 'brokerage', label: 'Brokerage', path: '/brokerage' },
  { id: 'lending', label: 'Lending', path: '/lending' },
];

export default function WorkspaceNav() {
  const pathname = usePathname();
  const currentWorkspace = workspaces.find(w => pathname?.startsWith(w.path));

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-[1600px] mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight">
            CASA
          </Link>
          
          <div className="flex items-center gap-1">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.id}
                href={workspace.path}
                className={`px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                  currentWorkspace?.id === workspace.id
                    ? 'bg-[#F9D96A] text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {workspace.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm text-gray-600 hover:text-gray-900">
              Settings
            </button>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
              RB
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}