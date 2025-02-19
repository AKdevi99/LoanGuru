const { calculateCIBILScore } = require('./cibilscorecalculator');
const userModerateCIBIL = {
    MonthlyIncome: 30000, // Moderate income
    MonthlyExpend: 27000, // High expenditures, leaving limited savings
    LoanRequest: 100000,  // Loan request slightly above capacity
    outstandingDebt: 70000, // Moderate debt
    totalAssets: 100000,  // Limited assets
    totalLiabilities: 130000, // High liabilities
    loanHistory: {
        L1: {
            LoanType: "Personal Loan",
            LoanAmount: 50000,
            loanStatus: "Pending",
            startDate: "2022-01-01",
            endDate: "2025-12-31",
            interestRate: 10.0,
            regularityLack: {
                "2023": { "1": 16, "2": 0, "3": 16, "4": 0, "5": 15, "6": 0, "7": 0, "8": 15, "9": 16, "10": 0, "11": 15, "12": 16 }
            }
        },
        L2: {
            LoanType: "Car Loan",
            LoanAmount: 40000,
            loanStatus: "Paid",
            startDate: "2020-01-01",
            endDate: "2023-01-01",
            interestRate: 9.0,
            regularityLack: {
                "2022": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 15, "8": 0, "9": 0, "10": 0, "11": 15, "12": 0 }
            }
        }
    }
};




console.log("CIBIL Score (High Loan Request with Debt):", calculateCIBILScore(userModerateCIBIL));

