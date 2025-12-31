import React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import OrderProductList from "./OrderProductList";
import DateInput from "../DateInput";
import OrderNewProductsPopup from "../Popups/OrderNewProductsPopup";
import ActionButton from "../ActionButton";
import OrderService from "../../services/OrderService";
import SupplierService from "../../services/SupplierService";
import { Alert, AlertType } from "../../models/alert";
import CostInput from "../CostInput";
import DropdownSelect from "../DropdownSelect";
import AddSupplierPopup from "../Popups/AddSupplierPopup";
import { NewSupplier, Supplier } from "../../models/supplier";
import { NewOrderProduct, OrderProduct } from "../../models/order-product";
import { Order, NewOrder } from "../../models/order";
import { VAT_NUMERIC_VALUES, VatRate } from "../../models/vatrate";
import { Action } from "../../models/action";
import {
  validateOrderForm,
  validateSupplierForm,
} from "../../utils/validators";
import { extractSupplierErrorMessage } from "../../utils/errorHandler";
import { useAlert } from "../Alert/AlertProvider";

export interface OrderCreatorProps {
  setSelectedSupplier?: (supplier: Supplier | null) => void;
  selectedOrderProduct?: OrderProduct | null;
  setExpandedOrderIds?: (ids: number[]) => void;
  selectedOrder?: Order | null;
  onSuccess?: () => void;
  onReset?: () => void;
  onClose?: () => void;
  className?: string;
  onConflictDetected?: (productName: string, add: boolean) => void;
}

