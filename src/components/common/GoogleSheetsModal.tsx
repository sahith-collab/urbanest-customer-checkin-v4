import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  FileSpreadsheet,
  Copy,
  Check,
  RefreshCw,
  Download,
  Link,
  Plus,
  Trash2,
} from 'lucide-react';
import { syncGoogleSheets } from '../../services/api';

export const GoogleSheetsModal: React.FC = () => {
  const { isSheetsModalOpen, setIsSheetsModalOpen, settings, updateSettings } = useApp();
  const [activeTab, setActiveTab] = useState<'sheets' | 'options'>('sheets');
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Local state for editing settings
  const [googleWebAppUrl, setGoogleWebAppUrl] = useState(settings.googleWebAppUrl || '');
  const [googleSheetUrl, setGoogleSheetUrl] = useState(settings.googleSheetUrl || '');
  const [receptionistName, setReceptionistName] = useState(settings.receptionistName || '');
  const [newExecutive, setNewExecutive] = useState('');
  const [executives, setExecutives] = useState<string[]>(settings.executives || []);

  if (!isSheetsModalOpen) return null;

  const handleSaveConfig = async () => {
    await updateSettings({
      ...settings,
      googleWebAppUrl,
      googleSheetUrl,
      receptionistName,
      executives,
    });
    setSyncStatus('Settings updated successfully');
    setTimeout(() => setSyncStatus(null), 3000);
  };

  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    const result = await syncGoogleSheets();
    setIsSyncing(false);
    setSyncStatus(result.message);
  };

  const appsScriptCode = `// Urbanest Realty Customer Check-in - Google Apps Script
// Paste this code in Google Sheet -> Extensions -> Apps Script
// Then click 'Deploy' -> 'New deployment' -> 'Web app'
// Execute as: Me
// Who has access: Anyone

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: "success", leads: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var headers = data[0];
    var leads = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var lead = {};
      for (var j = 0; j < headers.length; j++) {
        lead[headers[j]] = row[j];
      }
      leads.push(lead);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "success", leads: leads }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Ensure Header Row exists
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Lead ID", "Created At", "Receptionist", "Customer Name", "Mobile", "Email",
        "Occupation", "Company", "Current Location", "Project", "Buying Purpose", "Budget",
        "Buying Timeline", "Lead Source", "Sales Executive", "Configuration Interested", "Funding Source",
        "Loan Required", "Interest Level", "Objections", "Site Visit", "Follow-up Date",
        "Notes", "Status", "Sales Updated At", "Device ID"
      ]);
      sheet.getRange(1, 1, 1, 26).setFontWeight("bold").setBackground("#F1F5F9");
    }
    
    var leadId = data.leadId || data["Lead ID"] || "";
    var existingRow = -1;
    
    // Check if Lead ID already exists
    if (leadId && sheet.getLastRow() > 1) {
      var leadIds = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
      for (var i = 0; i < leadIds.length; i++) {
        if (leadIds[i][0] === leadId) {
          existingRow = i + 2; // Row number in sheet
          break;
        }
      }
    }
    
    var rowValues = [
      data.leadId || data["Lead ID"] || "",
      data.timestamp || data["Created At"] || new Date().toISOString(),
      data.receptionist || data["Receptionist"] || "",
      data.customerName || data["Customer Name"] || "",
      data.mobile || data["Mobile"] || "",
      data.email || data["Email"] || "",
      data.occupation || data["Occupation"] || "",
      data.company || data["Company"] || "",
      data.location || data["Current Location"] || "",
      data.project || data["Project"] || "",
      data.buyingPurpose || data["Buying Purpose"] || "",
      data.budget || data["Budget"] || "",
      data.timeline || data["Buying Timeline"] || "",
      data.leadSource || data["Lead Source"] || "",
      data.executive || data["Sales Executive"] || "",
      data.configuration || data["Configuration Interested"] || "",
      data.fundingSource || data["Funding Source"] || "",
      data.loanRequired || data["Loan Required"] || "",
      data.interestLevel || data["Interest Level"] || "",
      Array.isArray(data.objections) ? data.objections.join(", ") : (data.objections || data["Objections"] || ""),
      data.siteVisit || data["Site Visit"] || "",
      data.followUpDate || data["Follow-up Date"] || "",
      data.notes || data["Notes"] || "",
      data.status || data["Status"] || "New",
      data.meetingTimestamp || data["Sales Updated At"] || "",
      data.deviceId || data["Device ID"] || ""
    ];
    
    if (existingRow > 0) {
      sheet.getRange(existingRow, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      sheet.appendRow(rowValues);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", leadId: leadId }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;

  const copyScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addExecutive = () => {
    if (newExecutive.trim() && !executives.includes(newExecutive.trim())) {
      setExecutives([...executives, newExecutive.trim()]);
      setNewExecutive('');
    }
  };

  const removeExecutive = (name: string) => {
    setExecutives(executives.filter((e) => e !== name));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Database & Google Sheets Sync
              </h2>
              <p className="text-xs text-slate-500">
                One Google Sheet source of truth for Reception & Sales
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSheetsModalOpen(false)}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 px-6 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('sheets')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'sheets'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Google Sheets Webhook URL
          </button>
          <button
            onClick={() => setActiveTab('options')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'options'
                ? 'border-slate-900 text-slate-900 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Sales Executives & Office Config
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'sheets' ? (
            <>
              {/* Web App URL Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Google Apps Script Web App URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Link className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="url"
                      value={googleWebAppUrl}
                      onChange={(e) => setGoogleWebAppUrl(e.target.value)}
                      placeholder="https://script.google.com/macros/s/.../exec"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Save URL
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  When configured, every new check-in or sales update automatically updates the Google Sheet row instantly!
                </p>
              </div>

              {/* Action Buttons: Sync & CSV */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleTriggerSync}
                  disabled={isSyncing || !googleWebAppUrl}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sync All Leads Now
                </button>

                <a
                  href="/api/sheets/export.csv"
                  download="urbanest_leads.csv"
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs flex items-center gap-2 transition-colors border border-slate-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download CSV for Google Sheet
                </a>
              </div>

              {syncStatus && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-200">
                  {syncStatus}
                </div>
              )}

              {/* 1-Click Apps Script Setup Instructions */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      1-Click Google Apps Script Generator
                    </h3>
                    <p className="text-xs text-slate-500">
                      Copy code & paste into Google Sheet → Extensions → Apps Script
                    </p>
                  </div>
                  <button
                    onClick={copyScript}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Code
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <pre className="bg-slate-900 text-slate-200 p-3 rounded-xl text-[11px] overflow-x-auto max-h-48 font-mono leading-relaxed">
                    {appsScriptCode}
                  </pre>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Reception Desk Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Default Receptionist Name
                </label>
                <input
                  type="text"
                  value={receptionistName}
                  onChange={(e) => setReceptionistName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Sales Executives List */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Sales Executives Team
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newExecutive}
                    onChange={(e) => setNewExecutive(e.target.value)}
                    placeholder="Add executive name..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={addExecutive}
                    className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {executives.map((exec) => (
                    <span
                      key={exec}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-medium border border-slate-200"
                    >
                      {exec}
                      <button
                        type="button"
                        onClick={() => removeExecutive(exec)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
