import React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import OrderProductList from "./OrderProductList";
import DateInput from "../DateInput";
import CustomAlert from "../CustomAlert";
import OrderNewProductsPopup from "../Popups/OrderNewProductsPopup";
import ActionButton from "../ActionButton";
import OrderService from "../../services/OrderService";
import SupplierService from "../../services/SupplierService";
import { Alert, AlertType } from "../../models/alert";
import CostInput from "../CostInput";
import DropdownSelect from "../DropdownSelect";
import AddSupplierPopup from "../Popups/AddSupplierPopup";
import { NewSupplier, Supplier } from "../../models/supplier";
import { OrderProduct } from "../../models/order-product";
import { Order, NewOrder } from "../../models/order";
import { VAT_NUMERIC_VALUES } from "../../models/vatrate";
import { Action } from "../../models/action";
import {
  validateOrderForm,
  validateSupplierForm,
} from "../../utils/validators";
import { extractSupplierErrorMessage } from "../../utils/errorHandler";
import {
  convertToWorkingData,
  convertToBackendData,
  createNewOrderWorkingData,
  createNewOrderProductWorkingData,
  hasNonExistingProducts,
  OrderWorkingData,
  OrderProductWorkingData,
} from "../../models/working-data";

export interface OrderCreatorProps {
  setSelectedSupplier?: (supplier: Supplier | null) => void;
  selectedOrderProduct?: OrderProduct | null;
  setSelectedOrderProduct?: (orderProduct: OrderProduct | null) => void;
  setExpandedOrderIds?: (ids: number[]) => void;
  selectedOrder?: Order | null;
  onSuccess?: (message: string) => void;
  onReset?: () => void;
  hasWarning?: boolean;
  setHasWarning?: (hasWarning: boolean) => void;
  onClose?: () => void;
  className?: string;
}

