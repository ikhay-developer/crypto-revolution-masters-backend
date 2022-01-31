"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("firebase/app");
const firebaseConfig = {
    apiKey: "AIzaSyA8euCb_fMVl_DMqqyDz4NQcSucoXDmh28",
    authDomain: "crytorevolutionmasters.firebaseapp.com",
    databaseURL: "https://crytorevolutionmasters-default-rtdb.firebaseio.com",
    projectId: "crytorevolutionmasters",
    storageBucket: "crytorevolutionmasters.appspot.com",
    messagingSenderId: "1017469967319",
    appId: "1:1017469967319:web:8411f88b39e77b95560992",
    measurementId: "G-2K5V4GRKR0"
};
const firebaseApp = (0, app_1.initializeApp)(firebaseConfig);
exports.default = firebaseApp;
