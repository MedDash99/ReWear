// components/HeroSection.tsx
import React from 'react';

interface HeroSectionProps {
  onRoleSelect: (role: 'buyer' | 'seller') => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onRoleSelect }) => {
  return (
    <section className="relative bg-gray-100 py-20 overflow-hidden">
      {/* Background element - could be an image */}
      {/* For simplicity, we'll just use a background color and a decorative element */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/placeholder-background.jpg')" /* Replace with your image */, filter: 'brightness(85%)' }}></div>


      <div className="container mx-auto px-4 relative z-10 flex justify-start items-center min-h-[400px]">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-gray-700 mb-6">
            Choose your role to explore the marketplace.
          </p>
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => onRoleSelect('buyer')}
              className="bg-teal-500 text-white px-6 py-3 rounded-md hover:bg-teal-600 transition-colors text-lg font-semibold"
            >
              Browse as a Buyer
            </button>
            <button
              onClick={() => onRoleSelect('seller')}
              className="border border-teal-500 text-teal-600 bg-white px-6 py-3 rounded-md hover:bg-gray-50 transition-colors text-lg font-semibold"
            >
              Start Selling
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;