import { CompanyExpense, ExpenseCategory, NewCompanyExpense } from "../models/expense";
import { VatRate } from "../models/vatrate";
import { getPreviousMonth, getPreviousMonthYear, getCurrentMonth, getCurrentYear } from "./dateUtils";
import ExpenseService from "../services/ExpenseService";


export const calculateExpenseItems = (expense: CompanyExpense): number => {
    let items = 0;
    expense.expenseItems.map((item) =>
    items += item.quantity
   );
    return items;
  };

export const getCategoryTemplate = async (category: ExpenseCategory): Promise<Partial<NewCompanyExpense>> => {
  switch (category) {
    case ExpenseCategory.SALARY:
      let expenseItems: NewCompanyExpense["expenseItems"] = [
          {
            name: "Wypłata",
            quantity: 1,
            vatRate: VatRate.VAT_NP,
            price: 0,
          },
          {
            name: "Premia",
            quantity: 1,
            vatRate: VatRate.VAT_NP,
            price: 0,
          },
          {
            name: "Premia Sprzedażowa",
            quantity: 1,
            vatRate: VatRate.VAT_NP,
            price: 0,
          }        
      ];
      try {
        const latestExpense = await ExpenseService.getLatestExpenseByCategory(category);
        const salaryItem = latestExpense?.expenseItems?.find(item => item.name === "Wypłata");
        if (salaryItem) {
          expenseItems = [
            {
              name: salaryItem.name,
              quantity: salaryItem.quantity,
              vatRate: salaryItem.vatRate,
              price: salaryItem.price,
            },
            {
            name: "Premia",
            quantity: 1,
            vatRate: VatRate.VAT_NP, 
            price: 0,
          },
          {
            name: "Premia Sprzedażowa",
            quantity: 1,
            vatRate: VatRate.VAT_NP,
            price: 0,
          }    
          ];
        }
      } catch (error) {
        console.error("Error fetching latest SALARY expense:", error);
      }
      return {
        source: "Wypłata",
        invoiceNumber: `Olga-${getPreviousMonth()} ${getPreviousMonthYear()}`,
        expenseItems,
      };
    case ExpenseCategory.RENT: {
      let expenseItems: NewCompanyExpense["expenseItems"] = [
        {
          name: "Czynsz",
          quantity: 1,
          vatRate: VatRate.VAT_NP,
          price: 0,
        },
      ];
      try {
        const latestExpense = await ExpenseService.getLatestExpenseByCategory(category);
        const rentItem = latestExpense?.expenseItems?.find(item => item.name === "Czynsz");
        if (rentItem) {
          expenseItems = [
            {
              name: rentItem.name,
              quantity: rentItem.quantity,
              vatRate: rentItem.vatRate,
              price: rentItem.price,
            },
          ];
        }
      } catch (error) {
        console.error("Error fetching latest RENT expense:", error);
      }
      return {
        source: "Czynsz",
        invoiceNumber: `Lokal-${getCurrentMonth()} ${getCurrentYear()}`,
        expenseItems,
      };
    }
    case ExpenseCategory.ZUS: {
      let expenseItems: NewCompanyExpense["expenseItems"] = [
        {
          name: "ZUS",
          quantity: 1,
          vatRate: VatRate.VAT_NP,
          price: 0,
        },
      ];
      try {
        const latestExpense = await ExpenseService.getLatestExpenseByCategory(category);
        const zusItem = latestExpense?.expenseItems?.find(item => item.name === "ZUS");
        if (zusItem) {
          expenseItems = [
            {
              name: zusItem.name,
              quantity: zusItem.quantity,
              vatRate: zusItem.vatRate,
              price: zusItem.price,
            },
          ];
        }
      } catch (error) {
        console.error("Error fetching latest ZUS expense:", error);
      }
      return {
        source: "ZUS",
        invoiceNumber: "",
        expenseItems,
      };
    }
    case ExpenseCategory.FEES: {
      return {
        source: "Urząd Skarbowy",
        invoiceNumber: "PIT-",
        expenseItems:[{
          name: "PIT-",
          quantity: 1,
          vatRate: VatRate.VAT_NP,
          price: 0,
        }],
      };
    }
    default:
      return {};
  }
};