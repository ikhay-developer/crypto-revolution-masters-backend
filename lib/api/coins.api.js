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
const express_1 = require("express");
const coinsApi = (0, express_1.Router)();
coinsApi.get("/", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coingeckoApi = yield axios_1.default.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=8000&page=1&sparkline=false&price_change_percentage=1h");
        if (coingeckoApi.status >= 200 && coingeckoApi.status <= 300) {
            let data = coingeckoApi.data
                .map(({ name, symbol, image, current_price, market_cap, market_cap_rank, fully_diluted_valuation, market_cap_change_24h, market_cap_change_percentage_24h, ath_change_percentage, high_24h, low_24h }) => ({
                name,
                symbol,
                image,
                current_price,
                market_cap,
                market_cap_rank,
                fully_diluted_valuation,
                market_cap_change_24h,
                market_cap_change_percentage_24h,
                ath_change_percentage,
                high_24h,
                low_24h
            }));
            res.send({ state: "success", data });
        }
        else {
            res.json({ state: "failed", reason: "backend error" });
        }
    }
    catch (error) {
        res.json({ state: "failed", reason: "backend error" });
    }
}));
exports.default = coinsApi;
