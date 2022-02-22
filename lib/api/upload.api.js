"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const storage_1 = require("../services/storage");
const uploadApi = (0, express_1.Router)();
const uploadMiddleware = (0, multer_1.default)();
uploadApi.post("/:where/", uploadMiddleware.any(), (req, res) => {
    let files = req.files;
    if (files != null) {
        (0, storage_1.uploadFile)(`${req.protocol}://${req.headers.host}/${process.env.API_SECRET_KEY}/storage`, String(files.at(0)["originalname"]), req.params.where, files.at(0)["buffer"]).then(imageUrl => {
            res.json({ state: "success", data: { imageUrl } });
        }).catch(_ => {
            res.json({ state: "failed", reason: "backend error" });
        });
    }
    else {
        res.json({ state: "failed", reason: "backend error" });
    }
});
exports.default = uploadApi;
