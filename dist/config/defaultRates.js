"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultInterestRates = void 0;
exports.defaultInterestRates = [
    {
        rateType: "fixed",
        rate: 5.5,
        term: 12,
        loanType: "personal",
        minAmount: 1000,
        maxAmount: 50000,
    },
    {
        rateType: "fixed",
        rate: 6.0,
        term: 24,
        loanType: "personal",
        minAmount: 1000,
        maxAmount: 75000,
    },
    {
        rateType: "variable",
        rate: 4.5,
        term: 36,
        loanType: "personal",
        minAmount: 5000,
        maxAmount: 100000,
    },
    // Add more default rates as needed
];
