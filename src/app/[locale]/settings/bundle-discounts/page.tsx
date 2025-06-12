"use client";

import { useState } from "react";

export default function BundleDiscountsPage() {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bundle discounts</h1>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">Enable bundle discounts</h3>
            <p className="text-gray-600 mt-1">
              Encourage people to buy more items from you with bundle discounts. Set rates based on the number of items per order. Learn more at the{" "}
              <a href="#" className="text-teal-600 hover:text-teal-700">Help Centre</a>.
            </p>
          </div>
          <div className="ml-4">
            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                isEnabled ? "bg-teal-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 