export function OrderCreator({
  setSelectedSupplier,
  selectedOrderProduct,
  setExpandedOrderIds,
  selectedOrder,
  onSuccess,
  onReset,
  onClose,
  className = "",
  onConflictDetected
}: OrderCreatorProps) {
  const { showAlert } = useAlert();
  const [isOrderNewProductsPopupOpen, setIsOrderNewProductsPopupOpen] =
    useState<boolean>(false);
  const [nonExistingProducts, setNonExistingProducts] = useState<NewOrderProduct[]>([]);
  const action = selectedOrder ? Action.EDIT : Action.CREATE;

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orderDTO, setOrderDTO] = useState<NewOrder> ({
    supplier: null,
    orderDate:  new Date().toISOString().split("T")[0],
    orderProducts:[],
    shippingCost: 0,
  });
  const [orderProducts, setOrderProducts] =useState<NewOrderProduct[]>([]);
  const [orderPreview, setOrderPreview] = useState<Order | null>(null);

  const fetchSuppliers = async () => {
      SupplierService.getSuppliers()
        .then((data) => {
          const sortedSuppliers = data.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setSuppliers(sortedSuppliers);
        })
        .catch((error) => {
          setSuppliers([]);
          showAlert("Błąd", AlertType.ERROR);
          console.error("Error fetching suppliers:", error);
        });
  };
  const fetchOrderPreview = async (orderDTO: NewOrder) => {
      OrderService.getOrderPreview(orderDTO)
        .then((data) => {
          setOrderPreview(data);
        })
        .catch((error) => {
          console.error("Error fetching order preview: ", error);
          showAlert("Błąd", AlertType.ERROR);
        })

  }

  const handleOnSelectSupplier = useCallback(
    (value: Supplier | Supplier[] | null): void => {
      const supplier = Array.isArray(value) ? value[0] || null : value;

      if (supplier) {
        setOrderDTO((prev) => ({
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
  const handleAddNewSupplier = useCallback(
    async (newSupplier: NewSupplier) => {
      const error = validateSupplierForm(newSupplier, undefined, Action.CREATE);
      if (error) {
        showAlert(error, AlertType.ERROR);
        return null;
      }

      SupplierService.createSupplier(newSupplier)
        .then((data) => {
          setOrderDTO((prev) => ({
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
    [showAlert]
  );
  const handleOrderDateChange = useCallback((newDate: string | null) => {
    setOrderDTO((prev) => ({
      ...prev,
      orderDate: newDate || new Date().toISOString(),
    }));
  }, []);
  const handleAddNewProduct = useCallback((selectedOrderProduct: OrderProduct | null) => {
    const newOrderProduct: NewOrderProduct = selectedOrderProduct != null ? {
      product: selectedOrderProduct.product,
      name: selectedOrderProduct.name,
      quantity: selectedOrderProduct.quantity,
      vatRate: selectedOrderProduct.vatRate,
      price: selectedOrderProduct.price
    } : {
      product: null,
      name: "",
      quantity: 1,
      vatRate: VatRate.VAT_23,
      price: 0,
    };

    setOrderProducts((prev) => [...prev, newOrderProduct]);
  }, []);
  const handleShippingCost = useCallback((shippingCost: number) => {
    setOrderDTO((prev) => ({
      ...prev,
      shippingCost: shippingCost,
    }));
  }, []);

  const resetFormState = () => {
    setOrderDTO({
    supplier: null,
    orderDate:  new Date().toISOString().split("T")[0],
    orderProducts:[],
    shippingCost: 0,
  });
    setIsOrderNewProductsPopupOpen(false);
    onReset?.();
    setNonExistingProducts([]);
    setOrderProducts([]);
    setOrderPreview(null);
  };

  const handleValidateOrder = useCallback(
    async (orderDTO: NewOrder) => {

      const error = validateOrderForm(
        orderDTO,
        action === Action.EDIT ? selectedOrder : undefined,
        action
      );
      if (error) {
        showAlert(error, AlertType.ERROR);
        return null;
      }

      const nonExisting: NewOrderProduct[] = (orderDTO.orderProducts && orderDTO.orderProducts.length > 0) ? orderDTO.orderProducts?.filter(op => !op.product) : [];

      if (nonExisting.length > 0) {
        setNonExistingProducts(nonExisting);
        setIsOrderNewProductsPopupOpen(true);
        return;
      }

      finalizeOrder(orderDTO);
    },
    [showAlert, selectedOrder, action]
  );

  const finalizeOrder = useCallback(
    async (orderDTO: NewOrder) => {
      try {
        if (action === Action.CREATE) {
          OrderService.createOrder(orderDTO)
            .then((data) => {
              showAlert(`Zamówienie #${data.orderNumber} zostało utworzone!`, AlertType.SUCCESS);
              setIsOrderNewProductsPopupOpen(false);
              resetFormState();
            })
          
        } else if (
          action === Action.EDIT &&
          selectedOrder &&
          "id" in selectedOrder
        ) {
          OrderService.updateOrder(selectedOrder.id, orderDTO)
          .then((data) => {
              showAlert(`Zamówienie #${data.orderNumber} zostało zaktualizowane!`, AlertType.SUCCESS);
              onSuccess?.();
          })            
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
    [action, onClose, showAlert]);

  useEffect(() => {
    if(selectedOrder) {
      setOrderDTO({
        supplier: selectedOrder.supplier,
        orderDate: selectedOrder.orderDate,
        orderProducts: selectedOrder.orderProducts,
        shippingCost: selectedOrder.shippingCost,
      })
      setOrderProducts(selectedOrder.orderProducts);
    }
  }, [selectedOrder])

  useEffect(() => {
    if(selectedOrderProduct != null) {
      handleAddNewProduct(selectedOrderProduct);
    }
  },[selectedOrderProduct])

  useEffect(() => {
    setOrderDTO((prev) => ({
      ...prev,
      orderProducts: orderProducts,
    }))
  }, [orderProducts])

  useEffect(() => {
    fetchOrderPreview(orderDTO);
  }, [orderDTO])

  useEffect(() => {
    fetchSuppliers();
  }, [])

  return (
    <div
      className={`order-display-container align-self-center relative ${
        action === Action.EDIT ? "popup" : ""
      } ${className}`}
    >
      <div
        className={`order-display-interior grid g-10px relative ${
          action === Action.EDIT ? "popup" : ""
        }`}
      >
        {action === Action.CREATE && <h1>Nowe zamówienie</h1>}
        <section className="order-supplier-date-addProduct-section flex space-evenly relative align-center">
          <DropdownSelect<Supplier>
            items={suppliers}
            className="supplier-dropdown"
            placeholder="Wybierz Sklep"
            onChange={handleOnSelectSupplier}
            value={orderDTO.supplier}
            multiple={false}
            showNewPopup={true}
            newItemComponent={AddSupplierPopup as React.ComponentType<any>}
            newItemProps={{
              onAddNew: handleAddNewSupplier,
            }}
          />
          <DateInput
            onChange={handleOrderDateChange}
            selectedDate={orderDTO.orderDate}
          />

          <ActionButton
            src={"src/assets/addNew.svg"}
            alt={"Dodaj Produkt"}
            text={"Dodaj produkt"}
            onClick={() => handleAddNewProduct(null)}
          />
        </section>
        <OrderProductList
          action={action}
          onConflictDetected={onConflictDetected}



          orderProducts={orderProducts}
          setOrderProducts={setOrderProducts}
        />
        
        <div className="shipping-summary-section flex-column relative">
          <div className="order-shipping relative flex space-between align-items-center">
            <a>Koszt przesyłki:</a>
            <CostInput
              selectedCost={orderDTO.shippingCost ?? 0}
              onChange={handleShippingCost}
              placeholder={"0.00"}
            />
          </div>
          <div className="order-cost-summary relative flex space-between align-items-center justify-end">
            <a>Netto:</a>
            <a className="order-total-value">{orderPreview?.totalNet ?? 0} zł</a>
            <a>VAT:</a>
            <a className="order-total-value">{orderPreview?.totalVat ?? 0} zł</a>
            <a>Total:</a>
            <a className="order-total-value">
              {orderPreview?.totalValue ?? 0} zł
            </a>
          </div>
        </div>

        <div
          className={`order-confirm-button flex align-self-center justify-self-end ${action.toString().toLowerCase()}`}
        >
          <ActionButton
            src={"src/assets/tick.svg"}
            alt={"Zapisz"}
            text={"Zapisz"}
            onClick={() => handleValidateOrder(orderDTO)}
          />
        </div>

        {isOrderNewProductsPopupOpen && (
          <OrderNewProductsPopup
            nonExistingProducts={nonExistingProducts}
            orderDTO={orderDTO}
            onClose={() => setIsOrderNewProductsPopupOpen(false)}
            onFinalizeOrder={handleValidateOrder}
          />
        )}
      </div>
    </div>
  );
}

export default OrderCreator;
