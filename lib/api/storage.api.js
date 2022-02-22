"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const storage_1 = require("firebase/storage");
const storage_2 = __importDefault(require("../services/storage"));
const storageApi = (0, express_1.Router)();
storageApi.get("/:directory/:file", (req, res) => {
    let imgRef = (0, storage_1.ref)(storage_2.default, `${req.params.directory}/${req.params.file}`);
    if (imgRef != undefined)
        (0, storage_1.getStream)(imgRef).pipe(res);
    else {
        res.statusCode = 400;
        res.send(`<pre>Cannot GET ${req.method} /${req.url}</pre>`);
    }
});
exports.default = storageApi;
