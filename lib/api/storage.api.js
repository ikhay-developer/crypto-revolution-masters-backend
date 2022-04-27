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
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const express_1 = require("express");
const storageApi = (0, express_1.Router)();
const { SUPABASE_URL, SUPABASE_KEY } = process.env;
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
storageApi.delete("/:directory/:file", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let directory = req.params.directory;
    let file = req.params.file;
    const { error } = yield supabase
        .storage
        .from(directory)
        .remove([file]);
    if (!error)
        res.json({ state: "success" });
    else
        res.json({ state: "failed", reason: "backend error" });
}));
exports.default = storageApi;
