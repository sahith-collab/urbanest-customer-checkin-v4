import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// File storage path
const DATA_DIR = path.join(process.cwd(), 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial mock default settings
const defaultSettings = {
  receptionistName: 'Reception Tablet 1',
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

// Seed initial leads if file does not exist
const seedLeads = [
  {
    leadId: 'UR260803001',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    receptionist: 'Kavita Rao',
    deviceId: 'IPAD-URBANEST-01',
    customerName: 'Rahul Sharma',
    mobile: '9876543210',
    email: 'rahul.sharma@example.com',
    occupation: 'Business',
    company: 'Apex Tech Solutions',
    location: 'Indiranagar, Bangalore',
    project: 'Eastfield',
    buyingPurpose: 'Investment',
    budget: '₹1 Cr – ₹1.25 Cr',
    timeline: '3 Months',
    leadSource: 'Walk-in',
    status: 'Reception Checked-in',
  },
  {
    leadId: 'UR260803002',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    receptionist: 'Kavita Rao',
    deviceId: 'IPAD-URBANEST-01',
    customerName: 'Ananya Deshmukh',
    mobile: '9812345678',
    email: 'ananya.d@example.com',
    occupation: 'Salaried',
    company: 'Google India',
    location: 'HSR Layout, Bangalore',
    project: 'Serene Exotica',
    buyingPurpose: 'End Use',
    budget: '₹1.5 Cr – ₹2 Cr',
    timeline: 'Immediate',
    leadSource: 'Google',
    executive: 'Sathish',
    configuration: '1800-2400 sft.',
    fundingSource: 'Home Loan',
    loanRequired: 'Yes',
    interestLevel: '🔥 Hot',
    objections: ['Financing'],
    siteVisit: 'Completed',
    followUpDate: '2026-08-05',
    notes: 'Very interested in East-facing villa. Requested floor plan PDF via WhatsApp.',
    status: 'Sales Discussion Completed',
    meetingTimestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    leadId: 'UR260803003',
    timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    receptionist: 'Sneha Patel',
    deviceId: 'IPAD-URBANEST-02',
    customerName: 'Vikram & Sunita Kulkarni',
    mobile: '9900112233',
    email: 'vkulkarni@example.com',
    occupation: 'Self Employed',
    company: 'Kulkarni Enterprises',
    location: 'Koramangala, Bangalore',
    project: 'Eastfield',
    buyingPurpose: 'Both',
    budget: '₹1.25 Cr – ₹1.5 Cr',
    timeline: '6 Months',
    leadSource: 'Referral',
    status: 'Reception Checked-in',
  },
];

function readLeads(): any[] {
  try {
    if (!fs.existsSync(LEADS_FILE)) {
      fs.writeFileSync(LEADS_FILE, JSON.stringify(seedLeads, null, 2));
      return seedLeads;
    }
    const data = fs.readFileSync(LEADS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading leads file:', err);
    return [];
  }
}

function writeLeads(leads: any[]): void {
  try {
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2));
  } catch (err) {
    console.error('Error writing leads file:', err);
  }
}

function readSettings(): any {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
      return defaultSettings;
    }
    const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    return { ...defaultSettings, ...JSON.parse(data) };
  } catch (err) {
    console.error('Error reading settings file:', err);
    return defaultSettings;
  }
}

function writeSettings(settings: any): void {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (err) {
    console.error('Error writing settings file:', err);
  }
}

// Generate sequential Lead ID in format UR + YYMMDD + 3 digit index (e.g., UR260803001)
function generateLeadId(leads: any[]): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const prefix = `UR${yy}${mm}${dd}`;

  // Find all existing lead IDs matching prefix
  const todayLeads = leads.filter((l) => l.leadId && l.leadId.startsWith(prefix));
  let maxNum = 0;
  todayLeads.forEach((l) => {
    const numPart = parseInt(l.leadId.slice(prefix.length), 10);
    if (!isNaN(numPart) && numPart > maxNum) {
      maxNum = numPart;
    }
  });

  const nextNum = String(maxNum + 1).padStart(3, '0');
  return `${prefix}${nextNum}`;
}

// Helper: Push lead to Google Apps Script Web App if configured
async function syncToGoogleSheets(lead: any, settings: any) {
  if (!settings.googleWebAppUrl) return;

  try {
    const response = await fetch(settings.googleWebAppUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lead),
      redirect: "follow",
    });

    const text = await response.text();

    console.log("Google Apps Script Response:", response.status, text);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    console.log(`Successfully synced ${lead.leadId} to Google Sheets`);
  } catch (err) {
    console.error("Google Sheets sync failed:", err);
  }
}

// API Routes
app.get('/api/leads', (req, res) => {
  const leads = readLeads();
  res.json({ success: true, leads });
});

app.get('/api/leads/search', (req, res) => {
  const query = String(req.query.q || '').trim().toLowerCase();
  const leads = readLeads();

  if (!query) {
    return res.json({ success: true, leads: leads.slice(0, 10) });
  }

  const results = leads.filter((l) => {
    const nameMatch = l.customerName?.toLowerCase().includes(query);
    const mobileMatch = l.mobile?.includes(query);
    const idMatch = l.leadId?.toLowerCase().includes(query);
    return nameMatch || mobileMatch || idMatch;
  });

  res.json({ success: true, leads: results });
});

app.get('/api/leads/:leadId', (req, res) => {
  const { leadId } = req.params;
  const leads = readLeads();
  const lead = leads.find((l) => l.leadId.toLowerCase() === leadId.toLowerCase());

  if (!lead) {
    return res.status(404).json({ success: false, message: 'Customer lead not found' });
  }

  res.json({ success: true, lead });
});

