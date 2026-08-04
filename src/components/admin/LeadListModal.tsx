import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Search, Filter, Download, Phone, User, Calendar, ArrowRight } from 'lucide-react';
import { LeadDetailsModal } from '../common/LeadDetailsModal';
import { Lead } from '../../types';

export const LeadListModal: React.FC = () => {
  const {
    isLeadListModalOpen,
    setIsLeadListModalOpen,
    leads,
    setSelectedLeadForSales,
    setRole,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  if (!isLeadListModalOpen) return null;

  const filteredLeads = leads.filter((l) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      l.customerName.toLowerCase().includes(query) ||
      l.mobile.includes(query) ||
      l.leadId.toLowerCase().includes(query);

    const matchesProject = projectFilter === 'all' || l.project === projectFilter;
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;

    return matchesSearch && matchesProject && matchesStatus;
  });

  const uniqueProjects = Array.from(new Set(leads.map((l) => l.project))).filter(Boolean);

  const handleStartSalesForLead = (lead: Lead) => {
    setSelectedLeadForSales(lead);
    setIsLeadListModalOpen(false);
    setRole('sales');
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col h-[85vh]">
          {/* Top Bar */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Leads Directory</h2>
              <p className="text-xs text-slate-500">
                {leads.length} customer records synced with Google Sheet
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/api/sheets/export.csv"
                download="urbanest_leads.csv"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </a>
              <button
                onClick={() => setIsLeadListModalOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Name, Phone, Lead ID..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Project Filter */}
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">All Projects</option>
              {uniqueProjects.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">All Statuses</option>
              <option value="Reception Checked-in">Reception Checked-in</option>
              <option value="Sales Discussion Completed">Sales Discussion Completed</option>
            </select>
          </div>

          {/* Lead List Table/Cards */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm">
                No customer leads found matching criteria.
              </div>
            ) : (
              filteredLeads.map((lead) => (
                <div
                  key={lead.leadId}
                  onClick={() => setSelectedLead(lead)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
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
                      <span className="text-xs text-slate-400 font-medium ml-1">
                        {lead.project}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-900 text-base">
                        {lead.customerName}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {lead.mobile}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                      <span>Purpose: <b>{lead.buyingPurpose}</b></span>
                      <span>•</span>
                      <span>Budget: <b>{lead.budget}</b></span>
                      <span>•</span>
                      <span>Timeline: <b>{lead.timeline}</b></span>
                      {lead.executive && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700">Exec: <b>{lead.executive}</b></span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {lead.status !== 'Sales Discussion Completed' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartSalesForLead(lead);
                        }}
                        className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-1"
                      >
                        Start Sales <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <LeadDetailsModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onContinueSales={handleStartSalesForLead}
      />
    </>
  );
};
