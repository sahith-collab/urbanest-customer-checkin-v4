import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { searchLeads, updateSalesLead } from '../../services/api';
import { Lead, SalesScreenKey } from '../../types';
import { CardSelect, CardOption } from '../common/CardSelect';
import {
  Search,
  User,
  Phone,
  Building,
  ArrowRight,
  CheckCircle,
  Clock,
  Sparkles,
  Calendar,
  FileText,
  AlertCircle,
  RefreshCw,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SalesFlow: React.FC = () => {
  const {
    leads,
    refreshLeads,
    selectedLeadForSales,
    setSelectedLeadForSales,
    settings,
  } = useApp();

  const [currentLead, setCurrentLead] = useState<Lead | null>(selectedLeadForSales);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Lead[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sales Flow Step Index
  const screens: SalesScreenKey[] = [
    'search',
    'summary',
    'config',
    'funding',
    'loan',
    'interest',
    'objections',
    'sitevisit',
    'followup',
    'executive',
    'notes',
    'success',
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(
    selectedLeadForSales ? 1 : 0
  );
  const currentScreenKey = screens[currentStepIndex];

  // Sales Form Data
  const [salesData, setSalesData] = useState({
    executive: settings.executives[0] || 'Sathish',
    configuration: '3 BHK',
    fundingSource: 'Self Funding' as any,
    loanRequired: 'No' as any,
    interestLevel: '🔥 Hot' as any,
    objections: [] as string[],
    siteVisit: 'Completed' as any,
    followUpDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize when currentLead changes or selectedLeadForSales changes
  useEffect(() => {
    if (selectedLeadForSales) {
      setCurrentLead(selectedLeadForSales);
      setCurrentStepIndex(1); // Jump to summary card

      // Pre-fill existing sales data if available
      setSalesData({
        executive: selectedLeadForSales.executive || settings.executives[0] || 'Sathish',
        configuration: selectedLeadForSales.configuration || '3 BHK',
        fundingSource: selectedLeadForSales.fundingSource || 'Self Funding',
        loanRequired: selectedLeadForSales.loanRequired || 'No',
        interestLevel: selectedLeadForSales.interestLevel || '🔥 Hot',
        objections: selectedLeadForSales.objections || [],
        siteVisit: selectedLeadForSales.siteVisit || 'Completed',
        followUpDate:
          selectedLeadForSales.followUpDate ||
          new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        notes: selectedLeadForSales.notes || '',
      });
    }
  }, [selectedLeadForSales]);

  // Instant Search Effect
  useEffect(() => {
    let isMounted = true;
    const doSearch = async () => {
      setIsSearching(true);
      const res = await searchLeads(searchQuery);
      if (isMounted) {
        setSearchResults(res);
        setIsSearching(false);
      }
    };
    doSearch();
    return () => {
      isMounted = false;
    };
  }, [searchQuery, leads]);

  const handleSelectCustomer = (lead: Lead) => {
    setCurrentLead(lead);
    setSelectedLeadForSales(lead);

    // Set configuration options based on project type
    const matchedProject = settings.projects.find((p) => p.name === lead.project);
    const defaultConf = matchedProject?.configurations[0] || '3 BHK';

    setSalesData({
      executive: lead.executive || settings.executives[0] || 'Sathish',
      configuration: lead.configuration || defaultConf,
      fundingSource: lead.fundingSource || 'Self Funding',
      loanRequired: lead.loanRequired || 'No',
      interestLevel: lead.interestLevel || '🔥 Hot',
      objections: lead.objections || [],
      siteVisit: lead.siteVisit || 'Completed',
      followUpDate:
        lead.followUpDate ||
        new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      notes: lead.notes || '',
    });

    setCurrentStepIndex(1); // Move to summary screen
  };

  const nextStep = () => {
    if (currentStepIndex < screens.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleSaveDiscussion = async () => {
    if (!currentLead) return;
    setIsSubmitting(true);
    try {
      await updateSalesLead(currentLead.leadId, salesData);
      await refreshLeads();
      setCurrentStepIndex(screens.indexOf('success'));
    } catch (err) {
      console.error('Failed to save sales meeting:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSalesFlow = () => {
    setCurrentLead(null);
    setSelectedLeadForSales(null);
    setSearchQuery('');
    setCurrentStepIndex(0);
  };

  // Determine configuration card options depending on currentLead.project
  const getConfigurationOptions = (): CardOption[] => {
    if (!currentLead) return [];
    const matchedProject = settings.projects.find((p) => p.name === currentLead.project);
    if (matchedProject && matchedProject.configurations.length > 0) {
      return matchedProject.configurations.map((c) => ({
        id: c,
        label: c,
      }));
    }

    // Default fallback based on project string
    if (currentLead.project.toLowerCase().includes('plot')) {
      return [
        { id: '1200 sq.ft', label: '1200 sq.ft', sublabel: '30 x 40 Dimension' },
        { id: '1500 sq.ft', label: '1500 sq.ft', sublabel: '30 x 50 Dimension' },
        { id: '2000 sq.ft', label: '2000 sq.ft', sublabel: '40 x 50 Dimension' },
        { id: 'Custom Plot', label: 'Custom Plot Size' },
      ];
    }

    return [
      { id: '2 BHK', label: '2 BHK', sublabel: 'Approx 1100 - 1300 sq.ft' },
      { id: '3 BHK', label: '3 BHK', sublabel: 'Approx 1500 - 1800 sq.ft' },
      { id: '4 BHK', label: '4 BHK', sublabel: 'Approx 2200 - 2600 sq.ft' },
      { id: 'Penthouse', label: 'Penthouse / Duplex' },
    ];
  };

  const fundingOptions: CardOption[] = [
    { id: 'Self Funding', label: 'Self Funding', sublabel: 'Outright capital / Bank savings' },
    { id: 'Home Loan', label: 'Home Loan', sublabel: 'Bank financing / Mortgage' },
    { id: 'Both', label: 'Part Self + Loan', sublabel: 'Down payment + Bank Loan' },
  ];

  const loanOptions: CardOption[] = [
    { id: 'Yes', label: 'Yes, Home Loan Required' },
    { id: 'No', label: 'No Loan Required' },
  ];

  const interestOptions: CardOption[] = [
    { id: '🔥 Hot', label: '🔥 Hot', sublabel: 'High conversion probability. Wants site booking soon.' },
    { id: '🙂 Warm', label: '🙂 Warm', sublabel: 'Interested, evaluating options & home loan eligibility.' },
    { id: '❄ Cold', label: '❄ Cold', sublabel: 'Exploratory walk-in. Low immediate timeline.' },
  ];

  const objectionOptions: CardOption[] = [
    { id: 'Price', label: 'Price / Budget' },
    { id: 'Location', label: 'Location / Distance' },
    { id: 'Configuration', label: 'Floorplan / Configuration' },
    { id: 'Amenities', label: 'Amenities / Features' },
    { id: 'Investment Return', label: 'ROI / Capital Appreciation' },
    { id: 'Family Decision', label: 'Family Approval Needed' },
    { id: 'Financing', label: 'Bank Loan Eligibility' },
    { id: 'Other', label: 'Other Specific Objection' },
  ];

  const siteVisitOptions: CardOption[] = [
    { id: 'Completed', label: 'Completed Today', sublabel: 'Sample flat / Plot shown' },
    { id: 'Rescheduled', label: 'Rescheduled for Later', sublabel: 'Coming back with family' },
    { id: 'Not Done', label: 'Not Done Yet', sublabel: 'Office discussion only' },
  ];

  const setFollowUpQuick = (days: number) => {
    const d = new Date(Date.now() + 86400000 * days);
    setSalesData({ ...salesData, followUpDate: d.toISOString().split('T')[0] });
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-between bg-white text-slate-900 overflow-hidden relative">
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-2xl mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreenKey}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="w-full space-y-6 text-left"
          >
            {/* SCREEN 1: SEARCH CUSTOMER */}
            {currentScreenKey === 'search' && (
              <div className="space-y-6 py-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 block mb-2">
                    Sales Executive Portal
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Search Customer
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Search by Mobile Number, Lead ID, or Name
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-4 top-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type Mobile, Lead ID (e.g. UR260803001) or Name..."
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-200 text-lg font-semibold focus:outline-none focus:border-slate-900 placeholder:text-slate-300 transition-colors"
                  />
                  {isSearching && (
                    <RefreshCw className="w-4 h-4 absolute right-4 top-5 text-slate-400 animate-spin" />
                  )}
                </div>

                {/* Results or Recent Reception Walk-ins */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>
                      {searchQuery
                        ? `Search Results (${searchResults.length})`
                        : 'Recent Reception Check-ins'}
                    </span>
                    <span className="font-mono text-slate-400">Instant Lookup</span>
                  </div>

                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {searchResults.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-sm">
                        No checked-in customers found. Check receptionist entry or try searching again.
                      </div>
                    ) : (
                      searchResults.map((lead) => (
                        <button
                          key={lead.leadId}
                          type="button"
                          onClick={() => handleSelectCustomer(lead)}
                          className="w-full text-left p-4 rounded-2xl border border-slate-200 hover:border-slate-900 hover:bg-slate-50 transition-all flex items-center justify-between group shadow-xs cursor-pointer"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white uppercase">
                                {lead.leadId}
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  lead.status === 'Sales Discussion Completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {lead.status}
                              </span>
                            </div>
                            <div className="font-bold text-slate-900 text-base">
                              {lead.customerName}
                            </div>
                            <div className="text-xs text-slate-500 font-medium">
                              📱 {lead.mobile} • Project: <b className="text-slate-800">{lead.project}</b> • Budget:{' '}
                              <b>{lead.budget}</b>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SCREEN 2: READ ONLY SUMMARY CARD */}
            {currentScreenKey === 'summary' && currentLead && (
              <div className="space-y-6 py-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 block mb-1">
                    Existing Lead Profile • Read Only
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {currentLead.customerName}
                  </h2>
                </div>

                {/* Premium Read-Only Summary Card */}
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-6 shadow-xs">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Lead ID
                      </span>
                      <span className="font-mono font-bold text-lg text-slate-900">
                        {currentLead.leadId}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Project
                      </span>
                      <span className="font-bold text-slate-900 text-base">
                        {currentLead.project}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase block">Budget</span>
                      <span className="font-bold text-slate-800">{currentLead.budget}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase block">Purpose</span>
                      <span className="font-bold text-slate-800">{currentLead.buyingPurpose}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase block">Timeline</span>
                      <span className="font-bold text-slate-800">{currentLead.timeline}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-semibold uppercase block">Mobile</span>
                      <span className="font-mono font-bold text-slate-800">{currentLead.mobile}</span>
                    </div>
                  </div>

                  {currentLead.location && (
                    <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600">
                      📍 Location: <b>{currentLead.location}</b> • Occupation: <b>{currentLead.occupation}</b>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setCurrentStepIndex(0)}
                    className="text-sm font-semibold text-slate-400 hover:text-slate-800"
                  >
                    Search Other
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all flex items-center gap-2 active:scale-98"
                  >
                    Continue Sales Discussion <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 3: REQUIREMENT DISCOVERY (Conditional by Project) */}
            {currentScreenKey === 'config' && currentLead && (
              <div className="space-y-6 py-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Requirement Discovery • {currentLead.project}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Interested Configuration
                  </h2>
                </div>

                <CardSelect
                  options={getConfigurationOptions()}
                  selectedId={salesData.configuration}
                  onSelect={(id) => {
                    setSalesData({ ...salesData, configuration: id });
                    setTimeout(nextStep, 200);
                  }}
                  columns={2}
                />

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-sm font-semibold text-slate-400 hover:text-slate-800"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 4: FUNDING SOURCE */}
            {currentScreenKey === 'funding' && (
              <div className="space-y-6 py-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Financial Planning
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Funding Source
                  </h2>
                </div>

                <CardSelect
                  options={fundingOptions}
                  selectedId={salesData.fundingSource}
                  onSelect={(id) => {
                    setSalesData({ ...salesData, fundingSource: id as any });
                    setTimeout(nextStep, 200);
                  }}
                  columns={1}
                />

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-sm font-semibold text-slate-400 hover:text-slate-800"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 5: LOAN REQUIRED */}
            {currentScreenKey === 'loan' && (
              <div className="space-y-6 py-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Financing Assistance
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Home Loan Required?
                  </h2>
                </div>

                <CardSelect
                  options={loanOptions}
                  selectedId={salesData.loanRequired}
                  onSelect={(id) => {
                    setSalesData({ ...salesData, loanRequired: id as any });
                    setTimeout(nextStep, 200);
                  }}
                  columns={2}
                />

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-sm font-semibold text-slate-400 hover:text-slate-800"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 6: CUSTOMER INTEREST */}
            {currentScreenKey === 'interest' && (
              <div className="space-y-6 py-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Buyer Intent
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Customer Interest Level
                  </h2>
                </div>

                <CardSelect
                  options={interestOptions}
                  selectedId={salesData.interestLevel}
                  onSelect={(id) => {
                    setSalesData({ ...salesData, interestLevel: id as any });
                    setTimeout(nextStep, 200);
                  }}
                  columns={1}
                />

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-sm font-semibold text-slate-400 hover:text-slate-800"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 7: OBJECTIONS (Multi-Select) */}
            {currentScreenKey === 'objections' && (
              <div className="space-y-6 py-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Sales Discovery • Multi-Select
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Customer Objections / Hesitations
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Select all points raised by the customer during discussion.
                  </p>
                </div>

                <CardSelect
                  options={objectionOptions}
                  selectedId={salesData.objections}
                  multiSelect={true}
                  onSelect={(id) => {
                    const current = salesData.objections;
                    const updated = current.includes(id)
                      ? current.filter((x) => x !== id)
                      : [...current, id];
                    setSalesData({ ...salesData, objections: updated });
                  }}
                  columns={2}
                />

                <div className="pt-6 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-sm font-semibold text-slate-400 hover:text-slate-800"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all flex items-center gap-2 active:scale-98"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 8: SITE VISIT */}
            {currentScreenKey === 'sitevisit' && (
              <div className="space-y-6 py-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Physical Walkthrough
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Site Visit Status
                  </h2>
                </div>

                <CardSelect
                  options={siteVisitOptions}
                  selectedId={salesData.siteVisit}
                  onSelect={(id) => {
                    setSalesData({ ...salesData, siteVisit: id as any });
                    setTimeout(nextStep, 200);
                  }}
                  columns={1}
                />

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-sm font-semibold text-slate-400 hover:text-slate-800"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 9: FOLLOW-UP DATE */}
            {currentScreenKey === 'followup' && (
              <div className="space-y-6 py-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Action Plan
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Next Follow-up Date
                  </h2>
                </div>

                {/* Quick Chips */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFollowUpQuick(1)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setFollowUpQuick(3)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                  >
                    In 3 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setFollowUpQuick(7)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                  >
                    Next Week
                  </button>
                  <button
                    type="button"
                    onClick={() => setFollowUpQuick(14)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
                  >
                    In 2 Weeks
                  </button>
                </div>

                {/* Native Date Picker */}
                <div className="pt-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Select Exact Date
                  </label>
                  <input
                    type="date"
                    value={salesData.followUpDate}
                    onChange={(e) => setSalesData({ ...salesData, followUpDate: e.target.value })}
                    className="w-full p-4 rounded-2xl border-2 border-slate-200 text-lg font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="pt-6 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-sm font-semibold text-slate-400 hover:text-slate-800"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all flex items-center gap-2 active:scale-98"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 10: ASSIGNED EXECUTIVE */}
            {currentScreenKey === 'executive' && (
              <div className="space-y-6 py-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Accountability
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Assigned Executive
                  </h2>
                </div>

                <CardSelect
                  options={settings.executives.map((exec) => ({
                    id: exec,
                    label: exec,
                  }))}
                  selectedId={salesData.executive}
                  onSelect={(id) => {
                    setSalesData({ ...salesData, executive: id });
                    setTimeout(nextStep, 200);
                  }}
                  columns={2}
                />

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-sm font-semibold text-slate-400 hover:text-slate-800"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 11: NOTES */}
            {currentScreenKey === 'notes' && (
              <div className="space-y-6 py-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Key Discussion Points
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Meeting Notes
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Document customer preferences, special requests, or floorplan customizations.
                  </p>
                </div>

                <div>
                  <textarea
                    rows={5}
                    value={salesData.notes}
                    onChange={(e) => setSalesData({ ...salesData, notes: e.target.value })}
                    placeholder="Enter meeting notes here (e.g. Requested East-facing 3 BHK on high floor. Willing to pay token if loan is pre-approved)..."
                    className="w-full p-4 rounded-2xl border-2 border-slate-200 text-base font-normal focus:outline-none focus:border-slate-900 placeholder:text-slate-300"
                  />
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-sm font-semibold text-slate-400 hover:text-slate-800"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSaveDiscussion}
                    className="px-10 py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-lg rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 active:scale-98"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" /> Saving Meeting...
                      </>
                    ) : (
                      <>
                        Save Meeting <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 12: SUCCESS CONFIRMATION */}
            {currentScreenKey === 'success' && currentLead && (
              <div className="text-center space-y-8 py-6 max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle className="w-10 h-10 stroke-[2.5]" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Meeting Saved Successfully
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Updated row in Google Sheet for Lead ID <b>{currentLead.leadId}</b>.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-2 text-left text-xs text-slate-700">
                  <div className="font-bold text-slate-900 text-sm">
                    Summary of Sales Update:
                  </div>
                  <div>• Interest Level: <b>{salesData.interestLevel}</b></div>
                  <div>• Configuration: <b>{salesData.configuration}</b></div>
                  <div>• Executive: <b>{salesData.executive}</b></div>
                  <div>• Follow-up Date: <b>{salesData.followUpDate}</b></div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={resetSalesFlow}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md transition-all"
                  >
                    Search Another Customer
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
