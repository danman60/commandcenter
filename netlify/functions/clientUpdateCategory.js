"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
var airtable_1 = require("./_lib/airtable");
var types_1 = require("./_lib/types");
var handler = function (event, context) { return __awaiter(void 0, void 0, void 0, function () {
    var clientId, requestData, validation, category, updatedRecord, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (event.httpMethod === 'OPTIONS') {
                    return [2 /*return*/, {
                            statusCode: 200,
                            headers: {
                                'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Headers': 'Content-Type',
                                'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
                            },
                            body: '',
                        }];
                }
                if (event.httpMethod !== 'PATCH') {
                    return [2 /*return*/, {
                            statusCode: 405,
                            body: JSON.stringify({ error: 'Method not allowed' }),
                        }];
                }
                clientId = event.path.split('/').pop();
                if (!clientId) {
                    return [2 /*return*/, {
                            statusCode: 400,
                            headers: {
                                'Access-Control-Allow-Origin': '*',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ error: 'Client ID is required' }),
                        }];
                }
                if (!event.body) {
                    return [2 /*return*/, {
                            statusCode: 400,
                            headers: {
                                'Access-Control-Allow-Origin': '*',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ error: 'Request body is required' }),
                        }];
                }
                requestData = JSON.parse(event.body);
                validation = types_1.UpdateClientCategorySchema.safeParse(requestData);
                if (!validation.success) {
                    return [2 /*return*/, {
                            statusCode: 400,
                            headers: {
                                'Access-Control-Allow-Origin': '*',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                error: 'Invalid request data',
                                details: validation.error.errors,
                            }),
                        }];
                }
                category = validation.data.category;
                return [4 /*yield*/, (0, airtable_1.updateRecord)('Clients', clientId, {
                        Category: category,
                    })];
            case 1:
                updatedRecord = _a.sent();
                return [2 /*return*/, {
                        statusCode: 200,
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            success: true,
                            clientId: clientId,
                            category: category,
                            updatedAt: updatedRecord.createdTime,
                        }),
                    }];
            case 2:
                error_1 = _a.sent();
                console.error('Error updating client category:', error_1);
                return [2 /*return*/, {
                        statusCode: 500,
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            error: error_1 instanceof Error ? error_1.message : 'Unknown error',
                        }),
                    }];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.handler = handler;
