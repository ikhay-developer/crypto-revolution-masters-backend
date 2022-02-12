"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = require("express");
const authApi = (0, express_1.Router)();
authApi.get("/", (req, res) => {
    let { secret } = req.body;
    if (secret == process.env.API_SECRET_KEY)
        res.json({ state: "success" });
    else
        res.json({ state: "failed", reason: "invalided secret" });
});
exports.default = authApi;
