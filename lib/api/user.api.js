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
const supabase_js_1 = require("@supabase/supabase-js");
const { SUPABASE_URL, SUPABASE_KEY } = process.env;
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_KEY);
const userApi = (0, express_1.Router)();
userApi.get("/:id/coins", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    let url = `${req.protocol}://${req.headers.host}`;
    const userData = yield supabase
        .from("users")
        .select("favourite-coins")
        .or(`${/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single();
    if (userData.data) {
        let favouriteCoins = userData.data["favourite-coins"];
        try {
            let coins = yield axios_1.default.get(`${url}/${process.env.API_SECRET_KEY}/coins`);
            if (coins.data.state == "success") {
                let data = coins.data.data;
                data = data.map(value => {
                    if (favouriteCoins.includes(value.name.toLowerCase())) {
                        return (Object.assign(Object.assign({}, value), { "add_to_watch_list": true }));
                    }
                    else {
                        return (Object.assign(Object.assign({}, value), { "add_to_watch_list": false }));
                    }
                });
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
        res.json({ state: "failed", reason: "user doesn't exist" });
    }
}));
userApi.post("/:id/portfolio/sell", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    let { name, amount, time } = req.body;
    name = name.toLowerCase();
    const userData = yield supabase
        .from("users")
        .select("id, assets")
        .or(`${/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single();
    if (userData.data) {
        let userId = userData.data.id;
        if (name in userData.data.assets) {
            userData.data.assets[name] = (userData.data.assets[name] - amount) > 0 ? userData.data.assets[name] - amount : 0;
            const { error } = yield supabase
                .from("users")
                .update({ assets: userData.data.assets })
                .match({ id: userId });
            if (!error) {
                const _transaction = yield supabase
                    .from("transactions")
                    .insert({
                    "user id": userId,
                    name,
                    amount,
                    time,
                    "current price": req.body["current price"],
                    "action": "sell"
                });
                if (_transaction.error) {
                    res.json({ state: "failed", reason: "backend error" });
                }
                else {
                    res.json({ state: "success" });
                }
            }
            else {
                res.json({ state: "failed", reason: "backend error" });
            }
        }
        else {
            res.send();
        }
    }
    else {
        res.json({ state: "failed", reason: "user doesn't exist" });
    }
}));
userApi.post("/:id/portfolio/buy", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    let { name, amount, time } = req.body;
    name = name.toLowerCase();
    const userData = yield supabase
        .from("users")
        .select("id, assets")
        .or(`${/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single();
    if (userData.data) {
        let userId = userData.data.id;
        if (name in userData.data.assets) {
            userData.data.assets[name] = userData.data.assets[name] + amount;
            const { error } = yield supabase
                .from("users")
                .update({ assets: userData.data.assets })
                .match({ id: userId });
            if (!error) {
                const _transaction = yield supabase
                    .from("transactions")
                    .insert({
                    "user id": userId,
                    name,
                    amount,
                    time,
                    "current price": req.body["current price"],
                    "action": "buy"
                });
                if (_transaction.error) {
                    res.json({ state: "failed", reason: "backend error" });
                }
                else {
                    res.json({ state: "success" });
                }
            }
            else {
                res.json({ state: "failed", reason: "backend error" });
            }
        }
        else {
            userData.data.assets[name] = amount;
            const { error } = yield supabase
                .from("users")
                .update({ assets: userData.data.assets })
                .match({ id: userId });
            if (!error) {
                const _transaction = yield supabase
                    .from("transactions")
                    .insert({
                    "user id": userId,
                    name,
                    amount,
                    time,
                    "current price": req.body["current price"],
                    "action": "buy"
                });
                if (_transaction.error) {
                    res.json({ state: "failed", reason: "backend error" });
                }
                else {
                    res.json({ state: "success" });
                }
            }
            else {
                res.json({ state: "failed", reason: "backend error" });
            }
        }
    }
    else {
        res.json({ state: "failed", reason: "user doesn't exist" });
    }
}));
userApi.get("/:id/portfolio/search", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    let url = `${req.protocol}://${req.headers.host}`;
    const userData = yield supabase
        .from("users")
        .select("assets")
        .or(`${/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single();
    if (userData.data) {
        try {
            let assets = userData.data.assets;
            let coins = yield axios_1.default.get(`${url}/${process.env.API_SECRET_KEY}/coins`);
            if (coins.data.state == "success") {
                let data = coins.data.data;
                data = data.map(value => (Object.assign(Object.assign({}, value), { amount: assets[value.name.toLowerCase()] != undefined ? assets[value.name.toLowerCase()] : 0 })));
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
        res.json({ state: "failed", reason: "user doesn't exist" });
    }
}));
userApi.get("/:id/portfolio", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    let url = `${req.protocol}://${req.headers.host}`;
    const userData = yield supabase
        .from("users")
        .select("assets")
        .or(`${/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single();
    if (userData.data) {
        if (Object.keys(userData.data.assets).length > 0) {
            try {
                let assetsData = userData.data.assets;
                let assetsCoins = Object.keys(assetsData);
                let coins = yield axios_1.default.get(`${url}/${process.env.API_SECRET_KEY}/coins`);
                if (coins.data.state == "success") {
                    let assets = coins.data.data;
                    let balance = 0;
                    assets = assets
                        .filter(({ name }) => assetsCoins.includes(name.toLowerCase()))
                        .filter(value => Math.round(assetsData[value.name.toLowerCase()]) > 0)
                        .map(value => {
                        balance += assetsData[value.name.toLowerCase()] * value.current_price;
                        return Object.assign(Object.assign({}, value), { amount: assetsData[value.name.toLowerCase()], amount_in_current_price: assetsData[value.name.toLowerCase()] * value.current_price });
                    });
                    res.json({ state: "success", data: { assets, balance } });
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
            res.json({ state: "success", data: { assets: [], balance: 0.0 } });
        }
    }
    else {
        res.json({ state: "failed", reason: "user doesn't exist" });
    }
}));
userApi.get("/:id/favourite-coins", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    let url = `${req.protocol}://${req.headers.host}`;
    const userData = yield supabase
        .from("users")
        .select("id, favourite-coins")
        .or(`${/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single();
    if (userData.data) {
        let favouriteCoins = userData.data["favourite-coins"];
        try {
            let coins = yield axios_1.default.get(`${url}/${process.env.API_SECRET_KEY}/coins`);
            if (coins.data.state == "success") {
                let data = coins.data.data;
                data = data.filter(({ name }) => favouriteCoins.includes(name.toLowerCase()));
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
        res.json({ state: "failed", reason: "user doesn't exist" });
    }
}));
userApi.delete("/:id/favourite-coins", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    let unFavouriteCoins = req.body;
    unFavouriteCoins = unFavouriteCoins
        .map(value => value.toLowerCase())
        .filter(value => value != String());
    const userData = yield supabase
        .from("users")
        .select("id, favourite-coins")
        .or(`${/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single();
    if (userData.data) {
        let userId = userData.data.id;
        let favouriteCoins = userData.data["favourite-coins"];
        favouriteCoins = favouriteCoins
            .filter(coin => !unFavouriteCoins.includes(coin.toLowerCase()));
        const { error } = yield supabase
            .from("users")
            .update({ "favourite-coins": favouriteCoins })
            .match({ id: userId });
        if (!error) {
            res.json({ state: "success" });
        }
        else {
            res.json({ state: "failed", reason: "backend error" });
        }
    }
    else {
        res.json({ state: "failed", reason: "user doesn't exist" });
    }
}));
userApi.post("/:id/favourite-coins", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    let favouriteCoins = req.body;
    favouriteCoins = favouriteCoins
        .map(value => value.toLowerCase())
        .filter(value => value != String());
    const userData = yield supabase
        .from("users")
        .select("id, favourite-coins")
        .or(`${/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single();
    if (userData.data) {
        let userId = userData.data.id;
        favouriteCoins = [...favouriteCoins, ...userData.data["favourite-coins"]];
        favouriteCoins = favouriteCoins.filter((coin, index) => favouriteCoins.indexOf(coin) == index);
        const { error } = yield supabase
            .from("users")
            .update({ "favourite-coins": favouriteCoins })
            .match({ id: userId });
        if (!error) {
            res.json({ state: "success" });
        }
        else {
            res.json({ state: "failed", reason: "backend error" });
        }
    }
    else {
        res.json({ state: "failed", reason: "user doesn't exist" });
    }
}));
userApi.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    const { data } = yield supabase
        .from("users")
        .select("id, password, username, email")
        .or(`${/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single();
    if (data) {
        let userId = data.id;
        let { username, password, email } = req.body;
        let newUserData = {};
        newUserData["user_metadata"] = {};
        if (email) {
            let emailChecker = yield supabase
                .from("users")
                .select("id")
                .neq("id", userId)
                .eq("email", email)
                .limit(1)
                .single();
            if (!emailChecker.data) {
                newUserData["email"] = email;
            }
            else {
                res.json({ state: "failed", reason: "email already in use" });
                return;
            }
        }
        if (username) {
            let usernameChecker = yield supabase
                .from("users")
                .select("id")
                .neq("id", userId)
                .eq("username", username)
                .limit(1)
                .single();
            if (!usernameChecker.data) {
                newUserData["user_metadata"]["username"] = username;
            }
            else {
                res.json({ state: "failed", reason: "username already in use" });
                return;
            }
        }
        if (password) {
            newUserData["user_metadata"]["password"] = password;
        }
        const { error } = yield supabase.auth.api.updateUserById(userId, newUserData);
        if (!error) {
            res.json({ data: { id, email, password, username }, state: "success" });
        }
        else {
            res.json({ state: "failed", reason: "backend error" });
        }
    }
    else {
        res.json({ state: "failed", reason: "user doesn't not exist" });
    }
}));
userApi.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    const { data } = yield supabase
        .from("users")
        .select("id, password, username, email")
        .or(`${/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single();
    if (data) {
        const userId = data.id;
        const { error } = yield supabase
            .from("users")
            .delete()
            .match({ id: userId });
        if (!error) {
            const { error: authError } = yield supabase.auth.api.deleteUser(userId);
            if (!authError) {
                res.json({ state: "success" });
            }
            else {
                res.json({ state: "failed", reason: "backend error" });
            }
        }
        else {
            res.json({ state: "failed", reason: "backend error" });
        }
    }
    else {
        res.json({ state: "success" });
    }
}));
userApi.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    const { data } = yield supabase
        .from("users")
        .select("id, password, username, email")
        .or(`${/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(id) ? `id.eq.${id},` : ""}app-id.eq.${id}`)
        .limit(1)
        .single();
    if (data) {
        res.json({ state: "success", data });
    }
    else {
        res.json({ state: "failed", reason: "user doesn't exist" });
    }
}));
userApi.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
userApi.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.default = userApi;
