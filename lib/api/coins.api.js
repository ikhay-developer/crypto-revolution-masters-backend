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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const express_1 = require("express");
const coinsApi = (0, express_1.Router)();
const fetchCoinsFromCoingecko = (pageList) => { var pageList_1, pageList_1_1; return __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    let returnData = Array();
    try {
        for (pageList_1 = __asyncValues(pageList); pageList_1_1 = yield pageList_1.next(), !pageList_1_1.done;) {
            const page = pageList_1_1.value;
            try {
                const coingeckoApi = yield axios_1.default.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=false&price_change_percentage=1h`);
                if (coingeckoApi.status >= 200 && coingeckoApi.status <= 300) {
                    let data = coingeckoApi.data
                        .map(({ name, symbol, image, current_price, market_cap, market_cap_rank, fully_diluted_valuation, market_cap_change_24h, market_cap_change_percentage_24h, ath_change_percentage, price_change_percentage_1h_in_currency, price_change_percentage_24h, price_change_24h, high_24h, low_24h }) => ({
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
                        low_24h,
                        price_change_24h,
                        price_change_percentage_24h,
                        price_change_percentage_1h_in_currency
                    }));
                    returnData.push(...data);
                }
                else {
                    throw new Error();
                }
            }
            catch (error) {
                returnData.push();
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (pageList_1_1 && !pageList_1_1.done && (_a = pageList_1.return)) yield _a.call(pageList_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return returnData;
}); };
coinsApi.get("/", (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    fetchCoinsFromCoingecko(["1", "2", "3", "4"])
        .then(data => res.send({ state: "success", data }))
        .catch(_ => res.json({ state: "failed", reason: "backend error" }));
}));
exports.default = coinsApi;
