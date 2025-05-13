import React from "react";
import { useState, useEffect } from "react";
import OrderProductList from "./OrderProductList";
import DateInput from "../DateInput";
import CustomAlert from "../CustomAlert";
import OrderNewProductsPopup from "../Popups/OrderNewProductsPopup";
import ProductActionButton from "../ProductActionButton";
import OrderService from "../../service/OrderService";
import SupplierService from "../../service/SupplierService";

import CostInput from "../CostInput";
import DropdownSelect from "../DropdownSelect";
import AddSupplierPopup from "../Popups/AddSupplierPopup";

const OrderCreator = ({
  setSelectedSupplier,
  selectedOrderProduct,
  setSelectedOrderProduct,
  setExpandedOrderIds,
  selectedOrder,
  handleResetFiltersAndData,
  hasWarning,
  setHasWarning,
  onClose,
}) => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [isOrderNewProductsPopupOpen, setIsOrderNewProductsPopupOpen] =
    useState(false);
  const [nonExistingProducts, setNonExistingProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [orderData, setOrderData] = useState({
    id: selectedOrder?.id ?? null,
    supplierId: selectedOrder?.supplierId ?? null,
    orderNumber: selectedOrder?.orderNumber ?? null,
    orderDate: selectedOrder?.orderDate ?? new Date(),
    orderProductDTOList: selectedOrder?.orderProductDTOList ?? [],
    shippingVatRate: 23,
    shippingCost: selectedOrder?.shippingCost ?? 0,
    totalNet: selectedOrder?.totalNet ?? 0,
    totalVat: selectedOrder?.totalVat ?? 0,
    totalValue: selectedOrder?.totalValue ?? 0,
  });

  const action = selectedOrder ? "Edit" : "Create";

  const showAlert = (message, variant) => {
    if (variant === "success") {
      setSuccessMessage(message);
      setErrorMessage(null);
    } else {
      setErrorMessage(message);
      setSuccessMessage(null);
    }

    setAlertVisible(true);
    setTimeout(() => {
      setAlertVisible(false);
    }, 2500);
  };

  useEffect(() => {
    if (selectedOrderProduct) {
      setOrderData((prevOrderData) => ({
        ...prevOrderData,
        orderProductDTOList: [
          ...(prevOrderData.orderProductDTOList || []),
          {
            id: Date.now(),
            orderId: null,
            productId: selectedOrderProduct?.productId ?? null,
            productName: selectedOrderProduct?.productName ?? "",
            quantity: 1,
            vatRate: selectedOrderProduct?.vatRate ?? 8,
            price: selectedOrderProduct?.price ?? 0,
          },
        ],
      }));
      setSelectedOrderProduct(null);
    }
  }, [selectedOrderProduct]);

  useEffect(() => {
    const totalNet = calculateOrderNetValue(
      orderData.shippingCost,
      orderData.orderProductDTOList
    );
    const totalValue = calculateOrderTotal(
      orderData.shippingCost,
      orderData.orderProductDTOList
    );
    const totalVat = totalValue - totalNet;

    setOrderData((prev) => ({
      ...prev,
      totalNet: Math.round(totalNet * 100) / 100,
      totalVat: Math.round(totalVat * 100) / 100,
      totalValue: Math.round(totalValue * 100) / 100,
    }));
  }, [orderData.shippingCost, orderData.orderProductDTOList]);

  const fetchSuppliers = async () => {
    SupplierService.getSuppliers()
      .then((data) => {
        const sortedSuppliers = data.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        setSuppliers(sortedSuppliers);
        return sortedSuppliers;
      })
      .catch((error) => {
        setSuppliers([]);
        console.error("Error fetching suppliers:", error);
        return [];
      });
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAddNewSupplier = async (newSupplier) => {
    if (await checkForErrorsSupplier(newSupplier)) return false;

    SupplierService.createSupplier(newSupplier)
      .then((data) => {
        setOrderData((prev) => ({
          ...prev,
          supplierId: data.id,
        }));
        showAlert("Pomyślnie dodano nowy sklep!", "success");
        fetchSuppliers();
      })
      .catch((error) => {
        console.error("Error creating new Supplier.", error);
        showAlert("Błąd tworzenia sklepu.", "error");
      });
  };

  const handleOnSelectSupplier = (supplier) => {   
    setOrderData((prev) => ({
      ...prev,
      supplierId: supplier ? supplier.id : null,
    }));

    if (action === "Create") {
      setExpandedOrderIds([]);
      setSelectedSupplier(supplier);
    }
  };

  const checkForErrorsSupplier = async (supplierToCreate) => {
    if (!supplierToCreate.name) {
      showAlert("Nazwa sklepu nie może być pusta!", "error");
      return true;
    }

    if (supplierToCreate.name.trim().length <= 2) {
      showAlert("Nazwa sklepu za krótka! (2+)", "error");
      return true;
    }
    return false;
  };

  const handleOrderDateChange = (newDate) => {
    setOrderData((prev) => ({
      ...prev,
      orderDate: newDate,
    }));
  };

  const handleAddNewProduct = () => {
    setOrderData((prevOrderData) => ({
      ...prevOrderData,
      orderProductDTOList: [
        ...(prevOrderData.orderProductDTOList || []),
        {
          id: Date.now(),
          orderId: null,
          productId: null,
          productName: "",
          quantity: 1,
          vatRate: 8,
          price: 0,
        },
      ],
    }));
  };

  const handleOrderProductDTOListChange = (updatedList) => {
    setOrderData((prev) => ({
      ...prev,
      orderProductDTOList: updatedList,
    }));
  };

  const handleShippingCost = (shippingCost) => {
    setOrderData((prev) => ({
      ...prev,
      shippingCost: shippingCost,
    }));
  };

  const calculateOrderTotal = (shippingCost, orderProductDTOList) => {
    const productTotal = orderProductDTOList.reduce(
      (acc, product) => acc + (product.price * product.quantity || 0),
      0
    );
    return productTotal + shippingCost;
  };

  const calculateOrderNetValue = (shippingCost, orderProductDTOList) => {
    const optimizedVAT = (rate) => (rate === "zw" || rate === "np" ? 0 : rate);
    const netShippingCost = shippingCost / 1.23;
    const netTotal = orderProductDTOList.reduce(
      (acc, product) =>
        acc +
        ((product.price * product.quantity) /
          (1 + optimizedVAT(product.vatRate) / 100) || 0),
      0
    );
    return netTotal + netShippingCost;
  };

  const areOrderProductsEqual = (opList1, opList2) => {
    if (opList1.length != opList2.length) return false;

    const sorted1 = [...opList1].sort((a, b) => a.productId - b.productId);
    const sorted2 = [...opList2].sort((a, b) => a.productId - b.productId);

    return sorted1.every((op1, index) => {
      const op2 = sorted2[index];
      return (
        op1.productId === op2.productId &&
        op1.productName === op2.productName &&
        op1.productBrandName === op2.productBrandName &&
        op1.price === op2.price &&
        op1.quantity === op2.quantity &&
        op1.vatRate === op2.vatRate
      );
    });
  };

  const checkForErrorsOrder = async (orderData) => {
    if (!orderData.supplierId) {
      showAlert("Nie wybrano sklepu...", "error");
      return true;
    }

    if (orderData.orderProductDTOList.length === 0) {
      showAlert("Puste zamówienie... Dodaj produkty!", "error");
      return true;
    }

    if (
      orderData.orderProductDTOList.some(
        (product) => product.productName.trim() === ""
      )
    ) {
      showAlert("Niepoprawna nazwa produktu!", "error");
      return true;
    } else if (
      orderData.orderProductDTOList.some(
        (product) => product.productName.trim().length <= 2
      )
    ) {
      showAlert("Nazwa produktu za krótka! (2+)", "error");
      return true;
    }

    if (
      orderData.orderProductDTOList.some((product) => product.quantity == 0)
    ) {
      showAlert(
        action === "Edit"
          ? "Ilość = 0, usuń produkt!"
          : "Ilość produktów nie może wynosić 0!",
        "error"
      );
      return true;
    }

    if (action == "Edit") {
      const noOrderChangesDetected =
        orderData.supplierId === selectedOrder.supplierId &&
        new Date(orderData.orderDate).getTime() ===
          new Date(selectedOrder.orderDate).getTime() &&
        orderData.shippingCost === selectedOrder.shippingCost &&
        orderData.totalNet === selectedOrder.totalNet &&
        orderData.totalVat === selectedOrder.totalVat &&
        orderData.totalValue === selectedOrder.totalValue;

      const noOrderProductChangesDetected = areOrderProductsEqual(
        selectedOrder.orderProductDTOList,
        orderData.orderProductDTOList
      );

      if (noOrderChangesDetected && noOrderProductChangesDetected) {
        showAlert("Brak zmian!", "error");
        return true;
      }
    }

    return false;
  };

  const handleCloseOrderNewProductPopup = () => {
    setIsOrderNewProductsPopupOpen(false);
  };

  const createOrderRequestDTO = (orderData) => {
    return {
      ...orderData,
      orderProductDTOList: orderData.orderProductDTOList.map((product) => ({
        id: null,
        orderId: product.orderId,
        productId: product.productId,
        quantity: product.quantity,
        vatRate: product.vatRate,
        price: product.price,
      })),
    };
  };

  const resetFormState = () => {
    setOrderData({
      id: null,
      supplierId: null,
      orderNumber: null,
      orderDate: new Date(),
      orderProductDTOList: [],
      shippingVatRate: 23,
      shippingCost: 0,
      totalNet: 0,
      totalVat: 0,
      totalValue: 0,
    });
    setIsOrderNewProductsPopupOpen(false);
    setSelectedOrderProduct();
    setExpandedOrderIds([]);
    setSelectedSupplier(null);
  };

  const handleValidateOrder = async (orderData) => {
    if (await checkForErrorsOrder(orderData)) return;

    let nonExistingProducts = orderData.orderProductDTOList.filter(
      (product) => !product.productId
    );

    if (nonExistingProducts.length > 0) {
      setNonExistingProducts(nonExistingProducts);
      setIsOrderNewProductsPopupOpen(true);
      return;
    }
    const OrderRequestDTO = createOrderRequestDTO(orderData);
    finalizeOrder(OrderRequestDTO);
  };

  const finalizeOrder = async (OrderRequestDTO) => {
    if (action === "Create") {
      return OrderService.createOrder(OrderRequestDTO)
        .then((data) => {
          setIsOrderNewProductsPopupOpen(false);
          showAlert(
            `Zamówienie #${data.orderNumber} zostało utworzone!`,
            "success"
          );
          resetFormState();
        })
        .catch((error) => {
          console.error("Error finalizing Order.", error);
          showAlert("Error finalizing Order.", "error");
        });
    } else if (action === "Edit") {
      if (!hasWarning) {
        return OrderService.updateOrder(OrderRequestDTO)
          .then((data) => {
            setIsOrderNewProductsPopupOpen(false);
            const success = true;
            const mode = "Edit";
            handleResetFiltersAndData(success, mode);
            setTimeout(() => {
              onClose();
            }, 600);
          })
          .catch((error) => {
            console.error("Error updating Order.", error);
            showAlert("Błąd aktualizacji zamówienia.", "error");
            return false;
          });
      } else {
        showAlert("Konflikt stanu magazynowego!", "error");
      }
    }
  };

  return (
    <div
      className={`order-display-container ${action === "Edit" ? "popup" : ""}`}
    >
      <div
        className={`order-display-interior ${action === "Edit" ? "popup" : ""}`}
      >
        {action === "Create" && <h1>Nowe zamówienie</h1>}
        <section className="order-supplier-date-addProduct-section">
          <DropdownSelect
            items={suppliers}
            placeholder="Wybierz Sklep"
            onSelect={(selectedSupplier) =>
              handleOnSelectSupplier(selectedSupplier)
            }
            selectedItemId={orderData.supplierId}
            displayPopup={true}
            PopupComponent={AddSupplierPopup}
            popupProps={{
              onAddNew: (supplier) => handleAddNewSupplier(supplier),
            }}
          />
          <DateInput
            onChange={handleOrderDateChange}
            selectedDate={orderData.orderDate}
          />

          <ProductActionButton
            src={"src/assets/addNew.svg"}
            alt={"Dodaj Produkt"}
            text={"Dodaj produkt"}
            onClick={() => handleAddNewProduct()}
          />
        </section>
        <OrderProductList
          items={orderData.orderProductDTOList}
          onItemsChange={handleOrderProductDTOListChange}
          action={action}
          setHasWarning={setHasWarning}
        />
        <div className="shipping-summary-section">
          <div className="order-shipping">
            <a>Koszt przesyłki:</a>
            <CostInput
              selectedCost={orderData.shippingCost ?? 0}
              onChange={(value) => handleShippingCost(parseFloat(value) || 0)}
              placeholder={"0.00"}
            />
          </div>
          <div className="order-cost-summary">
            <a>Netto:</a>
            <a className="order-total-value">{orderData.totalNet} zł</a>
            <a>VAT:</a>
            <a className="order-total-value">{orderData.totalVat} zł</a>
            <a>Total:</a>
            <a className="order-total-value">{orderData.totalValue} zł</a>
          </div>
        </div>

        <div className={`order-confirm-button ${action.toLocaleLowerCase()}`}>
          <ProductActionButton
            src={"src/assets/tick.svg"}
            alt={"Zapisz"}
            text={"Zapisz"}
            onClick={() => handleValidateOrder(orderData)}
          />
        </div>

        {alertVisible && (
          <CustomAlert
            message={errorMessage || successMessage}
            variant={errorMessage ? "error" : "success"}
          />
        )}
        {isOrderNewProductsPopupOpen && (
          <OrderNewProductsPopup
            nonExistingProducts={nonExistingProducts}
            orderData={orderData}
            onClose={handleCloseOrderNewProductPopup}
            onFinalizeOrder={(updatedOrderRequestDTO) =>
              handleValidateOrder(updatedOrderRequestDTO)
            }
            action={"Create"}
          />
        )}
      </div>
    </div>
  );
};

export default OrderCreator;
