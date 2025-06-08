// components/ui/MinimalHeader.tsx
import Logo from './Logo';

const MinimalHeader = () => (
  <header className="bg-white shadow-sm sticky top-0 z-30">
    {/* Full-width flex with left-aligned logo */}
    <div className="w-full flex items-center px-6 py-3">
      <Logo />
    </div>
  </header>
);

export default MinimalHeader;
