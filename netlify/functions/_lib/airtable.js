"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.listTable = listTable;
exports.createRecord = createRecord;
exports.updateRecord = updateRecord;
exports.getRecord = getRecord;
exports.mapClientRecord = mapClientRecord;
exports.mapContactRecord = mapContactRecord;
exports.mapInteractionRecord = mapInteractionRecord;
var AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
var AIRTABLE_PAT = process.env.AIRTABLE_PAT;
var BASE_URL = "https://api.airtable.com/v0/".concat(AIRTABLE_BASE_ID);
if (!AIRTABLE_BASE_ID || !AIRTABLE_PAT) {
    throw new Error('Missing required Airtable environment variables');
}
function makeRequest(path_1) {
    return __awaiter(this, arguments, void 0, function (path, init) {
        var url, response, errorBody;
        if (init === void 0) { init = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "".concat(BASE_URL).concat(path);
                    return [4 /*yield*/, fetch(url, __assign(__assign({}, init), { headers: __assign({ 'Authorization': "Bearer ".concat(AIRTABLE_PAT), 'Content-Type': 'application/json' }, init.headers) }))];
                case 1:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 3];
                    return [4 /*yield*/, response.text()];
                case 2:
                    errorBody = _a.sent();
                    throw new Error("Airtable API error: ".concat(response.status, " ").concat(response.statusText, " - ").concat(errorBody));
                case 3: return [2 /*return*/, response.json()];
            }
        });
    });
}
function listTable(table_1) {
    return __awaiter(this, arguments, void 0, function (table, params) {
        var searchParams, query, path;
        if (params === void 0) { params = {}; }
        return __generator(this, function (_a) {
            searchParams = new URLSearchParams();
            if (params.fields) {
                params.fields.forEach(function (field) { return searchParams.append('fields[]', field); });
            }
            if (params.filterByFormula) {
                searchParams.append('filterByFormula', params.filterByFormula);
            }
            if (params.sort) {
                params.sort.forEach(function (sortItem, index) {
                    searchParams.append("sort[".concat(index, "][field]"), sortItem.field);
                    searchParams.append("sort[".concat(index, "][direction]"), sortItem.direction);
                });
            }
            if (params.maxRecords) {
                searchParams.append('maxRecords', params.maxRecords.toString());
            }
            if (params.pageSize) {
                searchParams.append('pageSize', params.pageSize.toString());
            }
            query = searchParams.toString();
            path = "/".concat(table).concat(query ? '?' + query : '');
            return [2 /*return*/, makeRequest(path)];
        });
    });
}
function createRecord(table, fields) {
    return __awaiter(this, void 0, void 0, function () {
        var path;
        return __generator(this, function (_a) {
            path = "/".concat(table);
            return [2 /*return*/, makeRequest(path, {
                    method: 'POST',
                    body: JSON.stringify({ fields: fields }),
                })];
        });
    });
}
function updateRecord(table, id, fields) {
    return __awaiter(this, void 0, void 0, function () {
        var path;
        return __generator(this, function (_a) {
            path = "/".concat(table, "/").concat(id);
            return [2 /*return*/, makeRequest(path, {
                    method: 'PATCH',
                    body: JSON.stringify({ fields: fields }),
                })];
        });
    });
}
function getRecord(table, id) {
    return __awaiter(this, void 0, void 0, function () {
        var path;
        return __generator(this, function (_a) {
            path = "/".concat(table, "/").concat(id);
            return [2 /*return*/, makeRequest(path)];
        });
    });
}
function mapClientRecord(record) {
    var _a;
    return {
        id: record.id,
        clientName: record.fields['Client Name'] || '',
        city: record.fields.City,
        provinceState: record.fields['Province/State'],
        website: record.fields.Website,
        tags: record.fields.Tags || [],
        owner: ((_a = record.fields.Owner) === null || _a === void 0 ? void 0 : _a.name) || record.fields.Owner || '',
        category: record.fields.Category || 'Cold Lead',
        doNotContact: record.fields['Do Not Contact'] || false,
        clientNotes: record.fields['Client Notes'],
        lastOutreach: record.fields['Last Outreach'],
        daysSinceLastOutreach: record.fields['Days Since Last Outreach'],
        alertLevel: record.fields['Alert Level'] || 'None',
        nextTouchDate: record.fields['Next Touch Date'],
    };
}
function mapContactRecord(record) {
    var _a;
    return {
        id: record.id,
        fullName: record.fields['Full Name'] || '',
        title: record.fields.Title,
        email: record.fields.Email,
        phone: record.fields.Phone,
        linkedClient: record.fields['Linked Client'],
        inheritedCategory: record.fields['Inherited Category'],
        owner: ((_a = record.fields.Owner) === null || _a === void 0 ? void 0 : _a.name) || record.fields.Owner,
        doNotContact: record.fields['Do Not Contact'] || false,
        quickNotes: record.fields['Quick Notes'],
        lastOutreach: record.fields['Last Outreach'],
        daysSinceLastOutreach: record.fields['Days Since Last Outreach'],
    };
}
function mapInteractionRecord(record) {
    var _a;
    return {
        id: record.id,
        contact: record.fields.Contact,
        client: record.fields.Client,
        type: record.fields.Type,
        notes: record.fields.Notes,
        timestamp: record.fields.Timestamp || record.createdTime,
        createdBy: ((_a = record.fields['Created By']) === null || _a === void 0 ? void 0 : _a.name) || record.fields['Created By'] || '',
    };
}
