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
require("dotenv/config");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const supabase_js_1 = require("@supabase/supabase-js");
const { SUPABASE_URL, SUPABASE_KEY } = process.env;
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
const uploadApi = (0, express_1.Router)();
const uploadMiddleware = (0, multer_1.default)();
uploadApi.post("/:where/", uploadMiddleware.any(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let files = req.files;
    let timeStamp = new Date().toISOString();
    let fileName = `${files.at(0)["originalname"]}_${timeStamp}`;
    let buffer = files.at(0)["buffer"];
    if (files != null) {
        if (req.params.where == "message-images") {
            const { error } = yield supabase
                .storage
                .from("message-images")
                .upload(fileName, buffer, {
                cacheControl: '3600',
                upsert: false
            });
            if (!error) {
                const { data } = supabase
                    .storage
                    .from("message-images")
                    .getPublicUrl(fileName);
                if (data)
                    res.json({ state: "success", data: { imageUrl: data.publicURL } });
                else
                    res.json({ state: "failed", reason: "backend error" });
            }
            else {
                res.json({ state: "failed", reason: "backend error" });
            }
        }
        else if (req.params.where == "ads-images") {
            const { error } = yield supabase
                .storage
                .from("ads-images")
                .upload(fileName, buffer, {
                cacheControl: '3600',
                upsert: false
            });
            if (!error) {
                const { data } = supabase
                    .storage
                    .from("ads-images")
                    .getPublicUrl(fileName);
                if (data)
                    res.json({ state: "success", data: { imageUrl: data.publicURL } });
                else
                    res.json({ state: "failed", reason: "backend error" });
            }
            else {
                res.json({ state: "failed", reason: "backend error" });
            }
        }
    }
    else {
        res.json({ state: "failed", reason: "backend error" });
    }
}));
exports.default = uploadApi;
