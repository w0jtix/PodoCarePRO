import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";
import ActionButton from "../ActionButton";
import { useState, useEffect, useCallback } from "react";
import NavigationBar from "../NavigationBar";
import ListHeader from "../ListHeader";
import { VISIT_LIST_ATTRIBUTES } from "../../constants/list-headers";
import { VisitFilterDTO, Visit } from "../../models/visit";
import VisitService from "../../services/VisitService";
import ClientService from "../../services/ClientService";
import { Client } from "../../models/client";
import VisitList from "./VisitList";
import DropdownSelect from "../DropdownSelect";
import DateInput from "../DateInput";
import { Employee } from "../../models/employee";
import EmployeeService from "../../services/EmployeeService";
import CostInput from "../CostInput";
import { PaymentStatus } from "../../models/payment";
import VisitPopup from "../Popups/VisitPopup";

export function VisitDashboard() {
  const { showAlert } = useAlert();
  const [resetTriggered, setResetTriggered] = useState<boolean>(false);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<Client[] | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[] | null>(
    null
  );
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<VisitFilterDTO>({
    clientIds: null,
    serviceIds: null,
    employeeIds: null,
    isBoost: null,
    isVip: null,
    delayed: null,
    absence: null,
    hasDiscount: null,
    hasSale: null,
    dateFrom: null,
    dateTo: null,
    paymentStatus: null,
    totalValueFrom: null,
    totalValueTo: null,
  });
  const [isAddNewVisitPopupOpen, setIsAddNewVisitPopupOpen] = useState<boolean>(false);

  const fetchVisits = async (pageNum: number = 0, append: boolean = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    VisitService.getVisits(filter, pageNum, 30)
      .then((data) => {
        const content = data?.content || [];
        
        if (append) {
          setVisits(prev => [...prev, ...content]);
        } else {
          setVisits(content);
        }

        setHasMore(!data.last);
        setPage(pageNum);
        setIsLoading(false);
      })
      .catch((error) => {
        if (!append) setVisits([]);
        setIsLoading(false);
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
      });
  };
  const fetchEmployees = async () => {
    EmployeeService.getAllEmployees()
      .then((data) => {
        setEmployees(data);
      })
      .catch((error) => {
        console.error("Error fetching Employees: ", error);
        showAlert("Błąd", AlertType.ERROR);
        setEmployees([]);
      });
  };

  const handleResetFiltersAndData = useCallback(() => {
    setFilter({
      clientIds: null,
      serviceIds: null,
      employeeIds: null,
      isBoost: null,
      isVip: null,
      delayed: null,
      absence: null,
      hasDiscount: null,
      hasSale: null,
      dateFrom: null,
      dateTo: null,
      paymentStatus: null,
      totalValueFrom: null,
      totalValueTo: null,
    });
    setSelectedClients(null);
    setSelectedEmployees(null);
    setPage(0);
    setHasMore(true);
  }, []);

  const handleClientsChange = useCallback(
    (clients: Client | Client[] | null) => {
      if (clients) {
        const selectedClients = Array.isArray(clients) ? clients : [clients];

        const clientIds = selectedClients.map((client) => client.id);

        setFilter((prev) => ({
          ...prev,
          clientIds: clientIds.length > 0 ? clientIds : null,
        }));
        setSelectedClients(selectedClients.length > 0 ? selectedClients : null);
      } else {
        setFilter((prev) => ({
          ...prev,
          clientIds: null,
        }));
        setSelectedClients(null);
      }
    },
    []
  );
  const handleEmployeesChange = useCallback(
    (employees: Employee | Employee[] | null) => {
      if (employees) {
        const selectedEmployees = Array.isArray(employees)
          ? employees
          : [employees];

        const employeeIds = selectedEmployees.map((employee) => employee.id);

        setFilter((prev) => ({
          ...prev,
          employeeIds: employeeIds.length > 0 ? employeeIds : null,
        }));
        setSelectedEmployees(
          selectedEmployees.length > 0 ? selectedEmployees : null
        );
      } else {
        setFilter((prev) => ({
          ...prev,
          employeeIds: null,
        }));
        setSelectedEmployees(null);
      }
    },
    []
  );

  const handleDateFromChange = useCallback(
    (newDateString: string | null) => {
      setFilter((prevFilter) => {
        if (newDateString && prevFilter.dateTo) {
          if (newDateString > prevFilter.dateTo) {
            showAlert(
              "Błędne daty:  Data od późniejsza niż Data do!",
              AlertType.ERROR
            );
            return prevFilter;
          }
        }
        return { ...prevFilter, dateFrom: newDateString };
      });
    },
    [showAlert]
  );
  const handleDateToChange = useCallback(
    (newDateString: string | null) => {
      setFilter((prevFilter) => {
        if (newDateString && prevFilter.dateFrom) {
          if (newDateString < prevFilter.dateFrom) {
            showAlert(
              "Błędne daty: Data do wcześniejsza niż Data od!",
              AlertType.ERROR
            );
            return prevFilter;
          }
        }
        return { ...prevFilter, dateTo: newDateString };
      });
    },
    [showAlert]
  );

  const handleValueFromChange = useCallback((valueFrom: number | null) => {
    setFilter((prevFilter) => {
      return {
        ...prevFilter,
        totalValueFrom: valueFrom === 0 ? null : valueFrom,
      };
    });
  }, []);

  const handleValueToChange = useCallback((valueTo: number | null) => {
    setFilter((prevFilter) => {
      return { ...prevFilter, totalValueTo: valueTo === 0 ? null : valueTo };
    });
  }, []);

  const toggleFilterPaymentStatus = useCallback(() => {
    setFilter((prev) => {
      let nextStatus: PaymentStatus | null = null;

      if (prev.paymentStatus === null) nextStatus = PaymentStatus.PAID;
      else if (prev.paymentStatus === PaymentStatus.PAID)
        nextStatus = PaymentStatus.PARTIAL;
      else if (prev.paymentStatus === PaymentStatus.PARTIAL)
        nextStatus = PaymentStatus.UNPAID;
      else nextStatus = null;

      return { ...prev, paymentStatus: nextStatus };
    });
  }, []);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const scrolledToBottom = 
      target.scrollHeight - target.scrollTop <= target.clientHeight + 100; // 100px b4 end of the list

    if (scrolledToBottom && hasMore && !isLoading) {
      fetchVisits(page + 1, true);
    }
  }, [hasMore, isLoading, page, filter]);

  useEffect(() => {
    fetchVisits(0, false);
    setPage(0);
    setHasMore(true);
  }, [filter]);

  useEffect(() => {
    fetchVisits(0, false);
    fetchClients();
    fetchEmployees();
  }, []);

  return (
    <div className="dashboard-panel width-85 height-max flex-column align-items-center">
      <NavigationBar
        showSearchbar={false}
        resetTriggered={resetTriggered}
        replaceSearchbar={true}
      >
        <ActionButton
            src={"src/assets/addNew.svg"}
            alt={"Nowa Wizyta"}
            text={"Nowa Wizyta"}           
            onClick={() => setIsAddNewVisitPopupOpen(true)}
          />
      </NavigationBar>
      <section className="products-action-buttons visits width-80 flex align-self-center space-between mt-1 mb-1">
        <section className="visit-filters width-fit-content flex-column g-05">
          <div className="flex g-05 align-items-center">
            <span className="qv-span visit-list">Pracownik:</span>
            <DropdownSelect<Employee>
              items={employees}
              onChange={handleEmployeesChange}
              value={selectedEmployees}
              placeholder="Nie wybrano"
              searchable={false}
              multiple={true}
              allowNew={false}
              className="visit-list"
            />
          </div>
          <div className="flex g-05 align-items-center">
            <span className="qv-span  visit-list">Klienci:</span>
            <DropdownSelect<Client>
              items={clients}
              onChange={handleClientsChange}
              value={selectedClients}
              allowNew={false}
              multiple={true}
              getItemLabel={(c) => `${c.firstName} ${c.lastName}`}
              className="clients visit-list"
              placeholder="Nie wybrano"
            />
          </div>
        </section>

        <section className="visit-filters width-fit-content flex-column g-05">
          <div className="flex g-05 align-items-center">
            <span className="qv-span visit-list">Data od:</span>
            <DateInput
              onChange={handleDateFromChange}
              selectedDate={filter.dateFrom || null}
              showPlaceholder={true}
            />
          </div>
          <div className="flex g-05 align-items-center">
            <span className="qv-span visit-list">Data do:</span>
            <DateInput
              onChange={handleDateToChange}
              selectedDate={filter.dateTo || null}
              showPlaceholder={true}
            />
          </div>
        </section>

        <section className="visit-filters width-fit-content flex-column g-05">
          <div className="flex g-05 align-items-center">
            <span className="qv-span visit-list">Wartość od:</span>
            <CostInput
              onChange={handleValueFromChange}
              selectedCost={filter.totalValueFrom ?? 0}
              className="thin"
            />
          </div>
          <div className="flex g-05 align-items-center">
            <span className="qv-span visit-list">Wartość do:</span>
            <CostInput
              onChange={handleValueToChange}
              selectedCost={filter.totalValueTo ?? 0}
              className="thin"
            />
          </div>
        </section>
        <ActionButton
          src={"src/assets/reset.svg"}
          alt={"Reset"}
          iconTitle={"Resetuj filtry"}
          text={"Reset"}
          onClick={handleResetFiltersAndData}
          disableText={true}
          className="vf-button"
        />
      </section>
      <section className="visit-filters width-90 flex space-between mb-1">
        <ActionButton
          src={"src/assets/filter_icon.svg"}
          alt={"Status"}
          text={`Status: ${
            filter.paymentStatus === null
              ? "wszystkie"
              : filter.paymentStatus === PaymentStatus.PAID
              ? "opłacone"
              : filter.paymentStatus === PaymentStatus.PARTIAL
              ? "częściowo"
              : "nieopłacone"
          }`}
          onClick={toggleFilterPaymentStatus}
          className={`v-f-width ${
            filter.paymentStatus === null
              ? "wszystkie"
              : filter.paymentStatus === PaymentStatus.PAID
              ? "paid"
              : filter.paymentStatus === PaymentStatus.PARTIAL
              ? "partial"
              : "unpaid"
          }`}
        />

        <ActionButton
          src={"src/assets/absence.svg"}
          alt={"Nieobecnosć"}
          text={"Nieobecnosć"}
          onClick={() =>
            setFilter((prev) => ({
              ...prev,
              absence: prev.absence === true ? null : true,
            }))
          }
          className={`${filter.absence ? "active-r" : ""}`}
        />
        <ActionButton
          src={"src/assets/time.svg"}
          alt={"Spóźnienie"}
          text={"Spóźnienie"}
          onClick={() =>
            setFilter((prev) => ({
              ...prev,
              delayed: prev.delayed === true ? null : true,
            }))
          }
          className={`${filter.delayed ? "active-y" : ""}`}
        />
        <ActionButton
          src={"src/assets/boost.svg"}
          alt={"Boost"}
          text={"Boost"}
          onClick={() =>
            setFilter((prev) => ({
              ...prev,
              isBoost: prev.isBoost === true ? null : true,
            }))
          }
          className={`${filter.isBoost ? "active-p" : ""}`}
        />
        <ActionButton
          src={"src/assets/vip.svg"}
          alt={"Wizyta VIP"}
          text={"Wizyta VIP"}
          onClick={() =>
            setFilter((prev) => ({
              ...prev,
              isVip: prev.isVip === true ? null : true,
            }))
          }
          className={`${filter.isVip ? "active-b" : ""}`}
        />
        <ActionButton
          src={"src/assets/client_discount.svg"}
          alt={"Ze Zniżką"}
          text={"Ze Zniżką"}
          onClick={() =>
            setFilter((prev) => ({
              ...prev,
              hasDiscount: prev.hasDiscount === true ? null : true,
            }))
          }
          className={`${filter.hasDiscount ? "active-g" : ""}`}
        />
        <ActionButton
          src={"src/assets/sale.svg"}
          alt={"Sprzedaż Produktów"}
          text={"Sprzedaż Produktów"}
          onClick={() =>
            setFilter((prev) => ({
              ...prev,
              hasSale: prev.hasSale === true ? null : true,
            }))
          }
          className={`${filter.hasSale ? "active-pink" : ""}`}
        />
      </section>
      <ListHeader attributes={VISIT_LIST_ATTRIBUTES} />
      <VisitList
        attributes={VISIT_LIST_ATTRIBUTES}
        visits={visits}
        className="products visits"
        onScroll={handleScroll}
        isLoading={isLoading}
        hasMore={hasMore}
        handleResetFiltersAndData={handleResetFiltersAndData}
      />
      {isAddNewVisitPopupOpen && (
        <VisitPopup
          onClose={() => {
            setIsAddNewVisitPopupOpen(false);
          fetchVisits(0, false);
          }}
        />
      )}
    </div>
  );
}

export default VisitDashboard;
