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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const storage_1 = require("firebase/storage");
const _1 = __importDefault(require("."));
const storage = (0, storage_1.getStorage)(_1.default);
function uploadFile(fileName, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let fileRef = yield (0, storage_1.uploadBytes)((0, storage_1.ref)(storage, `/ads-images/${fileName}`), data);
        const { name } = fileRef.metadata;
        return {
            name,
            url: `/ads-images/${fileName}`
        };
    });
}
exports.uploadFile = uploadFile;
exports.default = storage;
