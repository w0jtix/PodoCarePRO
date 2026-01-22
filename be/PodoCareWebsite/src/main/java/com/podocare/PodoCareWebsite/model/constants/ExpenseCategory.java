package com.podocare.PodoCareWebsite.model.constants;

public enum ExpenseCategory {
    RENT,
    FEES,
    ZUS,
    EQUIPMENT, // everything else not included in warehouse
    SALARY,
    UNRELATED, // invoices that shouldn't be counted towards the company's profitability
    OTHER
}


