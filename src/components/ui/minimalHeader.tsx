// components/ui/MinimalHeader.tsx
import Logo from './Logo';

const MinimalHeader = () => (
  <header className="bg-white shadow-sm sticky top-0 z-30">
    {/* Container ensures consistent padding/alignment with the full header */}
    <div className="container mx-auto px-4 py-3">
      <Logo />
    </div>
  </header>
);

export default MinimalHeader;