app.post('/api/leads', (req, res) => {
  const leads = readLeads();
  const settings = readSettings();

  const newLeadId = generateLeadId(leads);
  const now = new Date().toISOString();

  const newLead = {
    leadId: newLeadId,
    timestamp: now,
    receptionist: req.body.receptionist || settings.receptionistName || 'Reception',
    deviceId: req.body.deviceId || settings.deviceId || 'IPAD-01',
    customerName: req.body.customerName || '',
    mobile: req.body.mobile || '',
    email: req.body.email || '',
    occupation: req.body.occupation || 'Other',
    company: req.body.company || '',
    location: req.body.location || '',
    project: req.body.project || '',
    buyingPurpose: req.body.buyingPurpose || 'End Use',
    budget: req.body.budget || '',
    timeline: req.body.timeline || 'Immediate',
    leadSource: req.body.leadSource || 'Walk-in',
    status: 'Reception Checked-in',
    updatedAt: now,
  };

  leads.unshift(newLead);
  writeLeads(leads);

  // Background Google Sheets Sync
  syncToGoogleSheets(newLead, settings);

  res.json({ success: true, lead: newLead });
});

app.put('/api/leads/:leadId', (req, res) => {
  const { leadId } = req.params;
  const leads = readLeads();
  const settings = readSettings();

  const index = leads.findIndex((l) => l.leadId.toLowerCase() === leadId.toLowerCase());
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Lead not found for updating' });
  }

  const existingLead = leads[index];
  const now = new Date().toISOString();

  // Update ONLY sales fields, retaining reception inputs
  const updatedLead = {
    ...existingLead,
    executive: req.body.executive || existingLead.executive || '',
    configuration: req.body.configuration || existingLead.configuration || '',
    fundingSource: req.body.fundingSource || existingLead.fundingSource || '',
    loanRequired: req.body.loanRequired || existingLead.loanRequired || 'No',
    interestLevel: req.body.interestLevel || existingLead.interestLevel || '🙂 Warm',
    objections: req.body.objections || existingLead.objections || [],
    siteVisit: req.body.siteVisit || existingLead.siteVisit || 'Completed',
    followUpDate: req.body.followUpDate || existingLead.followUpDate || '',
    notes: req.body.notes !== undefined ? req.body.notes : existingLead.notes || '',
    status: 'Sales Discussion Completed',
    meetingTimestamp: now,
    updatedAt: now,
  };

  leads[index] = updatedLead;
  writeLeads(leads);

  // Background Google Sheets Sync
  syncToGoogleSheets(updatedLead, settings);

  res.json({ success: true, lead: updatedLead });
});

app.get('/api/settings', (req, res) => {
  const settings = readSettings();
  res.json({ success: true, settings });
});

app.post('/api/settings', (req, res) => {
  const settings = readSettings();
  const updatedSettings = { ...settings, ...req.body };
  writeSettings(updatedSettings);
  res.json({ success: true, settings: updatedSettings });
});

// CSV Export route for direct Google Sheets upload
app.get('/api/sheets/export.csv', (req, res) => {
  const leads = readLeads();
  const headers = [
    'Lead ID',
    'Created At',
    'Receptionist',
    'Customer Name',
    'Mobile',
    'Email',
    'Occupation',
    'Company',
    'Current Location',
    'Project',
    'Buying Purpose',
    'Budget',
    'Buying Timeline',
    'Lead Source',
    'Sales Executive',
    'Configuration Interested',
    'Funding Source',
    'Loan Required',
    'Interest Level',
    'Objections',
    'Site Visit',
    'Follow-up Date',
    'Notes',
    'Status',
    'Sales Updated At',
    'Device ID',
  ];

  const escapeCsv = (val: any) => {
    if (val === undefined || val === null) return '""';
    let str = String(val);
    if (Array.isArray(val)) str = val.join(', ');
    return `"${str.replace(/"/g, '""')}"`;
  };

  const rows = leads.map((l) => [
    escapeCsv(l.leadId),
    escapeCsv(l.timestamp),
    escapeCsv(l.receptionist),
    escapeCsv(l.customerName),
    escapeCsv(l.mobile),
    escapeCsv(l.email),
    escapeCsv(l.occupation),
    escapeCsv(l.company),
    escapeCsv(l.location),
    escapeCsv(l.project),
    escapeCsv(l.buyingPurpose),
    escapeCsv(l.budget),
    escapeCsv(l.timeline),
    escapeCsv(l.leadSource),
    escapeCsv(l.executive),
    escapeCsv(l.configuration),
    escapeCsv(l.fundingSource),
    escapeCsv(l.loanRequired),
    escapeCsv(l.interestLevel),
    escapeCsv(l.objections),
    escapeCsv(l.siteVisit),
    escapeCsv(l.followUpDate),
    escapeCsv(l.notes),
    escapeCsv(l.status),
    escapeCsv(l.meetingTimestamp),
    escapeCsv(l.deviceId),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="urbanest_leads.csv"');
  res.send(csvContent);
});

// Manual sync route
app.post('/api/sheets/sync', async (req, res) => {
  const settings = readSettings();
  const leads = readLeads();

  if (!settings.googleWebAppUrl) {
    return res.status(400).json({
      success: false,
      message: 'Google Apps Script Web App URL is not configured in settings.',
    });
  }

  let syncedCount = 0;
  for (const lead of leads) {
    try {
      await fetch(settings.googleWebAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
      syncedCount++;
    } catch (e) {
      console.error(`Failed to sync ${lead.leadId}:`, e);
    }
  }

  res.json({
    success: true,
    message: `Successfully synced ${syncedCount} of ${leads.length} leads to Google Sheets.`,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Urbanest Customer Check-in server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
