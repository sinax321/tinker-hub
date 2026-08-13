import React from 'react';
import { Outlet } from 'react-router-dom';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 relative selection:bg-primary/30">
      {/* Removed heavy background gradients for performance */}

      {/* Main Content */}
      <main className="relative z-10 flex flex-col min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};
