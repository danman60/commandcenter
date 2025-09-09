import { z } from 'zod';

export const ClientCategorySchema = z.enum(['Previous Client', 'Warm Lead', 'Cold Lead']);
export const AlertLevelSchema = z.enum(['None', '3 days', '1 week', '3 weeks', '6 weeks']);
export const InteractionTypeSchema = z.enum(['Phone', 'Email', 'Meeting', 'Other']);

export type ClientCategory = z.infer<typeof ClientCategorySchema>;
export type AlertLevel = z.infer<typeof AlertLevelSchema>;
export type InteractionType = z.infer<typeof InteractionTypeSchema>;

export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

export interface Client {
  id: string;
  clientName: string;
  city?: string;
  provinceState?: string;
  website?: string;
  tags?: string[];
  owner: string;
  category: ClientCategory;
  doNotContact: boolean;
  clientNotes?: string;
  lastOutreach?: string;
  daysSinceLastOutreach?: number;
  alertLevel: AlertLevel;
  nextTouchDate?: string;
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

export const CreateInteractionSchema = z.object({
  contactId: z.string(),
  type: InteractionTypeSchema,
  notes: z.string().optional(),
});

export const UpdateClientCategorySchema = z.object({
  category: ClientCategorySchema,
});

export type CreateInteractionRequest = z.infer<typeof CreateInteractionSchema>;
export type UpdateClientCategoryRequest = z.infer<typeof UpdateClientCategorySchema>;