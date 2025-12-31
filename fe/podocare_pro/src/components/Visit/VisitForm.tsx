import DropdownSelect from "../DropdownSelect";
import { Employee } from "../../models/employee";
import { Client } from "../../models/client";
import { useEffect, useState, useCallback } from "react";
import EmployeeService from "../../services/EmployeeService";
import ClientService from "../../services/ClientService";
import ClientDebtService from "../../services/ClientDebtService";
import {
  Visit,
  NewVisit,
  NewVisitItem,
  VisitDiscountType,
  discountLabelFor,
  discountSrcFor,
} from "../../models/visit";
import { NewSaleItem } from "../../models/sale";
import { useUser } from "../User/UserProvider";
import { BaseService, ServiceVariant } from "../../models/service";
import { Product } from "../../models/product";
import DigitInput from "../DigitInput";
import {
  SERVICES_DISCOUNTED_VISIT_ATTRIBUTES,
  SERVICES_VISIT_ATTRIBUTES,
  PRODUCT_VISIT_LIST_ATTRIBUTES,
  DEBTS_VISIT_LIST_ATTRIBUTES,
  SERVICES_BOOST_DISCOUNTED_VISIT_ATTRIBUTES,
  SERVICES_BOOST_VISIT_ATTRIBUTES,
} from "../../constants/list-headers";
import ClientPopup from "../Popups/ClientPopup";
import DebtsList from "../Clients/DebtsList";
import VisitCartItemList from "./VisitCartItemList";
import ActionButton from "../ActionButton";
import DateInput from "../DateInput";
import { ClientDebt } from "../../models/debt";
import { AppSettings } from "../../models/app_settings";
import AppSettingsService from "../../services/AppSettingsService";
import { PaymentMethod } from "../../models/payment";
import { DropdownItem } from "../DropdownSelect";
import CostInput from "../CostInput";
import AvailableVouchersPopup from "../Popups/AvailableVouchersPopup";
import { Voucher } from "../../models/voucher";
import { NewSale } from "../../models/sale";
import VisitService from "../../services/VisitService";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import { validateVisitForm } from "../../utils/validators";
import ServiceVariantsPopup from "../Popups/ServiceVariantsPopup";
import { translatePaymentMethod } from "../../utils/paymentUtils";
import TextInput from "../TextInput";

export interface VisitFormProps {
  products?: Product[];
  selectedService?: BaseService | null;
  setSelectedService?: (service: BaseService | null) => void;
  selectedProduct?: Product | null;
  setSelectedProduct?: (product: Product | null) => void;
  setQuickVisitTotal?: (total: number) => void;
  onClose?: () => void;
}

