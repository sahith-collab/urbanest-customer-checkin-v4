import React from 'react';
import { Lead } from '../../types';
import { X, Calendar, User, Phone, Mail, Building, MapPin, Tag, FileText, CheckCircle2 } from 'lucide-react';

interface LeadDetailsModalProps {
  lead: Lead | null;
  onClose: () => void;
  onContinueSales?: (lead: Lead) => void;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  lead,
  onClose,
  onContinueSales,
}) => {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-900 text-white uppercase tracking-wider">
                {lead.leadId}
              </span>
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  lead.status === 'Sales Discussion Completed'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {lead.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{lead.customerName}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2.5 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="font-mono font-medium">{lead.mobile}</span>
            </div>
            {lead.email && (
              <div className="flex items-center gap-2.5 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="truncate">{lead.email}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-slate-700">
              <User className="w-4 h-4 text-slate-400" />
              <span>{lead.occupation} {lead.company ? `(${lead.company})` : ''}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{lead.location || 'Not specified'}</span>
            </div>
          </div>

          {/* Requirement Specs */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Reception Check-in Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">Project</span>
                <span className="font-semibold text-slate-900">{lead.project}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">Budget</span>
                <span className="font-semibold text-slate-900">{lead.budget}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">Purpose</span>
                <span className="font-semibold text-slate-900">{lead.buyingPurpose}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">Timeline</span>
                <span className="font-semibold text-slate-900">{lead.timeline}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">Lead Source</span>
                <span className="font-semibold text-slate-900">{lead.leadSource}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">Receptionist</span>
                <span className="font-semibold text-slate-900">{lead.receptionist}</span>
              </div>
            </div>
          </div>

          {/* Sales Discussion Details if completed */}
          {lead.status === 'Sales Discussion Completed' ? (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Sales Executive Discussion
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Assigned Exec</span>
                  <span className="font-semibold text-slate-900">{lead.executive || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Interest Level</span>
                  <span className="font-semibold text-slate-900">{lead.interestLevel || 'Warm'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Configuration</span>
                  <span className="font-semibold text-slate-900">{lead.configuration || 'Any'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Funding</span>
                  <span className="font-semibold text-slate-900">{lead.fundingSource || 'Self'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Site Visit</span>
                  <span className="font-semibold text-slate-900">{lead.siteVisit || 'Pending'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Follow-up Date</span>
                  <span className="font-semibold text-slate-900">{lead.followUpDate || 'None'}</span>
                </div>
              </div>

              {lead.objections && lead.objections.length > 0 && (
                <div className="mt-3">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-1">Objections Raised:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {lead.objections.map((obj) => (
                      <span key={obj} className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs font-medium border border-rose-100">
                        {obj}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {lead.notes && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Sales Discussion Notes:</span>
                  <p className="text-slate-800 text-xs whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}
            </div>
          ) : (
            onContinueSales && (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-amber-900 text-sm block">Awaiting Sales Discussion</span>
                  <span className="text-xs text-amber-700">Checked in by reception. Ready for sales discovery.</span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onContinueSales(lead);
                  }}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Continue Sales
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
