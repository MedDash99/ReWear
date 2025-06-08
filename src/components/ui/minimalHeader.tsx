// components/ui/MinimalHeader.tsx
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Logo from './Logo';

interface MinimalHeaderProps {
  showBackButton?: boolean;
  backHref?: string;
  backText?: string;
  title?: string;
}

const MinimalHeader = ({ showBackButton = false, backHref = '/', backText = 'Back', title }: MinimalHeaderProps) => (
  <header className="bg-white shadow-sm sticky top-0 z-30">
    <div className="w-full flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-4">
        <Logo />
        {title && (
          <div className="hidden sm:block">
            <span className="text-lg font-medium text-gray-700">{title}</span>
          </div>
        )}
      </div>
      
      {showBackButton && (
        <Link 
          href={backHref}
          className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{backText}</span>
        </Link>
      )}
    </div>
  </header>
);

export default MinimalHeader;
