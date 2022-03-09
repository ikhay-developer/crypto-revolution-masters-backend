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
const resetPasswordEmailHtml = (resetCode) => {
    return `<h2>CryptoRM password reset</h2>
    <p style="line-height: 30px;">Sorry for the lost your password. But don't be alarmed, just use this code to reset your password:</p>
    <h1>${resetCode}</h1>
    <P>Note that this code will expire after 1 hour</P>`;
};
const userApi = (0, express_1.Router)();
userApi.get("/:id/coins", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    let url = `${req.protocol}://${req.headers.host}`;
    try {
        let snapshot = yield (0, firestore_1.getDoc)((0, firestore_1.doc)(database_1.table.user, id));
        if (snapshot.exists()) {
            let favouriteCoins = snapshot.data()["favourite coins"];
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
        else {
            res.json({ state: "failed", reason: "user doesn't exist" });
        }
    }
    catch (error) {
        res.json({ state: "failed", reason: "backend error" });
    }
}));
userApi.post("/:id/portfolio/sell", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    let { name, amount, time } = req.body;
    let snapshot = yield (0, firestore_1.getDoc)((0, firestore_1.doc)(database_1.table.user, id));
    if (snapshot.exists()) {
        name = name.toLowerCase();
        let userData = snapshot.data();
        userData["transaction"] = [
            {
                name: name,
                amount,
                time,
                action: "sell",
                "current price": req.body["current price"]
            },
            ...userData["transaction"]
        ];
        if (name in userData["assets"]) {
            userData["assets"][name] = (userData["assets"][name] - amount) > 0 ? userData["assets"][name] - amount : 0;
        }
        (0, firestore_1.setDoc)((0, firestore_1.doc)(database_1.table.user, id), userData)
            .then(_ => {
            res.json({ state: "success" });
        })
            .catch(_ => {
            res.json({ state: "failed", reason: "backend error" });
        });
    }
    else {
        res.json({ state: "failed", reason: "user doesn't exist" });
    }
}));
userApi.post("/:id/portfolio/buy", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    let { name, amount, time } = req.body;
    let snapshot = yield (0, firestore_1.getDoc)((0, firestore_1.doc)(database_1.table.user, id));
    if (snapshot.exists()) {
        name = name.toLowerCase();
        let userData = snapshot.data();
        userData["transaction"] = [
            {
                name,
                amount,
                time,
                action: "buy",
                "current price": req.body["current price"]
            },
            ...userData["transaction"]
        ];
        if (name in userData["assets"]) {
            userData["assets"][name] = userData["assets"][name] + amount;
        }
        else {
            userData["assets"][name] = amount;
        }
        (0, firestore_1.setDoc)((0, firestore_1.doc)(database_1.table.user, id), userData)
            .then(_ => {
            res.json({ state: "success" });
        })
            .catch(_ => {
            res.json({ state: "failed", reason: "backend error" });
        });
    }
    else {
        res.json({ state: "failed", reason: "user doesn't exist" });
    }
}));
userApi.get("/:id/portfolio/search", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    let url = `${req.protocol}://${req.headers.host}`;
    try {
        let snapshot = yield (0, firestore_1.getDoc)((0, firestore_1.doc)(database_1.table.user, id));
        if (snapshot.exists()) {
            let assets = snapshot.data()["assets"];
            let coins = yield axios_1.default.get(`${url}/${process.env.API_SECRET_KEY}/coins`);
            if (coins.data.state == "success") {
                let data = coins.data.data;
                data = data
                    .map(value => (Object.assign(Object.assign({}, value), { amount: assets[value.name.toLowerCase()] != undefined ? assets[value.name.toLowerCase()] : 0 })));
                res.json({ state: "success", data });
            }
        }
        else {
            res.json({ state: "failed", reason: "user doesn't exist" });
        }
    }
    catch (error) {
        res.json({ state: "failed", reason: "backend error" });
    }
}));
userApi.get("/:id/portfolio", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    let url = `${req.protocol}://${req.headers.host}`;
    try {
        let snapshot = yield (0, firestore_1.getDoc)((0, firestore_1.doc)(database_1.table.user, id));
        if (snapshot.exists()) {
            let assetsData = snapshot.data()["assets"];
            let assetsCoins = Object.keys(assetsData);
            let coins = yield axios_1.default.get(`${url}/${process.env.API_SECRET_KEY}/coins`);
            if (coins.data.state == "success") {
                let assets = coins.data.data;
                let balance = 0;
                assets = assets
                    .filter(({ name }) => assetsCoins.includes(name.toLowerCase()))
                    .map(value => {
                    balance += assetsData[value.name.toLowerCase()] * value.current_price;
                    return Object.assign(Object.assign({}, value), { amount: assetsData[value.name.toLowerCase()], amount_in_current_price: assetsData[value.name.toLowerCase()] * value.current_price });
                })
                    .filter(value => value.amount > 0.0000000000000000);
                res.json({ state: "success", data: { assets, balance } });
            }
            else {
                throw new Error();
            }
        }
        else {
            res.json({ state: "failed", reason: "user doesn't exist" });
        }
    }
    catch (error) {
        res.json({ state: "failed", reason: "backend error" });
    }
}));
userApi.get("/:id/favourite-coins", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    let url = `${req.protocol}://${req.headers.host}`;
    try {
        let snapshot = yield (0, firestore_1.getDoc)((0, firestore_1.doc)(database_1.table.user, id));
        if (snapshot.exists()) {
            let favouriteCoins = snapshot.data()["favourite coins"];
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
        else {
            res.json({ state: "failed", reason: "user doesn't exist" });
        }
    }
    catch (error) {
        res.json({ state: "failed", reason: "backend error" });
    }
}));
userApi.delete("/:id/favourite-coins", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    let favouriteCoins = req.body;
    favouriteCoins = favouriteCoins.map(value => value.toLowerCase());
    let docRef = (0, firestore_1.doc)(database_1.table.user, id);
    let snapshot = yield (0, firestore_1.getDoc)(docRef);
    if (snapshot.exists()) {
        let userData = snapshot.data();
        userData["favourite coins"] = userData["favourite coins"]
            .filter(coin => !favouriteCoins.includes(coin.toLowerCase()));
        (0, firestore_1.setDoc)(docRef, userData)
            .then(_ => {
            res.json({ state: "success" });
        })
            .catch(_ => {
            res.json({ state: "failed", reason: "backend error" });
        });
    }
    else {
        res.json({ state: "failed", reason: "user doesn't exist" });
    }
}));
userApi.post("/:id/favourite-coins", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    let favouriteCoins = req.body;
    favouriteCoins = favouriteCoins.map(value => value.toLowerCase());
    let docRef = (0, firestore_1.doc)(database_1.table.user, id);
    let snapshot = yield (0, firestore_1.getDoc)(docRef);
    if (snapshot.exists()) {
        let userData = snapshot.data();
        favouriteCoins = [...favouriteCoins, ...userData["favourite coins"]];
        favouriteCoins = favouriteCoins.map(value => value.toLowerCase());
        userData["favourite coins"] = favouriteCoins.filter((coin, index) => favouriteCoins.indexOf(coin) == index);
        (0, firestore_1.setDoc)(docRef, userData)
            .then(_ => {
            res.json({ state: "success" });
        })
            .catch(_ => {
            res.json({ state: "failed", reason: "backend error" });
        });
    }
    else {
        res.json({ state: "failed", reason: "user doesn't exist" });
    }
}));
userApi.put("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let id = req.params.id;
    const docRef = (0, firestore_1.doc)(database_1.table.user, id);
    const docSnap = yield (0, firestore_1.getDoc)(docRef);
    let state = "failed";
    let reason = "username and email already in use";
    let shouldEditUserName = false;
    let shouldEditEmail = false;
    if (docSnap.exists()) {
        let { username, password, email } = req.body;
        if (username != undefined) {
            let q = (0, firestore_1.query)(database_1.table.user, (0, firestore_1.where)("username", "==", username));
            const snapshot = yield (0, firestore_1.getDocs)(q);
            if (snapshot.empty) {
                shouldEditUserName = true;
            }
            else {
                if (((_a = snapshot.docs.at(0)) === null || _a === void 0 ? void 0 : _a.id) == id) {
                    shouldEditUserName = true;
                }
                else {
                    shouldEditUserName = false;
                    reason = "username already in use";
                }
            }
        }
        else if (username == undefined) {
            username = docSnap.data().username;
            shouldEditUserName = true;
        }
        if (email != undefined) {
            let q = (0, firestore_1.query)(database_1.table.user, (0, firestore_1.where)("email", "==", email));
            const snapshot = yield (0, firestore_1.getDocs)(q);
            if (snapshot.empty) {
                shouldEditEmail = true;
            }
            else {
                if (((_b = snapshot.docs.at(0)) === null || _b === void 0 ? void 0 : _b.id) == id) {
                    shouldEditEmail = true;
                }
                else {
                    shouldEditEmail = false;
                    reason = "email already in use";
                }
            }
        }
        else if (email == undefined) {
            email = docSnap.data().email;
            shouldEditEmail = true;
        }
        if (!shouldEditUserName && !shouldEditEmail)
            reason = "username and email already in use";
        let shouldEditUserDetail = shouldEditEmail && shouldEditUserName;
        password = password == undefined ? docSnap.data().password : password;
        let favourite_coins = docSnap.data()["favourite coins"];
        let transaction = docSnap.data()["transaction"];
        let assets = docSnap.data()["assets"];
        if (shouldEditUserDetail) {
            (0, firestore_1.setDoc)(docRef, { username, password, email, transaction, assets, "favourite coins": favourite_coins })
                .then(() => {
                state = "success";
                res.json({ data: { id, email, password, username }, state });
            })
                .catch(() => {
                state = "failed";
                res.json({ state, reason: "backend error" });
            });
        }
        else {
            state = "failed";
            res.json({ state, reason });
        }
    }
    else {
        res.json({ state, reason: "user doesn't not exist" });
    }
}));
userApi.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    const docRef = (0, firestore_1.doc)(database_1.table.user, id);
    let state = "failed";
    (0, firestore_1.deleteDoc)(docRef)
        .then(() => {
        state = "success";
        res.json({ state });
    })
        .catch(() => {
        res.json({ state, reason: "backend error" });
    });
}));
userApi.get("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    let snapshot = yield (0, firestore_1.getDoc)((0, firestore_1.doc)(database_1.table.user, id));
    if (snapshot.exists()) {
        let { username, email, password } = snapshot.data();
        res.json({ state: "success", data: { username, email, password } });
    }
    else {
        res.json({ state: "failed", reason: "user doesn't exist" });
    }
}));
userApi.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, email_or_username } = req.body;
    let state = "failed";
    const queryEmail = (0, firestore_1.query)(database_1.table.user, (0, firestore_1.where)("email", "==", email_or_username), (0, firestore_1.where)("password", "==", password));
    const queryUsername = (0, firestore_1.query)(database_1.table.user, (0, firestore_1.where)("username", "==", email_or_username), (0, firestore_1.where)("password", "==", password));
    const snapshotQueryEmail = yield (0, firestore_1.getDocs)(queryEmail);
    const snapshotQueryUsername = yield (0, firestore_1.getDocs)(queryUsername);
    if (!snapshotQueryUsername.empty) {
        let doc = snapshotQueryUsername.docs.at(0);
        state = "success";
        let data = {
            id: doc.id,
            email: doc.data().email,
            password: doc.data().password,
            username: doc.data().username
        };
        res.json({ data, state });
    }
    else if (!snapshotQueryEmail.empty) {
        let doc = snapshotQueryEmail.docs.at(0);
        8;
        state = "success";
        let data = {
            id: doc.id,
            email: doc.data().email,
            password: doc.data().password,
            username: doc.data().username
        };
        res.json({ data, state });
    }
    else {
        res.json({ state, reason: "invalided details" });
    }
}));
userApi.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, username, password } = req.body;
    let state = "failed";
    const queryEmail = (0, firestore_1.query)(database_1.table.user, (0, firestore_1.where)("email", "==", email));
    const queryUsername = (0, firestore_1.query)(database_1.table.user, (0, firestore_1.where)("username", "==", username));
    const snapshotQueryEmail = yield (0, firestore_1.getDocs)(queryEmail);
    const snapshotQueryUsername = yield (0, firestore_1.getDocs)(queryUsername);
    if (snapshotQueryEmail.empty && snapshotQueryUsername.empty) {
        let size = (yield (0, firestore_1.getDocs)(database_1.table.user)).size;
        let id = (size + 1).toString();
        (0, firestore_1.setDoc)((0, firestore_1.doc)(database_1.table.user, id), { email, password, username, transaction: [], assets: {}, "favourite coins": [] })
            .then(() => {
            state = "success";
            res.json({ data: { id, email, password, username }, state });
        }).catch(() => {
            state = "failed";
            res.json({ state, reason: "backend error" });
        });
    }
    else if (!snapshotQueryEmail.empty) {
        res.json({ state, reason: "email already exist" });
    }
    else if (!snapshotQueryUsername.empty) {
        res.json({ state, reason: "username already exist" });
    }
    else {
        res.json({ state, reason: "unknown error" });
    }
}));
exports.default = userApi;
