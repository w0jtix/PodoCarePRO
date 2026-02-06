import React from "react";
import ListHeader from "../ListHeader.js";
import OrderList from "./OrderList.jsx";
import { useState, useEffect, useCallback, useMemo } from "react";
import OrderService from "../../services/OrderService.jsx";
import ActionButton from "../ActionButton.jsx";
import DropdownSelect from "../DropdownSelect.js";
import DateInput from "../DateInput.js";
import SupplierService from "../../services/SupplierService.jsx";
import { Order, OrderFilterDTO } from "../../models/order.js";
import { Supplier } from "../../models/supplier.js";
import { Alert, AlertType } from "../../models/alert.js";
import { ORDER_HISTORY_ATTRIBUTES } from "../../constants/list-headers.js";
import { useAlert } from "../Alert/AlertProvider.js";
import { getYears, MONTHS } from "../../utils/dateUtils.js";

export function OrderHistory() {
  const { showAlert } = useAlert();
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<Supplier[]>([]);
  const [filter, setFilter] = useState<OrderFilterDTO>({
    supplierIds: null,
    month: null,
    year: new Date().getFullYear(),
  });
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const years = useMemo(() => getYears(), []);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
    const disabledMonthIds = useMemo(() => {
      if (filter.year !== currentYear) return [];
      return MONTHS.filter((m) => m.id > currentMonth).map((m) => m.id);
    }, [filter.year, currentYear, currentMonth]);

  const handleSuccess = useCallback(
    () => {
      handleResetFiltersAndData();
    },
    [showAlert]
  );

  const handleResetFiltersAndData = useCallback(() => {
    setFilter({
      supplierIds: null,
      month: null,
      year: new Date().getFullYear(),
    });
    setSelectedSuppliers([]);
    setPage(0);
    setHasMore(true);
  }, []);

  const fetchOrders = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    setLoading(true);
    OrderService.getOrders(filter, pageNum, 30)
      .then((data) => {
        const content = data?.content || [];

        if (append) {
          setOrders(prev => [...prev, ...content]);
        } else {
          setOrders(content);
        }


        setHasMore(!data.last);
        setPage(pageNum);
        setLoading(false);
      })
      .catch((error) => {
        if(!append) setOrders([]);
        setLoading(false);
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching Orders:", error);
      })
  }, [filter]);

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
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching suppliers:", error);
      });
  }, []);

  useEffect(() => {
    fetchOrders(0, false);
    setPage(0);
    setHasMore(true);
  }, [filter, fetchOrders]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleOnSelectSupplier = useCallback(
    (selected: Supplier | Supplier[] | null) => {
      if (selected) {
        const selectedSuppliers = Array.isArray(selected)
          ? selected
          : [selected];
        setSelectedSuppliers(selectedSuppliers);
      } else {
        setSelectedSuppliers([]);
      }
    },
    []
  );

  useEffect(() => {
    const supplierIds = selectedSuppliers.map((supplier) => supplier.id);

    setFilter((prev) => ({
      ...prev,
      supplierIds: supplierIds.length === 0 ? null : supplierIds,
    }));
  }, [selectedSuppliers]);

  const handleYearChange = useCallback(
    (
      selected:
        | { id: number; name: string }
        | { id: number; name: string }[]
        | null,
    ) => {
      const year = Array.isArray(selected) ? selected[0]?.id : selected?.id;
      setFilter((prev) => {
        let newMonth = prev.month;
        if (year === currentYear && prev.month && prev.month > currentMonth) {
          newMonth = currentMonth;
        }
        return {
          ...prev,
          year: year ?? prev.year,
          month: newMonth,
        };
      });
    },
    [currentYear, currentMonth],
  );
  const handleMonthChange = useCallback(
    (
      selected:
        | { id: number; name: string }
        | { id: number; name: string }[]
        | null,
    ) => {
      const month = Array.isArray(selected) ? selected[0]?.id : selected?.id;
      setFilter((prev) => ({
        ...prev,
        month: month ?? null,
      }));
    },
    [],
  );

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrolledToBottom = 
      target.scrollHeight - target.scrollTop <= target.clientHeight + 100; // 100px b4 end of the list

    if (scrolledToBottom && hasMore && !loading) {
      fetchOrders(page + 1, true);
    }
  }, [hasMore, loading, page, filter]);

  return (
    <>
      <section className="order-history-action-buttons width-80 flex align-self-center mt-1 mb-1 justify-center g-35">
        <DropdownSelect<Supplier>
          items={suppliers}
          value={selectedSuppliers}
          placeholder="Wybierz sklep"
          onChange={handleOnSelectSupplier}
          allowNew={false}
          multiple={true}
          allowColors={true}
          className="supplier-dropdown"
        />

        <section className="order-history-action-button-title flex g-15px">
          <DropdownSelect
                      items={years}
                      value={
                        filter.year
                          ? (years.find((y) => y.id === filter.year) ?? null)
                          : null
                      }
                      onChange={handleYearChange}
                      searchable={false}
                      allowNew={false}
                      placeholder="Rok"
                      className="expense-year"
                    />
        </section>
        <section className="order-history-action-button-title flex g-15px">
          <DropdownSelect
                      divided={true}
                      items={MONTHS}
                      value={
                        filter.month
                          ? (MONTHS.find((m) => m.id === filter.month) ?? null)
                          : null
                      }
                      onChange={handleMonthChange}
                      searchable={false}
                      allowNew={false}
                      placeholder="Miesiąc"
                      className="expense-month"
                      disabledItemIds={disabledMonthIds}
                    />
        </section>
        <ActionButton
          src={"src/assets/reset.svg"}
          alt={"Reset"}
          iconTitle={"Resetuj filtry"}
          text={"Reset"}
          onClick={handleResetFiltersAndData}
          disableText={true}
        />
      </section>
      <ListHeader attributes={ORDER_HISTORY_ATTRIBUTES} />
      {loading ? (
        <div className="list-loading-container relative flex align-items-center justify-center">
          <div className="loading-dot relative flex align-items-center height-max width-25"></div>
          <div className="loading-dot relative flex align-items-center height-max width-25"></div>
          <div className="loading-dot relative flex align-items-center height-max width-25"></div>
          <div className="loading-dot relative flex align-items-center height-max width-25"></div>
        </div>
      ) : (
        
          <OrderList
            attributes={ORDER_HISTORY_ATTRIBUTES}
            orders={orders}
            onSuccess={handleSuccess}
            className="products"
            onScroll={handleScroll}
            isLoading={loading}
            hasMore={hasMore}
          />
      )}
    </>
  );
}

export default OrderHistory;
