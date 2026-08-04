import React from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, ArrowLeftRight, Settings, FileSpreadsheet, Users } from 'lucide-react';

interface HeaderProps {
  currentStepIndex?: number;
  totalSteps?: number;
  stepTitle?: string;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStepIndex,
  totalSteps,
  stepTitle,
  onBack,
}) => {
  const {
    role,
    setRole,
    setIsSheetsModalOpen,
    setIsLeadListModalOpen,
    settings,
  } = useApp();

  const progressPercentage =
    totalSteps && currentStepIndex !== undefined
      ? Math.min(100, Math.round(((currentStepIndex + 1) / totalSteps) * 100))
      : 0;

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setRole('select')}
            className="flex items-center gap-2 text-left group focus:outline-none"
            title="Return to Role Selection"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              U
            </div>
            <div>
              <span className="font-semibold tracking-wider text-slate-900 uppercase text-sm block leading-none">
                Urbanest
              </span>
              <span className="text-[10px] tracking-widest text-slate-400 font-medium uppercase block mt-0.5">
                Realty Check-in
              </span>
            </div>
          </button>

          {role !== 'select' && (
            <div className="hidden sm:flex items-center gap-2 ml-2 pl-3 border-l border-slate-200">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider ${
                  role === 'reception'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                }`}
              >
                {role === 'reception' ? 'Reception Desk' : 'Sales Executive'}
              </span>
            </div>
          )}
        </div>

        {/* Center: Back button / Step Title */}
        {role !== 'select' && onBack && (
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="text-xs text-slate-500 hover:text-slate-900 font-medium px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1"
            >
              ← Back
            </button>
            {stepTitle && (
              <span className="text-xs text-slate-400 hidden md:inline-block font-medium">
                {stepTitle}
              </span>
            )}
          </div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {role !== 'select' && (
            <>
              <button
                onClick={() => setIsLeadListModalOpen(true)}
                className="p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200"
                title="View All Customer Leads"
              >
                <Users className="w-4 h-4 text-slate-500" />
                <span className="hidden sm:inline">Leads Directory</span>
              </button>

              <button
                onClick={() => setRole('select')}
                className="p-2 sm:px-3 sm:py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200"
                title="Switch Role"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Switch Role</span>
              </button>
            </>
          )}

          <button
            onClick={() => setIsSheetsModalOpen(true)}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 relative"
            title="Google Sheets & Settings"
          >
            <Settings className="w-4 h-4 text-slate-600" />
            {settings.googleWebAppUrl && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </button>
        </div>
      </div>

      {/* Animated Top Progress Bar */}
      {totalSteps && totalSteps > 0 && currentStepIndex !== undefined && (
        <div className="w-full bg-slate-100 h-1 overflow-hidden">
          <div
            className="bg-slate-900 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
    </header>
  );
};
