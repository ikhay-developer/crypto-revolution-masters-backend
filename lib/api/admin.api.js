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
const express_1 = require("express");
const firestore_1 = require("firebase/firestore");
const database_1 = require("../services/database");
const adminApi = (0, express_1.Router)();
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
adminApi.get("/ads", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    const snapshot = yield (0, firestore_1.getDoc)((0, firestore_1.doc)(database_1.table.admin, "ads"));
    if (snapshot.exists()) {
        let data = Object(snapshot.data());
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
    const snapshot = yield (0, firestore_1.getDoc)((0, firestore_1.doc)(database_1.table.admin, "auth"));
    const { password, username } = req.body;
    if (snapshot.exists()) {
        let data = Object(snapshot.data());
        if (data["password"] == password && data["username"] == username) {
            res.json({ state: "success" });
        }
        else if (data["username"] != username && data["password"] != password) {
            res.json({ state: "failed", reason: "incorrect username and password" });
        }
        else if (data["password"] != password) {
            res.json({ state: "failed", reason: "incorrect password" });
        }
        else if (data["username"] != username) {
            res.json({ state: "failed", reason: "incorrect username" });
        }
    }
    else {
        res.json({ state: "failed", reason: "backend error" });
    }
}));
adminApi.put("/auth", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
