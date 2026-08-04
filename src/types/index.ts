export type AppRole = 'select' | 'reception' | 'sales' | 'admin';

export type OccupationType = 
  | 'Salaried' 
  | 'Business' 
  | 'Self Employed' 
  | 'Retired' 
  | 'Student' 
  | 'Other';

export type BuyingPurposeType = 'End Use' | 'Investment' | 'Both';

export type TimelineType = 'Immediate' | '3 Months' | '6 Months' | '1 Year+';

export type LeadSourceType = 
  | 'Google' 
  | 'Meta' 
  | 'LinkedIn' 
  | 'Walk-in' 
  | 'Referral' 
  | 'Channel Partner' 
  | 'Newspaper' 
  | 'Hoarding' 
  | 'Existing Customer' 
  | 'Other';

export type FundingSourceType = 'Self Funding' | 'Home Loan' | 'Both';

export type LoanRequiredType = 'Yes' | 'No';

export type InterestLevelType = '🔥 Hot' | '🙂 Warm' | '❄ Cold';

export type SiteVisitType = 'Completed' | 'Rescheduled' | 'Not Done';

export type LeadStatusType = 
  | 'Reception Checked-in' 
  | 'Sales Discussion Completed' 
  | 'Follow-up Scheduled' 
  | 'Converted' 
  | 'Lost';

export interface Lead {
  leadId: string; // Primary Key e.g. UR250803001
  timestamp: string; // ISO string when created
  receptionist: string;
  deviceId: string;
  customerName: string;
  mobile: string;
  email?: string;
  occupation: OccupationType | string;
  company?: string;
  location: string;
  project: string;
  buyingPurpose: BuyingPurposeType;
  budget: string;
  timeline: TimelineType;
  leadSource: LeadSourceType | string;
  
  // Sales Discussion Fields (Updated on the SAME row)
  executive?: string;
  configuration?: string;
  fundingSource?: FundingSourceType;
  loanRequired?: LoanRequiredType;
  interestLevel?: InterestLevelType;
  objections?: string[];
  siteVisit?: SiteVisitType;
  followUpDate?: string;
  notes?: string;
  status: LeadStatusType;
  meetingTimestamp?: string;
  updatedAt?: string;
}

export interface AppSettings {
  receptionistName: string;
  deviceId: string;
  googleSheetUrl: string;
  googleWebAppUrl: string; // Google Apps Script Endpoint URL
  autoSyncGoogleSheets: boolean;
  projects: {
    id: string;
    name: string;
    type: 'Apartments' | 'Plots' | 'Villas' | 'Commercial';
    configurations: string[];
  }[];
  executives: string[];
  receptionists: string[];
  budgetOptions: string[];
}

export type ReceptionScreenKey = 
  | 'welcome'
  | 'name'
  | 'mobile'
  | 'email'
  | 'occupation'
  | 'company'
  | 'location'
  | 'project'
  | 'purpose'
  | 'budget'
  | 'timeline'
  | 'source'
  | 'success';

export type SalesScreenKey =
  | 'search'
  | 'summary'
  | 'config'
  | 'funding'
  | 'loan'
  | 'interest'
  | 'objections'
  | 'sitevisit'
  | 'followup'
  | 'executive'
  | 'notes'
  | 'success';