export function OrderCreator({
  setSelectedSupplier,
  selectedOrderProduct,
  setSelectedOrderProduct,
  setExpandedOrderIds,
  selectedOrder,
  onSuccess,
  onReset,
  hasWarning = false,
  setHasWarning,
  onClose,
  className = "",
}: OrderCreatorProps) {
  const [alert, setAlert] = useState<Alert | null>(null);
  const [isOrderNewProductsPopupOpen, setIsOrderNewProductsPopupOpen] =
    useState<boolean>(false);
  const [nonExistingProducts, setNonExistingProducts] = useState<
    OrderProductWorkingData[]
  >([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orderWorkingData, setOrderWorkingData] = useState<OrderWorkingData>(
    () => {
      if (selectedOrder) {
        return convertToWorkingData.order(selectedOrder);
      }
      return createNewOrderWorkingData();
    }
  );

  useEffect(() => {}, [orderWorkingData, orderWorkingData.orderProducts]);

  const action = selectedOrder ? Action.EDIT : Action.CREATE;

  const showAlert = useCallback((message: string, variant: AlertType) => {
    setAlert({ message, variant });
    setTimeout(() => {
      setAlert(null);
    }, 3000);
  }, []);

  //orderProduct choice from OrderListBySupplier
  useEffect(() => {
    if (selectedOrderProduct && setSelectedOrderProduct) {
      const newOrderProductWorkingData: OrderProductWorkingData = {
        ...createNewOrderProductWorkingData(),
        originalOrderProduct: selectedOrderProduct,
        productName: selectedOrderProduct.product.name,
        product: selectedOrderProduct.product,
        quantity: 1,
        vatRate: selectedOrderProduct.vatRate,
        price: selectedOrderProduct.price,
      };

      setOrderWorkingData((prev) => ({
        ...prev,
        orderProducts: [...prev.orderProducts, newOrderProductWorkingData],
      }));

      setSelectedOrderProduct(null);
    }
  }, [selectedOrderProduct]);

  useEffect(() => {
    const totalNet = calculateOrderNetValue(
      orderWorkingData.shippingCost,
      orderWorkingData.orderProducts
    );
    const totalValue = calculateOrderTotal(
      orderWorkingData.shippingCost,
      orderWorkingData.orderProducts
    );
    const totalVat = totalValue - totalNet;

    setOrderWorkingData((prev) => ({
      ...prev,
      totalNet: Math.round(totalNet * 100) / 100,
      totalVat: Math.round(totalVat * 100) / 100,
      totalValue: Math.round(totalValue * 100) / 100,
    }));
  }, [orderWorkingData.shippingCost, orderWorkingData.orderProducts]);

  const fetchSuppliers = useCallback(async () => {
    SupplierService.getSuppliers()
      .then((data) => {
        const sortedSuppliers = data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setSuppliers(sortedSuppliers);
      })
      .catch((error) => {
        setSuppliers([]);
        console.error("Error fetching suppliers:", error);
      });
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const hasWarningRef = useRef(hasWarning);

  useEffect(() => {
    hasWarningRef.current = hasWarning;
  }, [hasWarning]);

  const handleAddNewSupplier = useCallback(
    async (newSupplier: NewSupplier) => {
      const error = validateSupplierForm(newSupplier, undefined, Action.CREATE);
      if (error) {
        showAlert(error, AlertType.ERROR);
        return null;
      }

      SupplierService.createSupplier(newSupplier)
        .then((data) => {
          setOrderWorkingData((prev) => ({
            ...prev,
            supplier: data,
          }));
          showAlert("Pomyślnie dodano nowy sklep!", AlertType.SUCCESS);
          fetchSuppliers();
        })
        .catch((error) => {
          console.error("Error creating new Supplier.", error);
          const errorMessage = extractSupplierErrorMessage(
            error,
            Action.CREATE
          );
          showAlert(errorMessage, AlertType.ERROR);
        });
    },
    [showAlert, fetchSuppliers]
  );

  const handleOnSelectSupplier = useCallback(
    (value: Supplier | Supplier[] | null): void => {
      const supplier = Array.isArray(value) ? value[0] || null : value;

      if (supplier) {
        setOrderWorkingData((prev) => ({
          ...prev,
          supplier: supplier,
        }));
      }

      if (
        action === Action.CREATE &&
        setExpandedOrderIds &&
        setSelectedSupplier
      ) {
        setExpandedOrderIds([]);
        setSelectedSupplier(supplier);
      }
    },
    [action, setExpandedOrderIds, setSelectedSupplier]
  );

  const handleOrderDateChange = useCallback((newDate: string | null) => {
    setOrderWorkingData((prev) => ({
      ...prev,
      orderDate: newDate || new Date().toISOString(),
    }));
  }, []);

  const handleAddNewProduct = useCallback(() => {
    const newOrderProduct = createNewOrderProductWorkingData();

    setOrderWorkingData((prev) => ({
      ...prev,
      orderProducts: [...prev.orderProducts, newOrderProduct],
    }));
  }, []);

  const handleOrderProductsChange = useCallback(
    (updatedOrderProducts: OrderProductWorkingData[]) => {
      setOrderWorkingData((prev) => ({
        ...prev,
        orderProducts: updatedOrderProducts,
      }));
    },
    []
  );

  const handleShippingCost = useCallback((shippingCost: number) => {
    setOrderWorkingData((prev) => ({
      ...prev,
      shippingCost: shippingCost,
    }));
  }, []);

  const calculateOrderTotal = (
    shippingCost: number,
    orderProducts: OrderProductWorkingData[]
  ) => {
    const productTotal = orderProducts.reduce(
      (acc, product) => acc + product.price * product.quantity,
      0
    );
    return productTotal + shippingCost;
  };

  const calculateOrderNetValue = (
    shippingCost: number,
    orderProducts: OrderProductWorkingData[]
  ) => {
    const netShippingCost = shippingCost / 1.23;
    const netTotal = orderProducts.reduce((acc, op) => {
      const vatRate = op.vatRate ? VAT_NUMERIC_VALUES[op.vatRate] : 0;
      return acc + (op.price * op.quantity) / (1 + vatRate / 100);
    }, 0);
    return netTotal + netShippingCost;
  };

  const handleCloseOrderNewProductPopup = useCallback(() => {
    setIsOrderNewProductsPopupOpen(false);
  }, []);

  const resetFormState = () => {
    setOrderWorkingData(createNewOrderWorkingData());
    setIsOrderNewProductsPopupOpen(false);
    /* setSelectedOrderProduct?.(null);
    setExpandedOrderIds?.([]);
    setSelectedSupplier?.(null); */
    onReset?.();
  };

  const handleSuccess = useCallback(
    (message: string) => {
      showAlert(message, AlertType.SUCCESS);
      resetFormState();
    },
    [showAlert]
  );

  const handleValidateOrder = useCallback(
    async (workingData: OrderWorkingData) => {
      const backendOrder = convertToBackendData.order(workingData);

      const error = validateOrderForm(
        backendOrder,
        action === Action.EDIT ? selectedOrder : undefined,
        action
      );
      if (error) {
        showAlert(error, AlertType.ERROR);
        return null;
      }

      const nonExisting: OrderProductWorkingData[] = hasNonExistingProducts(
        workingData.orderProducts
      );

      if (nonExisting.length > 0) {
        setNonExistingProducts(nonExisting);
        setIsOrderNewProductsPopupOpen(true);
        return;
      }

      finalizeOrder(workingData);
    },
    [showAlert, selectedOrder, action]
  );

  const finalizeOrder = useCallback(
    async (workingData: OrderWorkingData) => {
      try {
        const backendOrder = convertToBackendData.order(workingData);
        if (action === Action.CREATE) {
          const order: Order = await OrderService.createOrder(
            backendOrder as NewOrder
          );
          setIsOrderNewProductsPopupOpen(false);
          handleSuccess(`Zamówienie #${order.orderNumber} zostało utworzone!`);
        } else if (
          action === Action.EDIT &&
          selectedOrder &&
          "id" in selectedOrder
        ) {
            await OrderService.updateOrder(
              selectedOrder.id,
              backendOrder as Order
            );
            onSuccess?.(
              `Zamówienie #${selectedOrder.orderNumber} zostało zaktualizowane!`
            );
            setTimeout(() => {
              onClose?.();
            }, 3000);
        }
      } catch (error) {
        console.error(
          `Error ${action === Action.CREATE ? "creating" : "updating"} order:`,
          error
        );
        showAlert(
          `Błąd ${
            action === Action.CREATE ? "tworzenia" : "aktualizacji"
          } zamówienia.`,
          AlertType.ERROR
        );
      }
    },
    [action, handleSuccess, onClose, showAlert]
  );

  return (
    <div
      className={`order-display-container ${
        action === Action.EDIT ? "popup" : ""
      } ${className}`}
    >
      <div
        className={`order-display-interior ${
          action === Action.EDIT ? "popup" : ""
        }`}
      >
        {action === Action.CREATE && <h1>Nowe zamówienie</h1>}
        <section className="order-supplier-date-addProduct-section">
          <DropdownSelect<Supplier>
            items={suppliers}
            placeholder="Wybierz Sklep"
            onChange={handleOnSelectSupplier}
            value={orderWorkingData.supplier || null}
            multiple={false}
            showNewPopup={true}
            newItemComponent={AddSupplierPopup as React.ComponentType<any>}
            newItemProps={{
              onAddNew: handleAddNewSupplier,
            }}
          />
          <DateInput
            onChange={handleOrderDateChange}
            selectedDate={orderWorkingData.orderDate}
          />

          <ActionButton
            src={"src/assets/addNew.svg"}
            alt={"Dodaj Produkt"}
            text={"Dodaj produkt"}
            onClick={() => handleAddNewProduct()}
          />
        </section>
        <OrderProductList
          orderProducts={orderWorkingData.orderProducts}
          onOrderProductsChange={handleOrderProductsChange}
          action={action}
          setHasWarning={setHasWarning}
        />
        <div className="shipping-summary-section">
          <div className="order-shipping">
            <a>Koszt przesyłki:</a>
            <CostInput
              selectedCost={orderWorkingData.shippingCost ?? 0}
              onChange={handleShippingCost}
              placeholder={"0.00"}
            />
          </div>
          <div className="order-cost-summary">
            <a>Netto:</a>
            <a className="order-total-value">{orderWorkingData.totalNet} zł</a>
            <a>VAT:</a>
            <a className="order-total-value">{orderWorkingData.totalVat} zł</a>
            <a>Total:</a>
            <a className="order-total-value">
              {orderWorkingData.totalValue} zł
            </a>
          </div>
        </div>

        <div
          className={`order-confirm-button ${action.toString().toLowerCase()}`}
        >
          <ActionButton
            src={"src/assets/tick.svg"}
            alt={"Zapisz"}
            text={"Zapisz"}
            onClick={() => handleValidateOrder(orderWorkingData)}
          />
        </div>

        {alert && (
          <CustomAlert message={alert.message} variant={alert.variant} />
        )}
        {isOrderNewProductsPopupOpen && (
          <OrderNewProductsPopup
            nonExistingProducts={nonExistingProducts}
            orderWorkingData={orderWorkingData}
            onClose={handleCloseOrderNewProductPopup}
            onFinalizeOrder={handleValidateOrder}
          />
        )}
      </div>
    </div>
  );
}

export default OrderCreator;
