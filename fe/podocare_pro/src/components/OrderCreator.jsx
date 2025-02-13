import React from "react";
import { useState, useEffect } from "react";
import OrderProductList from "./OrderProductList";
import DateInput from "./DateInput";
import SupplierDropdown from "./SupplierDropdown";
import CustomAlert from "./CustomAlert";
import OrderNewProductsPopup from "./OrderNewProductsPopup";
import axios from "axios";
import OrderService from "../service/OrderService";
import AllProductService from "../service/AllProductService";
import SupplierService from "../service/SupplierService";

const OrderCreator = ({
  selectedSupplier,
  setSelectedSupplier,
  selectedOrderProduct,
  setSelectedOrderProduct,
  setExpandedOrderIds
}) => {
  const [orderProductDTOList, setOrderProductDTOList] = useState([]);
  const [shippingCost, setShippingCost] = useState(0);
  const [orderDate, setOrderDate] = useState("");
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

  const fetchSuppliers = () => {
    SupplierService.getAllSuppliers()
    .then((response) => {
      setSuppliers(response.data);
    })
    .catch((error) => {
      setSuppliers([]);
      console.error("Error fetching suppliers:", error);
    });
    console.log("Supp", suppliers)
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const getOrderProductCategoryAndDetails = (orderProduct) => {
    if (orderProduct.saleProduct) {
      return { category: "saleProduct", product: orderProduct.saleProduct };
    } else if (orderProduct.toolProduct) {
      return { category: "toolProduct", product: orderProduct.toolProduct };
    } else if (orderProduct.equipmentProduct) {
      return {
        category: "equipmentProduct",
        product: orderProduct.equipmentProduct,
      };
    }
    return { category: "Unknown", product: null };
  };

  useEffect(() => {
    if (selectedOrderProduct) {
      const { category, product } =
        getOrderProductCategoryAndDetails(selectedOrderProduct);
      setOrderProductDTOList((prevList) => [
        ...prevList,
        {
          id: Date.now(),
          productName: product ? product.productName : "",
          price: selectedOrderProduct.price,
          quantity: 1,
          VATrate: selectedOrderProduct.vatrate,
          orderPrice: selectedOrderProduct.price,
        },
      ]);
    }
    setSelectedOrderProduct(null);
  }, [selectedOrderProduct]);

  const handleAddSupplier = (newSupplier) => {
    setSuppliers((prevSuppliers) => [...prevSuppliers, newSupplier]);
    setSelectedSupplier(newSupplier);
  };

  const handleOnSelectSupplier = (supplier) => {
    setSelectedSupplier(supplier);
  };

  const handleOrderProductDTOListChange = (updatedList) => {
    setOrderProductDTOList(updatedList);
  };

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

  const handleValidateOrder = async () => {
    if (checkForErrors()) return;

    return AllProductService.validateProducts(orderProductDTOList)
      .then((response) => {
        const { existingProducts, nonExistingProducts } = response.data;
        const updatedOrderProductList = orderProductDTOList.map((product) => {
          const existingProduct = existingProducts.find(
            (p) =>
              p.productName === product.productName &&
              p.quantity === product.quantity &&
              p.VATRate == product.VATRate &&
              p.price == product.price
          );
          return existingProduct ? existingProduct : product;
        });

        setOrderProductDTOList(updatedOrderProductList);

        if (response.data.nonExistingProducts.length > 0) {
          const uniqueNonExistingProducts = Array.from(
            new Set(nonExistingProducts.map((p) => p.productName))
          ).map((productName) =>
            nonExistingProducts.find((p) => p.productName === productName)
          );

          setNonExistingProducts(uniqueNonExistingProducts);
          isOrderNewProductsPopupOpen
            ? showAlert("Coś poszło nie tak...", "error")
            : setIsOrderNewProductsPopupOpen(true);
        } else {
          finalizeOrder(updatedOrderProductList);
        }
      })
      .catch((error) => {
        console.error("Error validating orderProducts.", error);
        showAlert("Error validating orderProducts.", "error");
      });
  };

  const resetFormState = () => {
    setOrderProductDTOList([]);
    setShippingCost(0);
    setOrderDate(new Date());
    setSelectedSupplier(null);
    setNonExistingProducts([]);
    setIsOrderNewProductsPopupOpen(false);
    setSelectedOrderProduct();
    setExpandedOrderIds([]);
  };

  return (
    <div className="order-display-container">
      <div className="order-display-interior">
        <h1>Nowe zamówienie</h1>
        <section className="order-supplier-date-addProduct-section">
          <SupplierDropdown
            items={suppliers}
            placeholder="Wybierz Sklep"
            selectedSupplier={selectedSupplier}
            onSelect={handleOnSelectSupplier}
            onAddSupplier={handleAddSupplier}
          />
          <DateInput onChange={handleOrderDateChange} />
          <button
            className="order-add-new-product-button"
            onClick={handleAddNewProduct}
          >
            <img
              src="src/assets/addNew.svg"
              alt="add new"
              className="order-add-new-icon"
            />
            <a>Dodaj produkt</a>
          </button>
        </section>
        <OrderProductList
          items={orderProductDTOList}
          onItemsChange={handleOrderProductDTOListChange}
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
              {calculateOrderNetValue(
                shippingCost,
                orderProductDTOList
              ).toFixed(2)}{" "}
              zł
            </a>
            <a>VAT:</a>
            <a className="order-total-value">
              {(
                calculateOrderTotal(shippingCost, orderProductDTOList) -
                calculateOrderNetValue(shippingCost, orderProductDTOList)
              ).toFixed(2)}{" "}
              zł
            </a>
            <a>Total:</a>
            <a className="order-total-value">
              {calculateOrderTotal(shippingCost, orderProductDTOList).toFixed(
                2
              )}{" "}
              zł
            </a>
          </div>
        </div>
        <button className="order-confirm-button" onClick={handleValidateOrder}>
          <img
            src="src/assets/tick.svg"
            alt="tick"
            className="order-tick-icon"
          />
          <a>Zapisz</a>
        </button>
        {alertVisible && (
          <CustomAlert
            message={errorMessage || successMessage}
            variant={errorMessage ? "error" : "success"}
          />
        )}
        {isOrderNewProductsPopupOpen && (
          <OrderNewProductsPopup
            nonExistingProducts={nonExistingProducts}
            onClose={handleCloseOrderNewProductPopup}
            onFinalizeOrder={handleValidateOrder}
          />
        )}
      </div>
    </div>
  );
};

export default OrderCreator;
