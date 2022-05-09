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
require("dotenv/config");
const express_1 = require("express");
const supabase_js_1 = require("@supabase/supabase-js");
const { SUPABASE_URL, SUPABASE_KEY } = process.env;
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
const authApi = (0, express_1.Router)();
authApi.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, email_or_username } = req.body;
    const { data } = yield supabase
        .from("users")
        .select("id, password, username, email")
        .or(`email.eq.${email_or_username},username.eq.${email_or_username}`)
        .eq("password", password)
        .limit(1)
        .single();
    if (data) {
        res.json({ data, state: "success" });
    }
    else {
        res.json({ state: "failed", reason: "invalided details" });
    }
}));
authApi.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, username, password } = req.body;
    const appId = req.body["app-id"] ? req.body["app-id"] : null;
    const emailChecker = yield supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .limit(1)
        .single();
    if (emailChecker.data) {
        res.json({ state: "failed", reason: "email already exist" });
    }
    else {
        const usernameChecker = yield supabase
            .from("users")
            .select("id")
            .eq("username", username)
            .limit(1)
            .single();
        if (usernameChecker.data) {
            res.json({ state: "failed", reason: "username already exist" });
        }
        else {
            const { error, user } = yield supabase.auth.api.createUser({
                user_metadata: {
                    password,
                    username,
                    "app-id": appId
                },
                email,
                password,
                email_confirm: true
            });
            if (error) {
                res.json({ state: "failed", reason: "backend error" });
            }
            else {
                res.json({ data: { id: user.id, email, password, username }, state: "success" });
            }
        }
    }
}));
exports.default = authApi;
