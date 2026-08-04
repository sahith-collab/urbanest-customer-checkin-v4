import React from 'react';
import { useApp } from '../context/AppContext';
import { UserPlus, Search, Building2, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export const RoleSelect: React.FC = () => {
  const { setRole, setIsSheetsModalOpen, setIsLeadListModalOpen } = useApp();

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 sm:p-8 bg-slate-50/50">
      <div className="max-w-xl w-full mx-auto text-center space-y-8">
        {/* Brand & Title */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/5 text-slate-700 text-xs font-semibold uppercase tracking-widest border border-slate-200">
            <Building2 className="w-3.5 h-3.5 text-slate-800" /> Urbanest Realty Sales Office
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Customer Check-in
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-md mx-auto font-normal">
            Choose your role to get started
          </p>
        </motion.div>

        {/* Large Centered Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left">
          {/* RECEPTION CARD */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            onClick={() => setRole('reception')}
            className="group relative bg-white hover:bg-slate-900 text-slate-900 hover:text-white p-6 sm:p-8 rounded-3xl border border-slate-200 hover:border-slate-900 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 group-hover:bg-white/10 text-amber-700 group-hover:text-amber-300 flex items-center justify-center mb-6 transition-colors">
                <UserPlus className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Reception</h2>
              <p className="text-slate-500 group-hover:text-slate-300 text-sm leading-relaxed">
                Create new customer lead in under 60 seconds with essential details.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between font-semibold text-xs uppercase tracking-wider text-amber-600 group-hover:text-amber-300">
              <span>Start Check-in</span>
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>

          {/* SALES CARD */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            onClick={() => setRole('sales')}
            className="group relative bg-white hover:bg-slate-900 text-slate-900 hover:text-white p-6 sm:p-8 rounded-3xl border border-slate-200 hover:border-slate-900 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px]"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 group-hover:bg-white/10 text-indigo-700 group-hover:text-indigo-300 flex items-center justify-center mb-6 transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Sales</h2>
              <p className="text-slate-500 group-hover:text-slate-300 text-sm leading-relaxed">
                Find checked-in customer and continue discussion without repeating questions.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between font-semibold text-xs uppercase tracking-wider text-indigo-600 group-hover:text-indigo-300">
              <span>Search & Continue</span>
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
        </div>

        {/* Quick Admin Footer Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="pt-4 flex items-center justify-center gap-4 text-xs font-medium text-slate-500"
        >
          <button
            onClick={() => setIsLeadListModalOpen(true)}
            className="hover:text-slate-900 underline underline-offset-4"
          >
            View Customer Directory
          </button>
          <span>•</span>
          <button
            onClick={() => setIsSheetsModalOpen(true)}
            className="hover:text-slate-900 underline underline-offset-4"
          >
            Google Sheets & Settings
          </button>
        </motion.div>
      </div>
    </div>
  );
};
