"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.table = void 0;
const firestore_1 = require("firebase/firestore");
const _1 = __importDefault(require("."));
const database = (0, firestore_1.getFirestore)(_1.default);
exports.table = {
    user: (0, firestore_1.collection)(database, "user"),
    admin: (0, firestore_1.collection)(database, "admin")
};
exports.default = database;
