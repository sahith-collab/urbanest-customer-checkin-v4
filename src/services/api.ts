import { Lead, AppSettings } from '../types';

const STORAGE_LEADS_KEY = 'urbanest_leads_v2';
const STORAGE_SETTINGS_KEY = 'urbanest_settings_v2';
const ENV_GOOGLE_WEB_APP_URL =
  ((import.meta as any).env?.VITE_GOOGLE_WEB_APP_URL as string | undefined)?.trim() || '';

const defaultSettings: AppSettings = {
  receptionistName: 'Kavita Rao',
  deviceId: 'IPAD-URBANEST-01',
  googleSheetUrl: '',
  googleWebAppUrl: ENV_GOOGLE_WEB_APP_URL,
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

function getLocalLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(STORAGE_LEADS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading local storage leads:', e);
  }
  return [];
}

function setLocalLeads(leads: Lead[]): void {
  try {
    localStorage.setItem(STORAGE_LEADS_KEY, JSON.stringify(leads));
  } catch (e) {
    console.error('Error saving local storage leads:', e);
  }
}

function getLocalSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (raw) {
      const storedSettings = { ...defaultSettings, ...JSON.parse(raw) };
      return {
        ...storedSettings,
        googleWebAppUrl: storedSettings.googleWebAppUrl || ENV_GOOGLE_WEB_APP_URL,
      };
    }
  } catch (e) {
    console.error('Error reading local settings:', e);
  }
  return defaultSettings;
}

function generateLocalLead(leadData: Partial<Lead>, localLeads: Lead[] = getLocalLeads()): Lead {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const prefix = `UR${yy}${mm}${dd}`;

  let maxNum = 0;
  localLeads.forEach((l) => {
    if (l.leadId && l.leadId.startsWith(prefix)) {
      const num = parseInt(l.leadId.slice(prefix.length), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  });

  const settings = getLocalSettings();

  return {
    leadId: `${prefix}${String(maxNum + 1).padStart(3, '0')}`,
    timestamp: now.toISOString(),
    receptionist: leadData.receptionist || settings.receptionistName || 'Receptionist',
    deviceId: leadData.deviceId || settings.deviceId || 'IPAD-01',
    customerName: leadData.customerName || '',
    mobile: leadData.mobile || '',
    email: leadData.email || '',
    occupation: leadData.occupation || 'Other',
    company: leadData.company || '',
    location: leadData.location || '',
    project: leadData.project || 'Eastfield',
    buyingPurpose: leadData.buyingPurpose || 'End Use',
    budget: leadData.budget || 'Under ₹75 Lakhs',
    timeline: leadData.timeline || 'Immediate',
    leadSource: leadData.leadSource || 'Walk-in',
    status: 'Reception Checked-in',
    updatedAt: now.toISOString(),
  };
}

async function postLeadToGoogleSheets(lead: Lead, googleWebAppUrl: string): Promise<void> {
  const res = await fetch(googleWebAppUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(lead),
  });

  if (res.type !== 'opaque' && !res.ok) {
    throw new Error(`Google Sheets sync failed with HTTP ${res.status}`);
  }
}

function setLocalSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving local settings:', e);
  }
}

export async function fetchAllLeads(): Promise<Lead[]> {
  try {
    const res = await fetch('/api/leads');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        setLocalLeads(data.leads);
        return data.leads;
      }
    }
  } catch (err) {
    console.warn('API unavailable, using local cache:', err);
  }
  return getLocalLeads();
}

export async function searchLeads(query: string): Promise<Lead[]> {
  try {
    const res = await fetch(`/api/leads/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.leads)) {
        return data.leads;
      }
    }
  } catch (err) {
    console.warn('API search unavailable, searching locally:', err);
  }

  const leads = getLocalLeads();
  if (!query.trim()) return leads.slice(0, 10);
  const q = query.toLowerCase().trim();
  return leads.filter(
    (l) =>
      l.customerName.toLowerCase().includes(q) ||
      l.mobile.includes(q) ||
      l.leadId.toLowerCase().includes(q)
  );
}

export async function createReceptionLead(leadData: Partial<Lead>): Promise<Lead> {
  let apiError: unknown = null;

  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.lead) {
        const local = getLocalLeads();
        setLocalLeads([data.lead, ...local]);
        return data.lead;
      }
    }
  } catch (err) {
    apiError = err;
    console.warn('API create lead failed, trying Google Apps Script:', err);
  }

  const localLeads = getLocalLeads();
  const settings = getLocalSettings();
  const googleWebAppUrl = settings.googleWebAppUrl || ENV_GOOGLE_WEB_APP_URL;

  if (!googleWebAppUrl) {
    throw new Error(
      apiError
        ? 'Could not reach the API, and no Google Apps Script Web App URL is configured.'
        : 'Google Apps Script Web App URL is not configured.'
    );
  }

  const newLead = generateLocalLead(leadData, localLeads);
  await postLeadToGoogleSheets(newLead, googleWebAppUrl);
  setLocalLeads([newLead, ...localLeads]);
  return newLead;
}

export async function updateSalesLead(leadId: string, salesData: Partial<Lead>): Promise<Lead> {
  try {
    const res = await fetch(`/api/leads/${leadId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(salesData),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.lead) {
        const local = getLocalLeads();
        const idx = local.findIndex((l) => l.leadId.toLowerCase() === leadId.toLowerCase());
        if (idx !== -1) {
          local[idx] = data.lead;
          setLocalLeads(local);
        }
        return data.lead;
      }
    }
  } catch (err) {
    console.warn('API update failed, updating locally:', err);
  }

  // Local fallback update
  const localLeads = getLocalLeads();
  const idx = localLeads.findIndex((l) => l.leadId.toLowerCase() === leadId.toLowerCase());
  if (idx === -1) throw new Error('Lead not found');

  const now = new Date().toISOString();
  const updatedLead: Lead = {
    ...localLeads[idx],
    ...salesData,
    status: 'Sales Discussion Completed',
    meetingTimestamp: now,
    updatedAt: now,
  };

  localLeads[idx] = updatedLead;
  setLocalLeads(localLeads);
  return updatedLead;
}

export async function fetchSettings(): Promise<AppSettings> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.settings) {
        setLocalSettings(data.settings);
        return data.settings;
      }
    }
  } catch (err) {
    console.warn('API settings unavailable, using local settings:', err);
  }
  return getLocalSettings();
}

export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
  setLocalSettings(settings);
  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.settings) {
        return data.settings;
      }
    }
  } catch (err) {
    console.warn('API save settings failed, saved locally:', err);
  }
  return settings;
}

export async function syncGoogleSheets(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/sheets/sync', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      return { success: data.success, message: data.message };
    }
  } catch (err) {
    console.warn('Server sheet sync unavailable, trying Google Apps Script directly:', err);
  }

  const settings = getLocalSettings();
  const googleWebAppUrl = settings.googleWebAppUrl || ENV_GOOGLE_WEB_APP_URL;

  if (!googleWebAppUrl) {
    return {
      success: false,
      message: 'Google Apps Script Web App URL is not configured.',
    };
  }

  const leads = getLocalLeads();
  if (!leads.length) {
    return {
      success: true,
      message: 'No local leads available to sync.',
    };
  }

  try {
    await Promise.all(leads.map((lead) => postLeadToGoogleSheets(lead, googleWebAppUrl)));
    return {
      success: true,
      message: `Submitted ${leads.length} local leads to Google Sheets.`,
    };
  } catch (err) {
    console.error('Error syncing directly to Google Sheets:', err);
  }

  return {
    success: false,
    message: 'Could not submit leads to Google Sheets.',
  };
}
