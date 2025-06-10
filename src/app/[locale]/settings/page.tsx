"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to profile settings as the default
    router.replace("/settings/profile");
  }, [router]);

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="text-center py-8">
        <p className="text-gray-600">Redirecting to settings...</p>
      </div>
    </div>
  );
} 