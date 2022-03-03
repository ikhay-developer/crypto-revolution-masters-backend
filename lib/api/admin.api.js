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
const firestore_1 = require("firebase/firestore");
const database_1 = require("../services/database");
const adminApi = (0, express_1.Router)();
adminApi.get("/favourite-coin-data", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let url = `${req.protocol}://${req.headers.host}`;
    try {
        let snapshot = yield (0, firestore_1.getDoc)((0, firestore_1.doc)(database_1.table.admin, "favourite-coin"));
        let favouriteCoins = snapshot.data()["coins"];
        let coins = yield axios_1.default.get(`${url}/${process.env.API_SECRET_KEY}/coins`);
        let favouriteCoinList = yield axios_1.default.get(`${url}/${process.env.API_SECRET_KEY}/admin/favourite-coin`);
        if (coins.data.state == "success" && favouriteCoinList.data.state == "success") {
            let data = coins.data.data;
            data = data.filter(value => favouriteCoins.includes(value.name.toLowerCase()));
            res.json({
                state: "success", data: {
                    "favourite coins": favouriteCoins.map(value => value.toLowerCase()),
                    "favourite coin list": favouriteCoinList.data.data.map((value) => (Object.assign(Object.assign({}, value), { is_add_to_favourite: favouriteCoins.includes(value.name.toLowerCase()) }))),
                    "coin list": coins.data.data
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
}));
adminApi.post("/favourite-coin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    (0, firestore_1.setDoc)((0, firestore_1.doc)(database_1.table.admin, "favourite-coin"), { coins: data.map(value => value.toLowerCase()) })
        .then(_ => res.json({ state: "success", data }))
        .catch(_ => res.json({ state: "failed", reason: "backend error" }));
}));
adminApi.get("/favourite-coin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let url = `${req.protocol}://${req.headers.host}`;
    try {
        let snapshot = yield (0, firestore_1.getDoc)((0, firestore_1.doc)(database_1.table.admin, "favourite-coin"));
        let favouriteCoins = snapshot.data()["coins"];
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
}));
adminApi.get("/message", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield (0, firestore_1.getDoc)((0, firestore_1.doc)(database_1.table.admin, "message"));
    if (snapshot.exists()) {
        let data = Object(snapshot.data());
        let dataArray = Array.from(Object.values(data));
        dataArray.reverse();
        res.json({ state: "success", data: dataArray });
    }
    else {
        res.json({ state: "failed", reason: "backend error" });
    }
}));
adminApi.post("/message", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield (0, firestore_1.getDoc)((0, firestore_1.doc)(database_1.table.admin, "message"));
    const body = req.body;
    if (snapshot.exists()) {
        let data = Object(snapshot.data());
        let dataArray = Array.from(Object.values(data));
        body["date"] = new Date().toISOString();
        data[dataArray.length + 1] = body;
        (0, firestore_1.setDoc)((0, firestore_1.doc)(database_1.table.admin, "message"), data)
            .then(_ => res.json({ state: "success", data: Object.assign({}, body) }))
            .catch(_ => res.json({ state: "failed", reason: "backend error" }));
    }
    else {
        res.json({ state: "failed", reason: "backend error" });
    }
}));
adminApi.post("/ads/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield (0, firestore_1.getDoc)((0, firestore_1.doc)(database_1.table.admin, "ads"));
    const body = req.body;
    if (snapshot.exists()) {
        let data = Object(snapshot.data());
        data[req.params.id] = Object.assign({}, body);
        (0, firestore_1.setDoc)((0, firestore_1.doc)(database_1.table.admin, "ads"), data)
            .then(_ => res.json({ state: "success", data: Object.assign({}, body) }))
            .catch(_ => res.json({ state: "failed", reason: "backend error" }));
    }
    else {
        res.json({ state: "failed", reason: "backend error" });
    }
}));
adminApi.delete("/ads/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield (0, firestore_1.getDoc)((0, firestore_1.doc)(database_1.table.admin, "ads"));
    if (snapshot.exists()) {
        let data = Object(snapshot.data());
        if (req.params.id in data) {
            let adData = data[req.params.id];
            let adImageUrl = adData["image"];
            axios_1.default.delete(adImageUrl)
                .then(e => {
                if (e.data.state == "success") {
                    delete data[req.params.id];
                    (0, firestore_1.setDoc)((0, firestore_1.doc)(database_1.table.admin, "ads"), data)
                        .then(_ => res.json({ state: "success" }))
                        .catch(_ => res.json({ state: "failed", reason: "backend error" }));
                }
                else {
                    res.json({ state: "failed", reason: "backend error" });
                }
            })
                .catch(e => {
                res.json({ state: "failed", reason: "backend error" });
            });
        }
        else {
            res.json({ state: "success" });
        }
    }
}));
adminApi.get("/ads", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield (0, firestore_1.getDoc)((0, firestore_1.doc)(database_1.table.admin, "ads"));
    if (snapshot.exists()) {
        let dataObj = Object(snapshot.data());
        let data = [];
        Object.keys(dataObj).forEach(i => {
            data.push(Object.assign({ index: i }, dataObj[i]));
        });
        data.reverse();
        res.json({ state: "success", data });
    }
    else {
        res.json({ state: "failed", reason: "backend error" });
    }
}));
adminApi.get("/auth", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield (0, firestore_1.getDoc)((0, firestore_1.doc)(database_1.table.admin, "auth"));
    if (snapshot.exists()) {
        let data = Object(snapshot.data());
        res.json({ state: "success", data });
    }
    else {
        res.json({ state: "failed", reason: "backend error" });
    }
}));
adminApi.post("/auth", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { username, password } = req.body;
    (0, firestore_1.setDoc)((0, firestore_1.doc)(database_1.table.admin, "auth"), { username, password })
        .then(_ => res.json({ state: "success", data: { username, password } }))
        .catch(_ => res.json({ state: "failed", reason: "backend error" }));
}));
adminApi.get("/users", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    let snapshot = yield (0, firestore_1.getDocs)((0, firestore_1.query)(database_1.table.user));
    let parseDoc = snapshot.docs.map(value => ({ id: value.id, username: value.data()["username"], email: value.data()["email"] }));
    res.json(parseDoc);
}));
exports.default = adminApi;
