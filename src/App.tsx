import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { RoleSelect } from './components/RoleSelect';
import { ReceptionFlow } from './components/reception/ReceptionFlow';
import { SalesFlow } from './components/sales/SalesFlow';
import { GoogleSheetsModal } from './components/common/GoogleSheetsModal';
import { LeadListModal } from './components/admin/LeadListModal';

function MainApp() {
  const { role } = useApp();

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white flex flex-col">
      <Header />
      <main className="flex-1">
        {role === 'select' && <RoleSelect />}
        {role === 'reception' && <ReceptionFlow />}
        {role === 'sales' && <SalesFlow />}
      </main>

      {/* Global Modals */}
      <GoogleSheetsModal />
      <LeadListModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
