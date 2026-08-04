import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppRole, Lead, AppSettings } from '../types';
import { fetchAllLeads, fetchSettings, saveSettings as apiSaveSettings } from '../services/api';

interface AppContextType {
  role: AppRole;
  setRole: (role: AppRole) => void;
  settings: AppSettings;
  updateSettings: (newSettings: AppSettings) => Promise<void>;
  leads: Lead[];
  refreshLeads: () => Promise<void>;
  selectedLeadForSales: Lead | null;
  setSelectedLeadForSales: (lead: Lead | null) => void;
  isSheetsModalOpen: boolean;
  setIsSheetsModalOpen: (open: boolean) => void;
  isLeadListModalOpen: boolean;
  setIsLeadListModalOpen: (open: boolean) => void;
  selectedLeadForView: Lead | null;
  setSelectedLeadForView: (lead: Lead | null) => void;
}

const defaultSettingsState: AppSettings = {
  receptionistName: 'Kavita Rao',
  deviceId: 'IPAD-URBANEST-01',
  googleSheetUrl: '',
  googleWebAppUrl: '',
  autoSyncGoogleSheets: true,
  projects: [
    {
      id: 'p1',
      name: 'Eastfield',
      type: 'Apartments',
      configurations: ['2 BHK', '3 BHK', '4 BHK', 'Penthouse'],
    },
    {
      id: 'p2',
      name: 'Serene Exotica',
      type: 'Villas',
      configurations: ['1200-1500 sft.', '1500-1800 sft.', '1800-2400 sft.', '2400-3000 sft.'],
    },
  ],
  executives: ['Sathish', 'Hamza', 'Anup', 'Haritha', 'Nandeesh', 'Pooja', 'Kushal'],
  receptionists: ['Kavita Rao', 'Sneha Patel', 'Neha Sharma', 'Reception Desk 1'],
  budgetOptions: [
    'Under ₹75 Lakhs',
    '₹75 Lakhs – ₹1 Cr',
    '₹1 Cr – ₹1.25 Cr',
    '₹1.25 Cr – ₹1.5 Cr',
    '₹1.5 Cr – ₹2 Cr',
    '₹2 Cr+',
  ],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<AppRole>('select');
  const [settings, setSettings] = useState<AppSettings>(defaultSettingsState);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadForSales, setSelectedLeadForSales] = useState<Lead | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState<boolean>(false);
  const [isLeadListModalOpen, setIsLeadListModalOpen] = useState<boolean>(false);
  const [selectedLeadForView, setSelectedLeadForView] = useState<Lead | null>(null);

  const refreshLeads = async () => {
    const data = await fetchAllLeads();
    setLeads(data);
  };

  const loadSettings = async () => {
    const s = await fetchSettings();
    setSettings(s);
  };

  useEffect(() => {
    loadSettings();
    refreshLeads();
  }, []);

  const updateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await apiSaveSettings(newSettings);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        settings,
        updateSettings,
        leads,
        refreshLeads,
        selectedLeadForSales,
        setSelectedLeadForSales,
        isSheetsModalOpen,
        setIsSheetsModalOpen,
        isLeadListModalOpen,
        setIsLeadListModalOpen,
        selectedLeadForView,
        setSelectedLeadForView,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
