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
const axios_1 = __importDefault(require("axios"));
require("dotenv/config");
const express_1 = require("express");
const polyfill_1 = require("@js-temporal/polyfill");
const supabase_js_1 = require("@supabase/supabase-js");
Date.prototype.toTemporalInstant = polyfill_1.toTemporalInstant;
const { SUPABASE_URL, SUPABASE_KEY } = process.env;
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
const adminApi = (0, express_1.Router)();
adminApi.get("/favourite-coin-data", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let url = `${req.protocol}://${req.headers.host}`;
    const { data } = yield supabase
        .from("admin-data")
        .select("favourite-coin")
        .match({ id: 0 })
        .limit(1)
        .single();
    if (data) {
        let favouriteCoins = data["favourite-coin"];
        try {
            let coins = yield axios_1.default.get(`${url}/${process.env.API_SECRET_KEY}/coins`);
            let favouriteCoinList = yield axios_1.default.get(`${url}/${process.env.API_SECRET_KEY}/admin/favourite-coin`);
            if (coins.data.state == "success" && favouriteCoinList.data.state == "success") {
                let data = coins.data.data;
                data = data.filter(value => favouriteCoins.includes(value.name.toLowerCase()));
                res.json({
                    state: "success", data: {
                        "favourite coins": favouriteCoins.map(value => value.toLowerCase()),
                        "favourite coin list": favouriteCoinList.data.data,
                        "coin list": coins.data.data.map((value) => (Object.assign(Object.assign({}, value), { is_add_to_favourite: favouriteCoins.includes(value.name.toLowerCase()) }))),
                    }
                });
            }
            else {
                throw new Error();
            }
        }
        catch (error) {
            res.json({ state: "failed", reason: "backend error" });
        }
    }
    else {
        res.json({ state: "failed", reason: "backend error" });
    }
}));
adminApi.post("/favourite-coin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = req.body;
    data = data.map(value => value.toLowerCase());
    const { error } = yield supabase
        .from("admin-data")
        .update({ "favourite-coin": data })
        .match({ id: 0 });
    if (!error)
        res.json({ state: "success", data });
    else
        res.json({ state: "failed", reason: "backend error" });
}));
adminApi.get("/favourite-coin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let url = `${req.protocol}://${req.headers.host}`;
    const { data } = yield supabase
        .from("admin-data")
        .select("favourite-coin")
        .match({ id: 0 })
        .limit(1)
        .single();
    if (data) {
        let favouriteCoins = data["favourite-coin"];
        try {
            let coins = yield axios_1.default.get(`${url}/${process.env.API_SECRET_KEY}/coins`);
            if (coins.data.state == "success") {
                let data = coins.data.data;
                data = data.filter(value => favouriteCoins.includes(value.name.toLowerCase()));
                res.json({ state: "success", data });
            }
            else {
                throw new Error();
            }
        }
        catch (error) {
            res.json({ state: "failed", reason: "backend error" });
        }
    }
    else {
        res.json({ state: "failed", reason: "backend error" });
    }
}));
adminApi.get("/message", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { data } = yield supabase
        .from("admin-msg")
        .select("link,message,date,image");
    if (data) {
        data = data
            .map((value) => {
            if (value.date.search(/\[/) < 0) {
                value.date = new Date(value.date).toTemporalInstant();
            }
            else {
                value.date = polyfill_1.Temporal.Instant.from(value.date);
            }
            return Object.assign({}, value);
        })
            .sort((a, b) => polyfill_1.Temporal.Instant.compare(a.date, b.date))
            .map((value) => {
            value.date = new Date(value.date.epochMilliseconds).toISOString();
            return Object.assign({}, value);
        })
            .reverse();
        res.json({ state: "success", data });
    }
    else {
        res.json({ state: "failed", reason: "backend error" });
    }
}));
adminApi.post("/message", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    const { error } = yield supabase
        .from("admin-msg")
        .insert(Object.assign({}, body));
    if (!error)
        res.json({ state: "success", data: Object.assign({}, body) });
    else
        res.json({ state: "failed", reason: "backend error" });
}));
adminApi.post("/ads/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let index = req.params.id;
    const body = req.body;
    const { error } = yield supabase
        .from("admin-ads")
        .insert(Object.assign({ index }, body));
    if (!error)
        res.json({ state: "success", data: Object.assign({ index }, body) });
    else
        res.json({ state: "failed", reason: "backend error" });
}));
adminApi.delete("/ads/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let index = req.params.id;
    const { data } = yield supabase
        .from("admin-ads")
        .select("image")
        .match({ index })
        .limit(1)
        .single();
    let [file, directory] = data.image.split("/").reverse();
    axios_1.default.delete(`${req.protocol}://${req.headers.host}/${process.env.API_SECRET_KEY}/storage/${directory}/${file}`)
        .then((e) => __awaiter(void 0, void 0, void 0, function* () {
        if (e.data.state == "success") {
            const { error } = yield supabase
                .from("admin-ads")
                .delete()
                .match({ index });
            if (!error && data) {
                res.json({ state: "success" });
            }
            else {
                res.json({ state: "failed", reason: "backend error" });
            }
        }
        else {
            res.json({ state: "failed", reason: "backend error" });
        }
    }))
        .catch(e => {
        res.json({ state: "failed", reason: "backend error" });
    });
}));
adminApi.get("/ads", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = yield supabase
        .from("admin-ads")
        .select("*");
    if (data)
        res.json({ state: "success", data });
    else
        res.json({ state: "failed", reason: "backend error" });
}));
adminApi.get("/auth", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = yield supabase
        .from("admin-data")
        .select("username,password")
        .match({ id: 0 })
        .limit(1)
        .single();
    if (data)
        res.json({ state: "success", data });
    else
        res.json({ state: "failed", reason: "backend error" });
}));
adminApi.post("/auth", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { username, password } = req.body;
    const { error } = yield supabase
        .from("admin-data")
        .update({
        username,
        password
    })
        .match({ id: 0 });
    if (!error)
        res.json({ state: "success", data: { username, password } });
    else
        res.json({ state: "failed", reason: "backend error" });
}));
adminApi.get("/users", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { data } = yield supabase
        .from("users")
        .select("id,username,email");
    res.json(data);
}));
exports.default = adminApi;