export function VisitForm({
  products,
  selectedService,
  setSelectedService,
  selectedProduct,
  setSelectedProduct,
  setQuickVisitTotal,
  onClose,
}: VisitFormProps) {
  const { user } = useUser();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [chosenServices, setChosenServices] = useState<NewVisitItem[]>([]);
  const [chosenProducts, setChosenProducts] = useState<NewSaleItem[]>([]);
  const [selectedDebtIds, setSelectedDebtIds] = useState<number[]>([]);
  const [isDelayed, setIsDelayed] = useState<boolean>(false);
  const [clientDebts, setClientDebts] = useState<ClientDebt[]>([]);
  const [customDiscountValue, setCustomDiscountValue] = useState<number | null>(
    null
  );
  const [voucherSelectionPopup, setVoucherSelectionPopup] =
    useState<boolean>(false);
  const [voucherPaymentIndex, setVoucherPaymentIndex] = useState<number | null>(
    null
  );
  const [sectionVisible, setSectionVisible] = useState<{
    services: boolean;
    products: boolean;
    debts: boolean;
    discounts: boolean;
    payment: boolean;
    notes: boolean;
  }>({
    services: false,
    products: false,
    debts: true,
    discounts: false,
    payment: true,
    notes: false,
  });

  const [visitDTO, setVisitDTO] = useState<NewVisit>({
    employee: user?.employee ?? null,
    client: null,
    serviceDiscounts: [],
    receipt: true,
    isBoost: false,
    isVip: false,
    delayTime: null,
    absence: false,
    items: [],
    sale: null,
    debtRedemptions: [],
    date: new Date().toISOString().split("T")[0],
    payments: [
      {
        method: null,
        amount: 0,
      },
    ],
    notes: null,
  });
  const clientWithDebt = clientDebts.length > 0;
  const { showAlert } = useAlert();
  const [visitPreview, setVisitPreview] = useState<Visit | null>(null);
  const [pendingService, setPendingService] = useState<BaseService | null>(
    null
  );
  const [variantsAddOnsPopupOpen, setVariantsAddOnsPopupOpen] =
    useState<boolean>(false);
  const [allItemsHaveFinalPrice, setAllItemsHaveFinalPrice] =
    useState<boolean>(false);

  const fetchEmployees = async () => {
    EmployeeService.getAllEmployees()
      .then((data) => {
        setEmployees(data);
      })
      .catch((error) => {
        setEmployees([]);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching categories:", error);
      });
  };
  const fetchClients = async (): Promise<void> => {
    ClientService.getClients()
      .then((data) => {
        const sortedClients = [...data].sort((a, b) =>
          a.firstName.localeCompare(b.firstName, "pl", { sensitivity: "base" })
        );
        setClients(sortedClients);
      })
      .catch((error) => {
        setClients([]);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching Clients: ", error);
      });
  };
  const fetchSettings = async () => {
    AppSettingsService.getSettings()
      .then((data) => {
        setSettings(data);
      })
      .catch((error) => {
        setSettings(null);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching settings:", error);
      });
  };
  const getVisitPreview = async () => {
    VisitService.getVisitPreview(visitDTO as NewVisit)
      .then((data) => {
        setVisitPreview(data);
        setQuickVisitTotal?.(data.totalValue);
      })
      .catch((error) => {
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching Visit preview:", error);
      });
  };

  useEffect(() => {
    if (visitDTO.client) {
      ClientDebtService.getUnpaidDebtsByClientId(visitDTO.client.id)
        .then((data) => setClientDebts(data))
        .catch(() => setClientDebts([]));

      if (
        !visitDTO.isVip &&
        visitDTO.client.discount != null &&
        !allItemsHaveFinalPrice
      ) {
        toggleDiscount(VisitDiscountType.CLIENT_DISCOUNT);
      }
      if (
        !visitDTO.absence &&
        visitDTO.client.hasActiveGoogleReview &&
        !allItemsHaveFinalPrice
      ) {
        toggleDiscount(VisitDiscountType.GOOGLE_REVIEW);
      }
    } else {
      setClientDebts([]);
    }
  }, [visitDTO.client]);

  useEffect(() => {
    getVisitPreview();
  }, [visitDTO]);

  const handleResetVisitForm = () => {
    setVisitDTO({
      employee: user?.employee ?? null,
      client: null,
      serviceDiscounts: [],
      receipt: true,
      isBoost: false,
      isVip: false,
      delayTime: null,
      absence: false,
      items: [],
      sale: null,
      debtRedemptions: [],
      date: new Date().toISOString().split("T")[0],
      payments: [
        {
          method: null,
          amount: 0,
        },
      ],
      notes: null,
    });
    setSectionVisible({
      services: false,
      products: false,
      debts: true,
      discounts: false,
      payment: true,
      notes: false,
    });
    setVisitPreview(null);
    setPendingService(null);
    setVariantsAddOnsPopupOpen(false);
    setVoucherSelectionPopup(false);
    setVoucherPaymentIndex(null);
    setCustomDiscountValue(null);
    setClientDebts([]);
    setIsDelayed(false);
    setSelectedDebtIds([]);
    setChosenProducts([]);
    setChosenServices([]);
    setAllItemsHaveFinalPrice(false);
    fetchEmployees();
    fetchClients();
    fetchSettings();
  };

  const handleVisitAction = useCallback(async () => {
    const error = validateVisitForm(visitDTO, products);
    if (error) {
      showAlert(error, AlertType.ERROR);
      return;
    }
    try {
      await VisitService.createVisit(visitDTO as NewVisit);
      showAlert(`Wizyta utworzona pomyślnie!`, AlertType.SUCCESS);
      handleResetVisitForm();
      onClose?.();
    } catch (error) {
      showAlert(`Błąd podczas tworzenia wizyty!`, AlertType.ERROR);
    }
  }, [visitDTO, showAlert, visitPreview]);

  /* DATE */
  const handleVisitDate = useCallback((visitDate: string | null) => {
    if (visitDate) {
      setVisitDTO((prev) => ({
        ...prev,
        date: visitDate,
      }));
    }
  }, []);

  /* CHECKERS */
  const handleBoostVisit = useCallback(() => {
    setVisitDTO((prev) => {
      const newIsBoost = !prev.isBoost;

      // Jeśli wyłączamy Boost, resetuj boostItem we wszystkich usługach
      if (!newIsBoost) {
        setChosenServices((prevServices) =>
          prevServices.map((item) => ({
            ...item,
            boostItem: false,
          }))
        );
      }

      return {
        ...prev,
        isBoost: newIsBoost,
      };
    });
  }, []);
  const handleVipVisit = useCallback(() => {
    setVisitDTO((prev) => ({
      ...prev,
      isVip: !prev.isVip,
    }));
  }, []);
  useEffect(() => {
    if (visitDTO.isVip) {
      setVisitDTO((prev) => ({
        ...prev,
        serviceDiscounts: prev.serviceDiscounts?.filter(
          (d) => d.type === VisitDiscountType.GOOGLE_REVIEW
        ),
      }));
      setChosenServices((prev) =>
        prev.map((item) => ({
          ...item,
          finalPrice: null,
        }))
      );
    }
  }, [visitDTO.isVip]);
  const handleAbsence = useCallback(() => {
    setVisitDTO((prev) => ({
      ...prev,
      absence: !prev.absence,
    }));
    setChosenProducts([]);
    setSectionVisible((prev) => ({
      ...prev,
      payment: false,
    }));
  }, []);
  const handleReceipt = useCallback(() => {
    setVisitDTO((prev) => ({
      ...prev,
      receipt: !prev.receipt,
    }));
  }, []);
  useEffect(() => {
    if (visitDTO.absence) {
      setVisitDTO((prev) => ({
        ...prev,
        serviceDiscounts: prev.serviceDiscounts?.filter(
          (d) => d.type === VisitDiscountType.CLIENT_DISCOUNT
        ),
        payments: [],
      }));
      setChosenServices((prev) =>
        prev.map((item) => ({
          ...item,
          finalPrice: null,
        }))
      );
    }
  }, [visitDTO.absence]);
  const handleDelay = () => {
    setVisitDTO((prev) => ({
      ...prev,
      delayTime: prev.delayTime ? null : prev.delayTime,
    }));
    setIsDelayed((prev) => {
      const newValue = !prev;

      if (!newValue) {
        setVisitDTO((v) => ({ ...v, delayTime: null }));
      }

      return newValue;
    });
  };
  const handleDelayTime = useCallback((time: number | null) => {
    setVisitDTO((prev) => ({
      ...prev,
      delayTime: time,
    }));
  }, []);

  /* EMPLOYEE */
  const handleEmployeeSelect = useCallback(
    (employee: Employee | Employee[] | null) => {
      const selectedEmployee = Array.isArray(employee) ? employee[0] : employee;

      setVisitDTO((prev) => ({
        ...prev,
        employee: selectedEmployee ?? null,
      }));
    },
    []
  );
  /* CLIENT */
  const handleClientChange = useCallback(
    (client: Client | Client[] | null) => {
      const selectedClient = Array.isArray(client) ? client[0] : client;

      setVisitDTO((prev) => ({
        ...prev,
        client: selectedClient ?? null,
        serviceDiscounts: [],
        debtRedemptions: [],
      }));

      fetchClients();

      if (
        selectedClient?.discount != null ||
        selectedClient?.hasActiveGoogleReview
      ) {
        setSectionVisible((prev) => ({
          ...prev,
          discounts: true,
        }));
      } else if (!selectedClient) {
        setSectionVisible((prev) => ({
          ...prev,
          discounts: false,
        }));
      }
    },
    [clients, clientDebts]
  );
  /* DEBT REDEMPTIONS */
  const handleDebtRedemption = useCallback((clientDebt: ClientDebt) => {
    setVisitDTO((prev) => {
      const list = prev.debtRedemptions ?? [];
      const exists = list.some((dr) => dr.debtSource.id === clientDebt.id);

      const updated = exists
        ? list.filter((dr) => dr.debtSource.id !== clientDebt.id)
        : [...list, { debtSource: clientDebt }];

      return { ...prev, debtRedemptions: updated };
    });

    setSelectedDebtIds((prev) =>
      prev.includes(clientDebt.id)
        ? prev.filter((id) => id !== clientDebt.id)
        : [...prev, clientDebt.id]
    );
  }, []);

  /* DISCOUNTS */
  const getAvailableDiscountTypes = () => {
    const types = [VisitDiscountType.HAPPY_HOURS, VisitDiscountType.CUSTOM];

    if (visitDTO.client?.discount != null) {
      types.push(VisitDiscountType.CLIENT_DISCOUNT);
    }

    if (visitDTO.client?.hasActiveGoogleReview === true) {
      types.push(VisitDiscountType.GOOGLE_REVIEW);
    }
    // makes sure custom is always last
    const customIndex = types.indexOf(VisitDiscountType.CUSTOM);
    if (customIndex > -1) {
      types.splice(customIndex, 1);
      types.push(VisitDiscountType.CUSTOM);
    }

    return types;
  };
  const toggleDiscount = useCallback(
    (type: VisitDiscountType) => {
      setVisitDTO((prev) => {
        const current = prev.serviceDiscounts ?? [];
        const exists = current.some((d) => d.type === type);

        if (exists) {
          if (type === VisitDiscountType.CUSTOM) {
            setCustomDiscountValue(null);
          }

          return {
            ...prev,
            serviceDiscounts: current.filter((d) => d.type !== type),
          };
        }
        if (allItemsHaveFinalPrice) {
          showAlert(
            "Rabat bez efektu, wszystkie ceny usług są zamrożone!",
            AlertType.INFO
          );
          return prev;
        } else {
          return {
            ...prev,
            serviceDiscounts: [...current, { type }],
          };
        }
      });
    },
    [allItemsHaveFinalPrice]
  );

  const handleCustomDiscountValueChange = (value: number | null) => {
    const numericValue = value ?? 0;

    setCustomDiscountValue(numericValue);

    setVisitDTO((prev) => {
      const discounts = prev.serviceDiscounts ?? [];

      const customIndex = discounts.findIndex(
        (d) => d.type === VisitDiscountType.CUSTOM
      );

      let updatedDiscounts;
      if (customIndex >= 0) {
        updatedDiscounts = discounts.map((d, i) =>
          i === customIndex ? { ...d, percentageValue: numericValue } : d
        );
      }

      return { ...prev, serviceDiscounts: updatedDiscounts };
    });
  };
  /* PAYMENT */
  const paymentItems: DropdownItem[] = Object.values(PaymentMethod).map(
    (method) => ({
      id: method,
      name: translatePaymentMethod(method),
    })
  );
  const handlePaymentMethodChange = (
    index: number,
    val: DropdownItem | DropdownItem[] | null
  ) => {
    const value = Array.isArray(val) ? val[0] : val;

    setVisitDTO((prev) => {
      const payments = [...prev.payments];

      const newMethod = (value?.id as PaymentMethod) ?? null;
      const oldPayment = payments[index];

      const updatedPayment = {
        ...oldPayment,
        method: newMethod,
        voucher: null,
      };

      payments[index] = updatedPayment;

      return { ...prev, payments };
    });
  };
  const handlePaymentAmount = (index: number, value: number | null) => {
    setVisitDTO((prev) => {
      const payments = [...prev.payments];
      payments[index].amount = (value as number) ?? 0;
      return { ...prev, payments };
    });
  };
  const handleAssignVoucher = (index: number, voucher: Voucher | null) => {
    setVisitDTO((prev) => {
      const payments = [...prev.payments];

      payments[index] = {
        ...payments[index],
        voucher: voucher,
        amount: voucher ? voucher.value : 0,
      };

      return { ...prev, payments };
    });
  };
  const addPayment = useCallback(() => {
    setVisitDTO((prev) => ({
      ...prev,
      payments: [
        ...prev.payments,
        {
          method: null,
          amount: 0,
        },
      ],
    }));
  }, []);
  const handlePaymentRemove = useCallback((index: number) => {
    setVisitDTO((prev) => {
      const updated = prev.payments.filter((_, i) => i !== index);

      return {
        ...prev,
        payments: updated,
      };
    });
  }, []);

  /* NOTES */

  const handleNotes = useCallback((note: string) => {
    setVisitDTO((prev) => ({
      ...prev,
      notes: note,
    }));
  }, []);

  /* visitItem, saleItem */
  const handleVariantSelect = (variant: ServiceVariant | null) => {
    if (!pendingService) return;

    const newItem: NewVisitItem = {
      service: pendingService,
      serviceVariant: variant,
    };
    setChosenServices((prev) => [...prev, newItem]);
    setPendingService(null);
  };
  const handleRemoveServiceByIndex = useCallback((index: number) => {
    setChosenServices((prev) => prev.filter((_, i) => i !== index));
  }, []);
  const onManageBoostByIndex = useCallback((index: number) => {
    setChosenServices((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        return {
          ...item,
          boostItem: item.boostItem ? false : true,
        };
      })
    );
  }, []);
  const freezePrice = useCallback((index: number) => {
    setChosenServices((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const isFrozen =
          item.finalPrice !== undefined && item.finalPrice !== null;

        const isVariant = item.serviceVariant != null;

        return {
          ...item,
          finalPrice: isFrozen
            ? undefined
            : isVariant
            ? item.serviceVariant?.price
            : item.service?.price ?? 0,
        };
      })
    );
  }, []);
  const handleRemoveProductByIndex = useCallback((index: number) => {
    setChosenProducts((prev) => prev.filter((_, i) => i !== index));
  }, []);
  const handleSaleItemPriceChange = useCallback(
    (index: number, value: number) => {
      setChosenProducts((prev) =>
        prev.map((item, i) => {
          if (i !== index) return item;

          if ("product" in item) {
            return { ...item, price: value };
          }

          if ("voucher" in item) {
            return {
              ...item,
              price: value,
              voucher: {
                value: value,
              },
            };
          }

          return item;
        })
      );
    },
    []
  );
  const addVoucherToSaleItems = useCallback(() => {
    if (!visitDTO.absence) {
      const newSaleItem: NewSaleItem = {
        voucher: {
          value: 0,
        },
        price: 0,
      };
      setChosenProducts((prev) => [...prev, newSaleItem]);
    }
  }, [visitDTO]);

  useEffect(() => {
    fetchEmployees();
    fetchClients();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (selectedProduct && !visitDTO.absence) {
      const availableSupply = products?.find(
        (p) => p.id === selectedProduct.id
      )?.supply;
      const currentlyChosenQty = chosenProducts.filter(
        (sp) => sp.product?.id === selectedProduct.id
      ).length;
      if (currentlyChosenQty >= availableSupply!) {
        showAlert("Niewystarczająca ilość w magazynie!", AlertType.INFO);
      }

      const newSaleItem: NewSaleItem = {
        product: selectedProduct,
        price: selectedProduct.sellingPrice ?? 0,
      };
      setChosenProducts((prev) => [...prev, newSaleItem]);

      setSelectedProduct?.(null);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (!selectedService) return;

    if (selectedService) {
      if (selectedService.variants.length > 0) {
        setPendingService(selectedService);
        setVariantsAddOnsPopupOpen(true);
        setSelectedService?.(null);
        return;
      }

      const newVisitItem: NewVisitItem = {
        service: selectedService,
      };
      setChosenServices((prev) => [...prev, newVisitItem]);
      setSelectedService?.(null);
    }
  }, [selectedService]);

  useEffect(() => {
    setVisitDTO((prev) => ({
      ...prev,
      items: chosenServices,
    }));
    if (chosenServices.length > 0) {
      setSectionVisible((prev) => ({
        ...prev,
        services: true,
      }));
    }
    if (chosenServices.length > 0) {
      const allHaveFinalPrice = chosenServices.every(
        (item) => item.finalPrice !== undefined && item.finalPrice !== null
      );

      setAllItemsHaveFinalPrice(allHaveFinalPrice);
    } else {
      setAllItemsHaveFinalPrice(false);
    }
  }, [chosenServices]);

  useEffect(() => {
    if (allItemsHaveFinalPrice) {
      setVisitDTO((prev) => ({
        ...prev,
        serviceDiscounts: [],
      }));
    }
  }, [allItemsHaveFinalPrice]);

  useEffect(() => {
    const newSale: NewSale = {
      items: chosenProducts,
    };

    setVisitDTO((prev) => ({
      ...prev,
      sale: newSale,
    }));
    if (chosenProducts.length > 0) {
      setSectionVisible((prev) => ({
        ...prev,
        products: true,
      }));
    } else {
      setVisitDTO((prev) => ({
        ...prev,
        sale: null,
      }));
    }
  }, [chosenProducts]);
  
  return (
    <>
      <div className="visit-form-container flex-column align-items-center mt-05 f-1">
        <section className="qv-summary-employee-date-section flex width-90 mt-05 justify-self-center">
          <div className="width-max flex justify-self-center space-between align-items-center">
            <div className="flex align-items-center g-1">
              <span className="qv-span">Podolog:</span>
              <DropdownSelect<Employee>
                items={employees}
                onChange={handleEmployeeSelect}
                value={visitDTO?.employee}
                placeholder="Nie wybrano"
                searchable={false}
                multiple={false}
                allowNew={false}
              />
            </div>
            <div className="flex align-items-center g-1">
              <span className="qv-span">Data Wizyty:</span>
              <DateInput
                onChange={handleVisitDate}
                selectedDate={visitDTO.date ?? new Date()}
              />
            </div>
          </div>
        </section>
        <section className="qv-summary-client-section width-max mt-05">
          <div className="qv-dropdown-with-label width-90 justify-self-center flex space-between align-items-center">
            <span className="qv-span">Klient:</span>
            {clientWithDebt && (
              <div className="popup-warning-explanation-display flex justify-center align-items-center">
                <img
                  src="src/assets/warning.svg"
                  alt="Warning"
                  className="order-item-warning-icon"
                />
                <a className="warning-explanation text-align-center">
                  Klient zadłużony
                </a>
              </div>
            )}
            <DropdownSelect<Client>
              items={clients}
              onChange={handleClientChange}
              value={visitDTO?.client}
              getItemLabel={(c) => `${c.firstName} ${c.lastName}`}
              placeholder="Nie wybrano"
              searchable={true}
              multiple={false}
              className="clients"
              showNewPopup={true}
              newItemComponent={ClientPopup as React.ComponentType<any>}
              newItemProps={{
                onSelectClient: handleClientChange,
              }}
            />
          </div>
        </section>
        <section className="qv-summary-checkers-section width-max mt-1">
          <div className="qv-dropdown-with-label width-95 justify-self-center flex space-between align-items-top">
            <div className="flex space-between width-max align-items-end">
              <ActionButton
                src={"src/assets/receipt.svg"}
                alt={"Wydano Paragon"}
                text={"Wydano Paragon"}
                iconTitle="Klient otrzymał Paragon"
                disableText={true}
                onClick={handleReceipt}
                className={`pricelist qv sel ${
                  visitDTO.receipt ? "active-w" : ""
                }`}
              />
              <ActionButton
                src={"src/assets/absence.svg"}
                alt={"Nieobecność"}
                text={"Nieobecność"}
                iconTitle={"Nieobecność"}
                onClick={handleAbsence}
                className={`pricelist qv sel ${
                  visitDTO.absence ? "active-r" : ""
                }`}
              />
              <ActionButton
                src={"src/assets/time.svg"}
                alt={"Spóźnienie"}
                text={"Spóźnienie"}
                iconTitle={"Spóźnienie"}
                onClick={handleDelay}
                className={`pricelist qv sel ${isDelayed ? "active-y" : ""}`}
              />
              {isDelayed && (
                <div className="flex g-5px">
                  <DigitInput
                    onChange={handleDelayTime}
                    min={1}
                    max={120}
                    value={visitDTO.delayTime ?? 0}
                    className="visit-form"
                  />
                  <span className="span-min align-self-center">min</span>
                </div>
              )}

              <ActionButton
                src={"src/assets/boost.svg"}
                alt={"Boost"}
                text={"Boost"}
                iconTitle={"Wizyta Boost"}
                onClick={handleBoostVisit}
                className={`pricelist qv sel ${
                  visitDTO.isBoost ? "active-p" : ""
                }`}
              />
              <ActionButton
                src={"src/assets/vip.svg"}
                alt={"Wizyta VIP"}
                text={"Wizyta VIP"}
                iconTitle={"Wizyta VIP"}
                onClick={handleVipVisit}
                className={`pricelist qv sel ${
                  visitDTO.isVip ? "active-b" : ""
                }`}
              />
            </div>
          </div>
        </section>
        <section className="qv-summary-notes-section width-max mt-1">
          <div
            className={`qv-summary-services width-max flex-column justify-self-center justify-center  ${
              sectionVisible.notes ? "active" : ""
            }`}
          >
            <div className="qv-section-header first  flex justify-center align-items-center">
              <div className="flex space-between width-90 align-items-center">
                <div className="header-info width-max flex space-between align-items-center">
                  <div className="qv-h-container flex space-between">
                    <span className="qv-span">Notatki:</span>
                  </div>
                  <div className="flex g-1">
                    <ActionButton
                      src={"src/assets/arrow_down.svg"}
                      alt={"Toggle"}
                      disableText={true}
                      onClick={() =>
                        setSectionVisible((prev) => ({
                          ...prev,
                          notes: !prev.notes,
                        }))
                      }
                      className={`qv-section-toggle ${
                        sectionVisible.notes ? "rotated" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {sectionVisible.notes && (
              <div className="qv-summary-services-list flex-column width-90 mt-05 mb-05 align-self-center g-05 ">
                <TextInput
                  value={visitDTO.notes ?? ""}
                  rows={3}
                  multiline={true}
                  placeholder={"Notatki do Wizyty..."}
                  onSelect={(note) => {
                    if (typeof note === "string") {
                      handleNotes(note);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </section>
        <section className="qv-summary-lists-section width-max ">
          <div
            className={`qv-summary-services width-max flex-column justify-self-center justify-center ${
              sectionVisible.services ? "active" : ""
            }`}
          >
            <div className="qv-section-header flex justify-center align-items-center">
              <div className="flex space-between width-90 align-items-center">
                <div className="header-info width-max flex g-2">
                  <div className="qv-h-container flex space-between">
                    <span className="qv-span">Usługi:</span>
                    <span className="qv-span">
                      {`${chosenServices.length}`}
                    </span>
                  </div>
                </div>
                <ActionButton
                  src={"src/assets/arrow_down.svg"}
                  alt={"Toggle"}
                  disableText={true}
                  onClick={() =>
                    setSectionVisible((prev) => ({
                      ...prev,
                      services: !prev.services,
                    }))
                  }
                  className={`qv-section-toggle ${
                    sectionVisible.services ? "rotated" : ""
                  }`}
                />
              </div>
            </div>

            {sectionVisible.services && (
              <div className="qv-summary-services-list width-90 mt-1 mb-1 align-self-center">
                <VisitCartItemList
                  attributes={
                    visitDTO.isBoost
                      ? visitDTO.isVip ||
                        visitDTO.absence ||
                        visitDTO.serviceDiscounts!.length > 0
                        ? SERVICES_BOOST_DISCOUNTED_VISIT_ATTRIBUTES
                        : SERVICES_BOOST_VISIT_ATTRIBUTES
                      : visitDTO.isVip ||
                        visitDTO.absence ||
                        visitDTO.serviceDiscounts!.length > 0
                      ? SERVICES_DISCOUNTED_VISIT_ATTRIBUTES
                      : SERVICES_VISIT_ATTRIBUTES
                  }
                  items={chosenServices}
                  visitPreview={visitPreview}
                  onRemoveByIndex={handleRemoveServiceByIndex}
                  onManageBoostByIndex={onManageBoostByIndex}
                  onFreezePrice={
                    visitDTO.absence || visitDTO.isVip ? undefined : freezePrice
                  }
                  className="services pricelist qv"
                  allowFreezeHover={
                    visitDTO.absence || visitDTO.isVip ? false : true
                  }
                />
              </div>
            )}
          </div>
        </section>
        <section className="qv-summary-lists-section width-max">
          <div
            className={`qv-summary-services width-max flex-column justify-self-center justify-center ${
              sectionVisible.products ? "active" : ""
            }`}
          >
            <div className="qv-section-header flex justify-center align-items-center">
              <div className="flex space-between width-90 align-items-center">
                <div className="header-info width-max flex space-between align-items-center">
                  <div className="qv-h-container flex space-between">
                    <span className="qv-span">Produkty:</span>
                    <span className="qv-span">
                      {`${chosenProducts.length}`}
                    </span>
                  </div>
                  <div className="flex g-1">
                    {sectionVisible.products && (
                      <ActionButton
                        src={"src/assets/addNew.svg"}
                        alt={"Voucher"}
                        text={"Voucher"}
                        onClick={addVoucherToSaleItems}
                        className="pricelist qv"
                      />
                    )}
                    <ActionButton
                      src={"src/assets/arrow_down.svg"}
                      alt={"Toggle"}
                      disableText={true}
                      onClick={() =>
                        setSectionVisible((prev) => ({
                          ...prev,
                          products: !prev.products,
                        }))
                      }
                      className={`qv-section-toggle ${
                        sectionVisible.products ? "rotated" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
            {sectionVisible.products && (
              <div className="qv-summary-services-list width-90 mt-1 mb-1 align-self-center">
                <VisitCartItemList
                  attributes={PRODUCT_VISIT_LIST_ATTRIBUTES}
                  items={chosenProducts}
                  onRemoveByIndex={handleRemoveProductByIndex}
                  onSaleItemPriceChange={handleSaleItemPriceChange}
                  className="services pricelist qv products"
                />
              </div>
            )}
          </div>
        </section>
        {clientWithDebt && (
          <section className="qv-summary-debt-redemptions-section width-max">
            <div
              className={`qv-summary-services width-max flex-column justify-self-center justify-center ${
                sectionVisible.debts ? "active" : ""
              }`}
            >
              <div className="qv-section-header flex justify-center align-items-center">
                <div className="flex space-between width-90 align-items-center">
                  <div className="header-info width-max flex space-between align-items-center">
                    <div className="qv-h-container flex space-between">
                      <span className="qv-span">Klient spłaca:</span>
                      <span className="qv-span">
                        {`${visitDTO.debtRedemptions.length}`}
                      </span>
                    </div>
                    <div className="flex g-1">
                      <ActionButton
                        src={"src/assets/arrow_down.svg"}
                        alt={"Toggle"}
                        disableText={true}
                        onClick={() =>
                          setSectionVisible((prev) => ({
                            ...prev,
                            debts: !prev.debts,
                          }))
                        }
                        className={`qv-section-toggle ${
                          sectionVisible.debts ? "rotated" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {sectionVisible.debts && (
                <div className="qv-summary-services-list width-90 mt-05 mb-05 align-self-center">
                  <DebtsList
                    attributes={DEBTS_VISIT_LIST_ATTRIBUTES}
                    items={clientDebts}
                    selectedIds={selectedDebtIds}
                    onSelect={handleDebtRedemption}
                    className="products popup-list quick-visit"
                  />
                </div>
              )}
            </div>
          </section>
        )}
        <section className="qv-summary-discounts-section width-max">
          <div
            className={`qv-summary-services width-max flex-column justify-self-center justify-center ${
              sectionVisible.discounts ? "active" : ""
            }`}
          >
            <div className="qv-section-header flex justify-center align-items-center">
              <div className="flex space-between width-90 align-items-center">
                <div className="header-info width-max flex space-between align-items-center">
                  <div className="qv-h-container flex space-between">
                    <span className="qv-span">Rabaty:</span>
                    <span className="qv-span">
                      {`${visitDTO.serviceDiscounts?.length}`}
                    </span>
                  </div>
                  <div className="flex g-1">
                    <ActionButton
                      src={"src/assets/arrow_down.svg"}
                      alt={"Toggle"}
                      disableText={true}
                      onClick={() =>
                        setSectionVisible((prev) => ({
                          ...prev,
                          discounts: !prev.discounts,
                        }))
                      }
                      className={`qv-section-toggle ${
                        sectionVisible.discounts ? "rotated" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
            {sectionVisible.discounts && (
              <div className="discount-checkers flex mt-05 mb-05 g-05 space-evenly">
                {getAvailableDiscountTypes().map((type) => {
                  const isCustom = type === VisitDiscountType.CUSTOM;
                  const isChecked =
                    visitDTO.serviceDiscounts?.some((d) => d.type === type) ??
                    false;
                  let isDisabled = false;

                  if (visitDTO.absence && visitDTO.isVip) {
                    isDisabled = true;
                  } else if (visitDTO.absence) {
                    isDisabled = type !== VisitDiscountType.CLIENT_DISCOUNT;
                  } else if (visitDTO.isVip) {
                    isDisabled = type !== VisitDiscountType.GOOGLE_REVIEW;
                  } else {
                    isDisabled = visitDTO.isVip || visitDTO.absence;
                  }

                  return (
                    <div
                      key={type}
                      className="discount-wrapper flex width-fit-content justify-self-center"
                    >
                      <ActionButton
                        disabled={isDisabled}
                        src={discountSrcFor(type)}
                        alt={"Discount"}
                        text={discountLabelFor(
                          type,
                          visitDTO,
                          settings as AppSettings
                        )}
                        onClick={() => toggleDiscount(type)}
                        className={`pricelist qv sel discount ${
                          isChecked ? "active-g" : ""
                        } ${isDisabled ? "not-allowed" : ""}`}
                      />

                      {isCustom && isChecked && (
                        <div className="flex g-05 justify-center align-items-end ml-05">
                          <DigitInput
                            onChange={handleCustomDiscountValueChange}
                            min={1}
                            max={100}
                            value={customDiscountValue ?? 0}
                            className="visit-form"
                          />
                          <span className="input-label visit-form mb-5px">
                            %
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
        <section className="qv-summary-payment-section width-max">
          <div
            className={`qv-summary-services width-max flex-column justify-self-center justify-center  `}
          >
            <div className="qv-section-header flex justify-center align-items-center">
              <div className="flex space-between width-90 align-items-center">
                <div className="header-info width-max flex space-between align-items-center">
                  <div className="qv-h-container flex space-between">
                    <span className="qv-span">Płatność:</span>
                    <span className="qv-span">
                      {`${visitDTO.payments.length}`}
                    </span>
                  </div>
                  <div className="flex g-1">
                    {sectionVisible.payment && (
                      <ActionButton
                        src={"src/assets/addNew.svg"}
                        alt={"Płatność"}
                        text={"Płatność"}
                        onClick={addPayment}
                        className={`pricelist qv ${
                          visitDTO.absence ? "not-allowed" : ""
                        }`}
                        disabled={visitDTO.absence}
                      />
                    )}
                    <ActionButton
                      src={"src/assets/arrow_down.svg"}
                      alt={"Toggle"}
                      disableText={true}
                      onClick={() =>
                        setSectionVisible((prev) => ({
                          ...prev,
                          payment: !prev.payment,
                        }))
                      }
                      className={`qv-section-toggle ${
                        sectionVisible.payment ? "rotated" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {sectionVisible.payment && (
              <div className="qv-summary-services-list flex-column width-90 mt-05 mb-05 align-self-center g-05 ">
                {visitDTO.payments.map((payment, index) => (
                  <div
                    key={index}
                    className="payment-item flex space-between align-items-center"
                  >
                    <DropdownSelect<DropdownItem>
                      items={paymentItems}
                      value={
                        visitDTO.payments[index].method
                          ? {
                              id: visitDTO.payments[index].method,
                              name: translatePaymentMethod(
                                visitDTO.payments[index].method
                              ),
                            }
                          : null
                      }
                      onChange={(val) => handlePaymentMethodChange(index, val)}
                      placeholder="Wybierz"
                      searchable={false}
                      multiple={false}
                      allowNew={false}
                      reversed={true}
                      className="quick-visit"
                    />
                    {visitDTO.payments[index].method ===
                      PaymentMethod.VOUCHER && (
                      <ActionButton
                        src={"src/assets/voucher.svg"}
                        alt={"Voucher"}
                        text={`${
                          visitDTO.payments[index].voucher != null
                            ? "Przypisano"
                            : "Przypisz"
                        }`}
                        onClick={() => {
                          setVoucherPaymentIndex(index);
                          setVoucherSelectionPopup(true);
                        }}
                        className={`pricelist qv voucher-select ${
                          visitDTO.payments[index].voucher != null
                            ? "green"
                            : "red"
                        }`}
                      />
                    )}
                    <div className="flex g-5px align-items-center mr-05">
                      <CostInput
                        onChange={(value) => handlePaymentAmount(index, value)}
                        className="visit-form"
                        selectedCost={visitDTO.payments[index].amount}
                      />
                      <span className="qv-span f10">zł</span>
                      <ActionButton
                        src="src/assets/cancel.svg"
                        alt="Usuń Płatność"
                        iconTitle={"Usuń Płatność"}
                        text="Usuń"
                        onClick={() => handlePaymentRemove(index)}
                        disableText={true}
                        className="remove-payment ml-5px"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        
      </div>
      <section className="qv-summary-confirm-section width-max align-self-center align-items-center justify-center flex-column">
        <div className="flex width-70 space-between mt-1 align-items-center">
          <div className="total-cost-display flex align-items-center justify-center g-1">
            <span className={`qv-span totals`}>Do zapłaty:</span>
            <span
              className={`qv-span totals`}
            >{`${visitPreview?.totalValue}zł`}</span>
          </div>
          <ActionButton
            src={"src/assets/tick.svg"}
            alt={"Zapisz"}
            text={"Zapisz"}
            onClick={handleVisitAction}
          />
        </div>
      </section>
      {variantsAddOnsPopupOpen && pendingService && (
        <ServiceVariantsPopup
          pendingService={pendingService}
          onClose={() => setVariantsAddOnsPopupOpen(false)}
          onSelect={handleVariantSelect}
        />
      )}
      {voucherSelectionPopup && (
        <AvailableVouchersPopup
          onClose={() => {
            setVoucherSelectionPopup(false);
            setVoucherPaymentIndex(null);
          }}
          className="visit-form"
          attachedVoucher={
            visitDTO.payments[voucherPaymentIndex!].voucher ?? null
          }
          onSave={(voucher) => {
            if (voucherPaymentIndex !== null) {
              handleAssignVoucher(voucherPaymentIndex, voucher);
            }
            setVoucherSelectionPopup(false);
            setVoucherPaymentIndex(null);
          }}
        />
      )}
    </>
  );
}

export default VisitForm;
