import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CardSelect, CardOption } from '../common/CardSelect';
import { NumericKeypad } from '../common/NumericKeypad';
import { createReceptionLead } from '../../services/api';
import { Lead, ReceptionScreenKey } from '../../types';
import {
  ArrowRight,
  CheckCircle,
  Building,
  User,
  Phone,
  Mail,
  Briefcase,
  MapPin,
  Target,
  DollarSign,
  Clock,
  Share2,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ReceptionFlow: React.FC = () => {
  const { setRole, refreshLeads, settings, setSelectedLeadForSales } = useApp();

  // Screen steps sequence
  const screens: ReceptionScreenKey[] = [
    'welcome',
    'name',
    'mobile',
    'email',
    'occupation',
    'company',
    'location',
    'project',
    'purpose',
    'budget',
    'timeline',
    'source',
    'success',
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const currentScreenKey = screens[currentStepIndex];

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    mobile: '',
    email: '',
    occupation: 'Salaried',
    company: '',
    location: '',
    project: settings.projects[0]?.name || 'Eastfield',
    buyingPurpose: 'End Use',
    budget: '₹1 Cr – ₹1.25 Cr',
    timeline: 'Immediate',
    leadSource: 'Walk-in',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdLead, setCreatedLead] = useState<Lead | null>(null);
  const [copied, setCopied] = useState(false);

  // Input Focus Ref
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [currentStepIndex]);

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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const newLead = await createReceptionLead({
        ...formData,
        receptionist: settings.receptionistName,
        deviceId: settings.deviceId,
      });
      setCreatedLead(newLead);
      await refreshLeads();
      setCurrentStepIndex(screens.indexOf('success'));
    } catch (e) {
      console.error('Error submitting check-in:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      mobile: '',
      email: '',
      occupation: 'Salaried',
      company: '',
      location: '',
      project: settings.projects[0]?.name || 'Eastfield',
      buyingPurpose: 'End Use',
      budget: '₹1 Cr – ₹1.25 Cr',
      timeline: 'Immediate',
      leadSource: 'Walk-in',
    });
    setCreatedLead(null);
    setCurrentStepIndex(0);
  };

  const handleStartSalesForCreatedLead = () => {
    if (createdLead) {
      setSelectedLeadForSales(createdLead);
      setRole('sales');
    }
  };

  const copyLeadId = () => {
    if (createdLead?.leadId) {
      navigator.clipboard.writeText(createdLead.leadId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Card Options
  const occupationOptions: CardOption[] = [
    { id: 'Salaried', label: 'Salaried', sublabel: 'MNC / IT / Corporate employee' },
    { id: 'Business', label: 'Business Owner', sublabel: 'Trader / Manufacturer / Firm owner' },
    { id: 'Self Employed', label: 'Self Employed', sublabel: 'Doctor / CA / Architect / Consultant' },
    { id: 'Retired', label: 'Retired', sublabel: 'Former Govt / Private officer' },
    { id: 'Student', label: 'Student', sublabel: 'College or Higher studies' },
    { id: 'Other', label: 'Other Occupation', sublabel: 'Homemaker / Investor / Other' },
  ];

  const projectOptions: CardOption[] = settings.projects.map((p) => ({
    id: p.name,
    label: p.name,
    sublabel: `${p.type} • ${p.configurations.join(', ')}`,
    badge: p.type,
  }));

  const purposeOptions: CardOption[] = [
    { id: 'End Use', label: 'End Use', sublabel: 'Self living / Family residence' },
    { id: 'Investment', label: 'Investment', sublabel: 'Capital growth / Rental yield' },
    { id: 'Both', label: 'Both', sublabel: 'Future self use & investment value' },
  ];

  const budgetOptions: CardOption[] = settings.budgetOptions.map((b) => ({
    id: b,
    label: b,
  }));

  const timelineOptions: CardOption[] = [
    { id: 'Immediate', label: 'Immediate', sublabel: 'Within 30 days' },
    { id: '3 Months', label: '3 Months', sublabel: 'Next quarter decision' },
    { id: '6 Months', label: '6 Months', sublabel: 'Planning ahead' },
    { id: '1 Year+', label: '1 Year+', sublabel: 'Long term outlook' },
  ];

  const sourceOptions: CardOption[] = [
    { id: 'Walk-in', label: 'Walk-in', sublabel: 'Direct sales gallery visit' },
    { id: 'Google', label: 'Google Search / Ads' },
    { id: 'Meta', label: 'Meta (Instagram / Facebook)' },
    { id: 'LinkedIn', label: 'LinkedIn Ad / Post' },
    { id: 'Referral', label: 'Referral by Friend/Family' },
    { id: 'Channel Partner', label: 'Channel Partner / Broker' },
    { id: 'Newspaper', label: 'Newspaper Advertisement' },
    { id: 'Hoarding', label: 'Outdoor Hoarding / Billboard' },
    { id: 'Existing Customer', label: 'Existing Urbanest Buyer' },
    { id: 'Other', label: 'Other Source' },
  ];

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-between bg-white text-slate-900 overflow-hidden relative">
      {/* Container */}
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
            {/* SCREEN 1: WELCOME */}
            {currentScreenKey === 'welcome' && (
              <div className="text-center space-y-8 py-8">
                <div className="w-20 h-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-xl">
                  <Building className="w-10 h-10" />
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                    Welcome to Urbanest
                  </h1>
                  <p className="text-slate-500 text-base sm:text-lg max-w-md mx-auto">
                    Reception Customer Check-in
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full max-w-sm py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-3 mx-auto active:scale-98"
                  >
                    Start New Check-in <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 2: CUSTOMER NAME */}
            {currentScreenKey === 'name' && (
              <div className="space-y-8 py-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Step 1 of 11 • Customer Profile
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Customer Name
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Enter the full primary name for registration.
                  </p>
                </div>

                <div className="space-y-4">
                  <input
                    ref={inputRef}
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && formData.customerName.trim()) nextStep();
                    }}
                    className="w-full p-4 sm:p-5 text-xl sm:text-2xl font-semibold border-b-2 border-slate-300 focus:border-slate-900 focus:outline-none transition-colors placeholder:text-slate-300"
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
                    disabled={!formData.customerName.trim()}
                    onClick={nextStep}
                    className="px-8 py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white font-bold rounded-2xl transition-all flex items-center gap-2 active:scale-98"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 3: MOBILE NUMBER */}
            {currentScreenKey === 'mobile' && (
              <div className="space-y-6 py-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Step 2 of 11 • Verification
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Mobile Number
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    Used for instant lead lookup by sales executives.
                  </p>
                </div>

                <div className="space-y-4 text-center">
                  <div className="flex items-center justify-center gap-2 border-b-2 border-slate-300 focus-within:border-slate-900 pb-2">
                    <span className="text-xl sm:text-2xl font-bold text-slate-400">+91</span>
                    <input
                      ref={inputRef}
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mobile: e.target.value.replace(/\D/g, '').slice(0, 10),
                        })
                      }
                      placeholder="98765 43210"
                      className="w-full p-2 text-2xl sm:text-3xl font-mono font-bold tracking-wider focus:outline-none placeholder:text-slate-300"
                    />
                  </div>

                  {/* On-screen Numeric Keypad for Tablets */}
                  <div className="pt-2">
                    <NumericKeypad
                      value={formData.mobile}
                      onChange={(val) => setFormData({ ...formData, mobile: val })}
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="text-sm font-semibold text-slate-400 hover:text-slate-800"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={formData.mobile.length < 10}
                    onClick={nextStep}
                    className="px-8 py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white font-bold rounded-2xl transition-all flex items-center gap-2 active:scale-98"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 4: EMAIL (OPTIONAL) */}
            {currentScreenKey === 'email' && (
              <div className="space-y-8 py-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                      Step 3 of 11 • Communication
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase">
                      Optional
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Email Address
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">
                    For sending brochures and digital project quotes.
                  </p>
                </div>

                <div className="space-y-4">
                  <input
                    ref={inputRef}
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. rahul@example.com"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') nextStep();
                    }}
                    className="w-full p-4 sm:p-5 text-xl sm:text-2xl font-semibold border-b-2 border-slate-300 focus:border-slate-900 focus:outline-none transition-colors placeholder:text-slate-300"
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
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-5 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-colors"
                    >
                      Skip
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
              </div>
            )}

            {/* SCREEN 5: OCCUPATION */}
            {currentScreenKey === 'occupation' && (
              <div className="space-y-6 py-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Step 4 of 11 • Background
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Occupation
                  </h2>
                </div>

                <CardSelect
                  options={occupationOptions}
                  selectedId={formData.occupation}
                  onSelect={(id) => {
                    setFormData({ ...formData, occupation: id });
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

            {/* SCREEN 6: COMPANY (OPTIONAL) */}
            {currentScreenKey === 'company' && (
              <div className="space-y-8 py-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                      Step 5 of 11 • Organization
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase">
                      Optional
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Company / Organization
                  </h2>
                </div>

                <div className="space-y-4">
                  <input
                    ref={inputRef}
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Apex Tech Solutions"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') nextStep();
                    }}
                    className="w-full p-4 sm:p-5 text-xl sm:text-2xl font-semibold border-b-2 border-slate-300 focus:border-slate-900 focus:outline-none transition-colors placeholder:text-slate-300"
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
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-5 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-colors"
                    >
                      Skip
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
              </div>
            )}

            {/* SCREEN 7: LOCATION */}
            {currentScreenKey === 'location' && (
              <div className="space-y-8 py-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Step 6 of 11 • Residence
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Current Location / Locality
                  </h2>
                </div>

                <div className="space-y-4">
                  <input
                    ref={inputRef}
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Indiranagar, Bangalore"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && formData.location.trim()) nextStep();
                    }}
                    className="w-full p-4 sm:p-5 text-xl sm:text-2xl font-semibold border-b-2 border-slate-300 focus:border-slate-900 focus:outline-none transition-colors placeholder:text-slate-300"
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
                    disabled={!formData.location.trim()}
                    onClick={nextStep}
                    className="px-8 py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-white font-bold rounded-2xl transition-all flex items-center gap-2 active:scale-98"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 8: PROJECT INTERESTED */}
            {currentScreenKey === 'project' && (
              <div className="space-y-6 py-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Step 7 of 11 • Property Preference
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Project Interested
                  </h2>
                </div>

                <CardSelect
                  options={projectOptions}
                  selectedId={formData.project}
                  onSelect={(id) => {
                    setFormData({ ...formData, project: id });
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

            {/* SCREEN 9: BUYING PURPOSE */}
            {currentScreenKey === 'purpose' && (
              <div className="space-y-6 py-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Step 8 of 11 • Objective
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Buying Purpose
                  </h2>
                </div>

                <CardSelect
                  options={purposeOptions}
                  selectedId={formData.buyingPurpose}
                  onSelect={(id) => {
                    setFormData({ ...formData, buyingPurpose: id as any });
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

            {/* SCREEN 10: BUDGET */}
            {currentScreenKey === 'budget' && (
              <div className="space-y-6 py-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Step 9 of 11 • Financial Outlook
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Budget Range
                  </h2>
                </div>

                <CardSelect
                  options={budgetOptions}
                  selectedId={formData.budget}
                  onSelect={(id) => {
                    setFormData({ ...formData, budget: id });
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

            {/* SCREEN 11: BUYING TIMELINE */}
            {currentScreenKey === 'timeline' && (
              <div className="space-y-6 py-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Step 10 of 11 • Purchase Timeframe
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Buying Timeline
                  </h2>
                </div>

                <CardSelect
                  options={timelineOptions}
                  selectedId={formData.timeline}
                  onSelect={(id) => {
                    setFormData({ ...formData, timeline: id as any });
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

            {/* SCREEN 12: LEAD SOURCE */}
            {currentScreenKey === 'source' && (
              <div className="space-y-6 py-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 block mb-2">
                    Step 11 of 11 • Channel Attrib
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Lead Source
                  </h2>
                </div>

                <CardSelect
                  options={sourceOptions}
                  selectedId={formData.leadSource}
                  onSelect={(id) => {
                    setFormData({ ...formData, leadSource: id });
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
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="px-10 py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-lg rounded-2xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 active:scale-98"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" /> Registering...
                      </>
                    ) : (
                      <>
                        Complete Check-in <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 13: SUCCESS CONFIRMATION */}
            {currentScreenKey === 'success' && createdLead && (
              <div className="text-center space-y-8 py-6 max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle className="w-10 h-10 stroke-[2.5]" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Customer Registered Successfully
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Saved & synced to Google Sheet. Ready for sales consultation.
                  </p>
                </div>

                {/* Lead ID Box */}
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 block">
                    Assigned Customer Lead ID
                  </span>
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-mono text-3xl font-black text-slate-900 tracking-wider">
                      {createdLead.leadId}
                    </span>
                    <button
                      onClick={copyLeadId}
                      className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
                      title="Copy Lead ID"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {createdLead.customerName} • {createdLead.mobile}
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <button
                    type="button"
                    onClick={handleStartSalesForCreatedLead}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    Pass to Sales Discussion <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-colors"
                  >
                    Check-in Next Customer
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
