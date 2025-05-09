import React from "react";
import { useState, useEffect } from "react";
import OrderProductList from "./OrderProductList";
import DateInput from "../DateInput";
import SupplierDropdown from "../SupplierDropdown";
import CustomAlert from "../CustomAlert";
import OrderNewProductsPopup from "../Popups/OrderNewProductsPopup";
import ProductActionButton from "../ProductActionButton";
import OrderService from "../../service/OrderService";
import SupplierService from "../../service/SupplierService";

const OrderCreator = ({
  selectedSupplier,
  setSelectedSupplier,
  selectedOrderProduct,
  setSelectedOrderProduct,
  setExpandedOrderIds,
  action,
  selectedOrder,
  setOrderDTO,
  setHasWarning,
}) => {
  const [initialOrderProductList, setInitialOrderProductList] = useState([]);
  const [orderProductDTOList, setOrderProductDTOList] = useState([]);
  const [currentOrderProductList, setCurrentOrderProductList] = useState([]);
  const [orderProductListChanges, setOrderProductListChanges] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [orderDate, setOrderDate] = useState(new Date());
  const [suppliers, setSuppliers] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [nonExistingProducts, setNonExistingProducts] = useState([]);
  const [isOrderNewProductsPopupOpen, setIsOrderNewProductsPopupOpen] =
    useState(false);

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

  const fetchSuppliers = async () => {
    SupplierService.getAllSuppliers()
      .then((response) => {
        const sortedSuppliers = response.data.sort((a, b) =>
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

  useEffect(() => {
    if (selectedOrder) {
      setOrderProductDTOList(selectedOrder.orderProductDTOList);
      setOrderDate(new Date(selectedOrder.orderDate));
      setShippingCost(selectedOrder.shippingCost);
      handleOnSelectSupplier(
        suppliers.find(
          (supplier) => supplier.id === selectedOrder.supplierId
        ) || null
      );
      const fetchedOrderProductList = selectedOrder.orderProductDTOList.map(
        (item) => ({
          id: item.orderProductId ?? item.id,
          productId: item.productId,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          VATrate: item.VATrate,
          orderPrice: item.price * item.quantity,
        })
      );
      setInitialOrderProductList(fetchedOrderProductList);
    }
  }, [selectedOrder, suppliers]);

  useEffect(() => {
    if (action === "Create") {
      if (selectedOrderProduct) {
        setOrderProductDTOList((prevList) => [
          ...prevList,
          {
            id: Date.now(),
            productName: selectedOrderProduct.productName,
            price: selectedOrderProduct.price,
            quantity: 1,
            VATrate: selectedOrderProduct.VATrate,
            orderPrice: selectedOrderProduct.price,
          },
        ]);
      }
      setSelectedOrderProduct(null);
    }
  }, [selectedOrderProduct]);

  const handleAddSupplier = async (newSupplier) => {
    await fetchSuppliers();
    setSelectedSupplier(newSupplier);
  };

  const handleOnSelectSupplier = (supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleOrderProductDTOListChange = (updatedList) => {
    if (action === "Create") {
      setOrderProductDTOList(updatedList);
    } else if (action === "Edit") {
      setOrderProductListChanges(updatedList);
    }
  };

  const getOrderChanges = (initial, edited) => {
    if (!initial || !edited) return {};

    const orderChanges = {};
    Object.keys(edited).forEach((key) => {
      if (JSON.stringify(edited[key]) !== JSON.stringify(initial[key])) {
        orderChanges[key] = edited[key];
      }
    });
    if (Object.keys(orderChanges).length > 0) {
      orderChanges["orderId"] = initial.orderId;
    }
    return orderChanges;
  };

  useEffect(() => {
    let orderDTO = {};
    if (action === "Edit" && selectedSupplier) {
      const initialOrder = {
        orderId: selectedOrder.orderId,
        orderDate: new Date(selectedOrder.orderDate),
        supplierId: selectedOrder.supplierId,
        shippingCost: selectedOrder.shippingCost,
        removedOrderProducts: [],
        addedOrderProducts: [],
        editedOrderProducts: [],
        orderProductDTOList: initialOrderProductList,
      };
      const editedOrder = {
        orderId: selectedOrder.orderId,
        orderDate: orderDate,
        supplierId: selectedSupplier.id,
        shippingCost: shippingCost,
        removedOrderProducts: orderProductListChanges.removedOrderProducts,
        addedOrderProducts: orderProductListChanges.addedOrderProducts,
        editedOrderProducts: orderProductListChanges.editedOrderProducts,
        orderProductDTOList: currentOrderProductList,
      };
      orderDTO = getOrderChanges(initialOrder, editedOrder);
      if (orderDTO.shippingCost && !orderDTO.orderProductDTOList) {
        orderDTO = { ...orderDTO, orderProductDTOList };
      }
      setOrderDTO(orderDTO);
    }
  }, [orderProductListChanges, selectedSupplier, orderDate, shippingCost]);

  const handleOrderDateChange = (newDate) => {
    setOrderDate(newDate);
  };

  const handleAddNewProduct = () => {
    setOrderProductDTOList((prevList) => [
      ...prevList,
      {
        id: Date.now(),
        productName: "",
        price: 0,
        quantity: 1,
        VATrate: 8,
        orderPrice: 0,
      },
    ]);
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
          (1 + optimizedVAT(product.VATrate) / 100) || 0),
      0
    );
    return netTotal + netShippingCost;
  };

  const finalizeOrder = async (updatedOrderProductList) => {
    const OrderDTO = {
      orderProductDTOList: updatedOrderProductList,
      shippingCost: shippingCost,
      //shippingVatRate hardcoded value - 23 on BE.
      orderDate: orderDate,
      supplierId: selectedSupplier.id,
    };
    return OrderService.createNewOrder(OrderDTO)
      .then((response) => {
        setIsOrderNewProductsPopupOpen(false);
        showAlert(
          `Zamówienie #${response.data.orderNumber} zostało utworzone!`,
          "success"
        );
        resetFormState();
      })
      .catch((error) => {
        console.error("Error finalizing Order.", error);
        showAlert("Error finalizing Order.", "error");
      });
  };

  const handleCloseOrderNewProductPopup = () => {
    setIsOrderNewProductsPopupOpen(false);
  };

  const checkForErrors = () => {
    if (!selectedSupplier) {
      showAlert("Nie wybrano sklepu...", "error");
      return true;
    }

    if (orderProductDTOList.length === 0) {
      showAlert("Puste zamówienie... Dodaj produkty!", "error");
      return true;
    }

    if (
      orderProductDTOList.some((product) => product.productName.trim() === "")
    ) {
      showAlert("Niepoprawna nazwa produktu!", "error");
      return true;
    } else if (
      orderProductDTOList.some(
        (product) => product.productName.trim().length <= 2
      )
    ) {
      showAlert("Nazwa produktu za krótka! (2+)", "error");
      return true;
    }
    return false;
  };

  const handleValidateOrder = async (orderProductDTOList) => {
    if (checkForErrors()) return;
    let nonExistingProducts = orderProductDTOList.filter(
      (product) => !product.productId
    );

    if (nonExistingProducts.length > 0) {
      setNonExistingProducts(nonExistingProducts);
      setIsOrderNewProductsPopupOpen(true);
      return;
    }
    finalizeOrder(orderProductDTOList);
  };

  const resetFormState = () => {
    if (action === "Create") {
      setOrderProductDTOList([]);
      setShippingCost(0);
      setOrderDate(new Date());
      setSelectedSupplier(null);
      setNonExistingProducts([]);
      setIsOrderNewProductsPopupOpen(false);
      setSelectedOrderProduct();
      setExpandedOrderIds([]);
    }
  };

  return (
    <div
      className={`order-display-container ${action === "Edit" ? "popup" : ""}`}
    >
      <div className={`order-display-interior ${action === "Edit" ? "popup" : ""}`}>
        {action === "Create" && <h1>Nowe zamówienie</h1>}
        <section className="order-supplier-date-addProduct-section">
          <SupplierDropdown
            items={suppliers}
            placeholder="Wybierz Sklep"
            selectedSupplier={selectedSupplier}
            onSelect={handleOnSelectSupplier}
            onAddSupplier={handleAddSupplier}
          />
          <DateInput
            onChange={handleOrderDateChange}
            selectedDate={orderDate}
          />

          <ProductActionButton
            src={"src/assets/addNew.svg"}
            alt={"Dodaj Produkt"}
            text={"Dodaj produkt"}
            onClick={() => handleAddNewProduct()}
          />
        </section>
        <OrderProductList
          items={orderProductDTOList}
          setItems={setOrderProductDTOList}
          onItemsChange={handleOrderProductDTOListChange}
          action={action}
          initialOrderProductList={initialOrderProductList}
          setCurrentOrderProductList={setCurrentOrderProductList}
          setHasWarning={setHasWarning}
        />
        <div className="shipping-summary-section">
          <div className="order-shipping">
            <a>Koszt przesyłki:</a>
            <input
              type="number"
              className="shipping-cost-input"
              value={shippingCost}
              onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div className="order-cost-summary">
            <a>Netto:</a>
            <a className="order-total-value">
              {action === "Edit"
                ? calculateOrderNetValue(
                    shippingCost,
                    currentOrderProductList
                  ).toFixed(2)
                : calculateOrderNetValue(
                    shippingCost,
                    orderProductDTOList
                  ).toFixed(2)}{" "}
              zł
            </a>
            <a>VAT:</a>
            <a className="order-total-value">
              {action === "Edit"
                ? (
                    calculateOrderTotal(shippingCost, currentOrderProductList) -
                    calculateOrderNetValue(
                      shippingCost,
                      currentOrderProductList
                    )
                  ).toFixed(2)
                : (
                    calculateOrderTotal(shippingCost, orderProductDTOList) -
                    calculateOrderNetValue(shippingCost, orderProductDTOList)
                  ).toFixed(2)}{" "}
              zł
            </a>
            <a>Total:</a>
            <a className="order-total-value">
              {action === "Edit"
                ? calculateOrderTotal(
                    shippingCost,
                    currentOrderProductList
                  ).toFixed(2)
                : calculateOrderTotal(
                    shippingCost,
                    orderProductDTOList
                  ).toFixed(2)}{" "}
              zł
            </a>
          </div>
        </div>
        {action === "Create" && (
          <div className="order-confirm-button">
            <ProductActionButton
              src={"src/assets/tick.svg"}
              alt={"Zapisz"}
              text={"Zapisz"}
              onClick={() => handleValidateOrder(orderProductDTOList)}
            />
          </div>
        )}
        {alertVisible && (
          <CustomAlert
            message={errorMessage || successMessage}
            variant={errorMessage ? "error" : "success"}
          />
        )}
        {isOrderNewProductsPopupOpen && (
          <OrderNewProductsPopup
            nonExistingProducts={nonExistingProducts}
            orderProductDTOList={orderProductDTOList}
            setOrderProductDTOList={setOrderProductDTOList}
            onClose={handleCloseOrderNewProductPopup}
            onFinalizeOrder={(list) => handleValidateOrder(list)}
            action={"Create"}
          />
        )}
      </div>
    </div>
  );
};

export default OrderCreator;
