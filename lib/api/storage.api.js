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
const express_1 = require("express");
const storage_1 = require("firebase/storage");
const storage_2 = __importDefault(require("../services/storage"));
const storageApi = (0, express_1.Router)();
storageApi.get("/:directory/:file", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let imgRef = (0, storage_1.ref)(storage_2.default, `${req.params.directory}/${req.params.file}`);
    let isExist = (yield (0, storage_1.listAll)(imgRef)).items.length > 0 ? true : false;
    if (isExist && imgRef != undefined)
        (0, storage_1.getStream)(imgRef).pipe(res);
    else {
        res.statusCode = 400;
        let errorPage = String('<!DOCTYPE html>')
            .concat('<html lang="en">')
            .concat('<head>')
            .concat('<meta charset="utf-8">\n<title>Error</title>')
            .concat('</head>')
            .concat('<body>')
            .concat(`<pre>\nCannot GET ${req.method} ${req.url}\n</pre>`)
            .concat('</body>');
        res.send(errorPage);
    }
}));
storageApi.delete("/:directory/:file", (req, res) => {
    let imgRef = (0, storage_1.ref)(storage_2.default, `${req.params.directory}/${req.params.file}`);
    (0, storage_1.deleteObject)(imgRef)
        .then(_ => res.json({ state: "success" }))
        .catch(e => {
        if (e.code == "storage/object-not-found")
            res.json({ state: "success" });
        else
            res.json({ state: "failed", reason: "backend error" });
    });
});
exports.default = storageApi;
