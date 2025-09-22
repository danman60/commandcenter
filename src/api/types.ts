export type ClientCategory = 'Previous Client' | 'Warm Lead' | 'Cold Lead';
export type AlertLevel = 'None' | '3 days' | '1 week' | '3 weeks' | '6 weeks';
export type InteractionType = 'Phone' | 'Email' | 'Meeting' | 'Other';
export type ServiceStatus = 'Signed up' | 'Rejected' | 'UnAsked';

export interface Client {
  id: string;
  clientName: string;
  city?: string;
  provinceState?: string;
  website?: string;
  tags?: string[];
  owner: string;
  category: ClientCategory | string[] | any; // Allow flexible category types from API
  doNotContact: boolean;
  clientNotes?: string;
  lastOutreach?: string;
  daysSinceLastOutreach?: number;
  alertLevel: AlertLevel;
  nextTouchDate?: string;
  severityRank?: number;
  studiosageStatus?: ServiceStatus;
  recitalVideoStatus?: ServiceStatus;
  promoVideoStatus?: ServiceStatus;
}

export interface Contact {
  id: string;
  fullName: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedClient?: string[];
  inheritedCategory?: ClientCategory;
  owner?: string;
  doNotContact: boolean;
  quickNotes?: string;
  lastOutreach?: string;
  daysSinceLastOutreach?: number;
}

export interface Interaction {
  id: string;
  contact?: string[];
  client?: string[];
  type: InteractionType;
  notes?: string;
  timestamp: string;
  createdBy: string;
}

export interface CreateInteractionRequest {
  contactId: string;
  type: InteractionType;
  notes?: string;
}

export interface UpdateClientCategoryRequest {
  category: ClientCategory;
}

export interface ClientsResponse {
  clients: Client[];
  total: number;
  offset?: string;
}

export interface ContactsResponse {
  contacts: Contact[];
  total: number;
  offset?: string;
}

export interface InteractionResponse {
  success: boolean;
  interactionId: string;
  contactId: string;
  clientIds: string[];
  type: InteractionType;
  notes: string | null;
  timestamp: string;
  summary: string;
}