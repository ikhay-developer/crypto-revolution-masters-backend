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
const firestore_1 = require("firebase/firestore");
const nodemailer_1 = require("nodemailer");
const database_1 = require("../services/database");
const resetPasswordEmailHtml = (resetCode) => {
    return `<h2>CryptoRM password reset</h2>
    <p style="line-height: 30px;">Sorry for the lost your password. But don't be alarmed, just use this code to reset your password:</p>
    <h1>${resetCode}</h1>
    <P>Note that this code will expire after 1 hour</P>`;
};
const userApi = (0, express_1.Router)();
userApi.post("/:id/reset_code", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.params.id;
    let { resetCode } = req.body;
    let state = "failed";
    let snapshot = yield (0, firestore_1.getDoc)((0, firestore_1.doc)(database_1.table.user, id));
    let userData = snapshot.data();
    if (userData["recovery code"] == resetCode) {
        userData["recovery code"] = "00000";
        (0, firestore_1.setDoc)((0, firestore_1.doc)(database_1.table.user, id), userData)
            .then(_ => {
            res.json({ state: "success" });
        })
            .catch(_ => {
            res.json({ state, reason: "backend error" });
        });
    }
    else {
        res.json({ state, reason: "incorrect reset code" });
    }
}));
userApi.get("/:id/reset_code", (req, res) => {
    let id = req.params.id;
    let { email } = req.body;
    let password_reset_code = Math.floor((19999 + (Math.random() * (99999 - 19999)))).toString();
    let state = "failed";
    let mailTransporter = (0, nodemailer_1.createTransport)({
        host: process.env.SENDER_HOST,
        secure: false,
        tls: {
            ciphers: 'SSLv3'
        },
        auth: {
            user: process.env.SENDER_AUTH_USER,
            pass: process.env.SENDER_AUTH_PASSWORD
        }
    });
    mailTransporter.sendMail({
        from: "crypto-revolution-masters@outlook.com",
        to: email,
        subject: "Reset password on Crypto Revolution Masters app",
        html: resetPasswordEmailHtml(password_reset_code)
    }, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            console.log(err.message);
            res.json({ state, reason: "backend error" });
        }
        else {
            let snapshot = yield (0, firestore_1.getDoc)((0, firestore_1.doc)(database_1.table.user, id));
            let userData = snapshot.data();
            userData["recovery code"] = password_reset_code;
            (0, firestore_1.setDoc)((0, firestore_1.doc)(database_1.table.user, id), userData)
                .then(_ => {
                state = "success";
                res.json({ state });
                userData["recovery code"] = "00000";
                setTimeout(_ => (0, firestore_1.setDoc)((0, firestore_1.doc)(database_1.table.user, id), userData), 3600000);
            })
                .catch(_ => {
                res.json({ state, reason: "backend error" });
            });
        }
    }));
});
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
        let recovery_code = docSnap.data()["recovery code"];
        if (shouldEditUserDetail) {
            (0, firestore_1.setDoc)(docRef, { username, password, email, "recovery code": recovery_code })
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
        (0, firestore_1.setDoc)((0, firestore_1.doc)(database_1.table.user, id), { email, password, username, "recovery code": "00000" })
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