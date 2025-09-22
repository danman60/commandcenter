"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateClientCategorySchema = exports.CreateInteractionSchema = exports.InteractionTypeSchema = exports.AlertLevelSchema = exports.ClientCategorySchema = void 0;
var zod_1 = require("zod");
exports.ClientCategorySchema = zod_1.z.enum(['Previous Client', 'Warm Lead', 'Cold Lead']);
exports.AlertLevelSchema = zod_1.z.enum(['None', '3 days', '1 week', '3 weeks', '6 weeks']);
exports.InteractionTypeSchema = zod_1.z.enum(['Phone', 'Email', 'Meeting', 'Other']);
exports.CreateInteractionSchema = zod_1.z.object({
    contactId: zod_1.z.string(),
    type: exports.InteractionTypeSchema,
    notes: zod_1.z.string().optional(),
});
exports.UpdateClientCategorySchema = zod_1.z.object({
    category: exports.ClientCategorySchema,
});
