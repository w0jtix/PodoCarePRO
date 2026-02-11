import { useState, useRef, useCallback, useEffect } from "react";
import { useAlert } from "../Alert/AlertProvider";
import ProgressBar from "../ProgressBar";
import {MONTHS} from "../../utils/dateUtils";
import ActionButton from "../ActionButton";
import EmployeeRevenueChart from "./EmployeeRevenueChart";
import { EmployeeRevenueFilter, ChartMode, EmployeeStats } from "../../models/statistics";
import StatisticsService from "../../services/StatisticsService";
import { AlertType } from "../../models/alert";
import { CARD_BACKGROUND_COLORS, CHART_COLORS } from "../../utils/statisticsUtils";

export function EmployeesStats() {
  const { showAlert } = useAlert();
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);
  const [visibleView, setVisibleView] = useState<{ [key: number]: 'first' | 'second' }>({});
  const scrollContainerRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const scrollButtonRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const [statRequest, setStatRequest] = useState<EmployeeRevenueFilter>({
      mode: ChartMode.DAILY,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats[]>([]);


  const fetchEmployeeStats = useCallback(async () => {
    StatisticsService.getEmployeeStats(statRequest)
      .then((data) => {
        setEmployeeStats(data);
        setSelectedEmployeeIds(data.map((employee) => employee.id));
      })
      .catch((error) => {
        showAlert("Błąd!", AlertType.ERROR);
        console.error("Error fetching Employee Stats: ", error);
      })
  }, [statRequest,showAlert]);

  const getCardDateDisplay = () => {
    if(statRequest.mode ===ChartMode.MONTHLY) {
      return statRequest.year ? statRequest.year.toString() : "";
    }
    else {
      return statRequest.month ? MONTHS[statRequest.month-1].name + " " + (statRequest.year ? statRequest.year.toString() : "") : "";
    }
  }

  useEffect(() => {
      fetchEmployeeStats();
    }, [fetchEmployeeStats]);



  return (
    <>
      <section className="chart-employees width-90 flex-column align-items-center mt-2">
        <EmployeeRevenueChart 
          selectedEmployeeIds={selectedEmployeeIds.length > 0 ? selectedEmployeeIds : undefined} 
          statRequest={statRequest}
          setStatRequest={setStatRequest}
        />
      </section>
      <section
        className={`employee-stat-section width-90 flex ${
          employeeStats.length == 1 ? "justify-center" : "space-between"
        } mt-1`}
      >
        {employeeStats.map((employee, index) => {
          const isSelected = selectedEmployeeIds.includes(employee.id);
          const chartColor = CHART_COLORS[(employee.id -1) % CHART_COLORS.length];
          const backgroundColor = CARD_BACKGROUND_COLORS[(employee.id -1) % CARD_BACKGROUND_COLORS.length];
          return (
          <div
            className={`employee-stat-card flex-column width-${
              employeeStats.length == 2
                ? 45
                : employeeStats.length == 3
                ? 30
                : 90
            } ${isSelected ? "selected" : ""}`}
            key={employee.id}
            style={isSelected ? {
              borderColor: chartColor,
              backgroundColor: `${backgroundColor}`
            } : undefined}          
          >
            
            <div 
              className="emp-card-header flex space-between pointer"
              onClick={() =>
                setSelectedEmployeeIds((prev) =>
                  prev.includes(employee.id)
                    ? prev.filter((id) => id !== employee.id)
                    : [...prev, employee.id]
                )
              }
            >
              <div className="empl-header flex g-15 align-items-center">
                <div className="empl-avatar-div">
                  <img
                    src={`src/assets/avatars/${employee.avatar ?? `avatar1.png`}`}
                    alt="Avatar"
                    className="empl-avatar height-max width-max"
                  />
                </div>
                <h2 className="empl-header-name">{employee.name}</h2>
              </div>
              <span className="card-date mr-1 mt-05">{getCardDateDisplay()}</span>
            </div>
            <div
              ref={(el) => (scrollContainerRefs.current[employee.id] = el)}
              className="emp-card-scroll-container f-1"
            >
              <div className="empl-stat-card-body first width-90 flex-column align-items-center justify-self-center g-1 mt-05 ">
                <section className="width-max flex-column g-075 align-items-center default">
                  <div className="width-90 flex">
                    <div className="flex width-max space-between">
                      <span className="stat-span">Nowi klienci:</span>
                      <span className={`stat-span ${employee.newClients > 0 ? "green" : "white"}`}>
                        {"+ " + employee.newClients}
                      </span>
                    </div>
                  </div>

                  <div className="width-90 flex">
                    <div className="flex width-max space-between">
                      <span className="stat-span">Konwersja klienta:</span>
                      <span className={`stat-span white`}>
                        {employee.clientsSecondVisitConversion + "%"}
                      </span>
                    </div>
                  </div>

                  <div className=" width-90 flex">
                    <div className="flex width-max space-between">
                      <span className="stat-span">Czas pracy z klientem:</span>
                      <span className="stat-span white">
                        {employee.hoursWithClients + "/ " + employee.availableHours + "h" }
                      </span>
                    </div>
                  </div>
                </section>

                <section className="width-max flex-column g-075 align-items-center default">
                  <div className="width-max flex-column g-5px">
                    <div className="flex width-max space-between">
                      <span className="stat-span">Utarg:</span>
                      <span className="stat-span white">
                        {employee.servicesRevenue} zł
                      </span>
                    </div>
                    <ProgressBar
                      current={employee.servicesRevenue}
                      goal={employee.servicesRevenueGoal}
                    />
                  </div>
                  <div className="width-max flex-column g-5px">
                    <div className="flex width-max space-between">
                      <span className="stat-span">Sprzedaż:</span>
                      <span className="stat-span white">
                        {employee.productsRevenue} zł
                      </span>
                    </div>
                    <ProgressBar
                      current={employee.productsRevenue}
                      goal={employee.productsRevenueGoal}
                    />
                  </div>
                  <div className="width-max flex-column g-5px">
                    <div className="flex width-max space-between">
                      <span className="stat-span">Przychód:</span>
                      <span className={`stat-span ${employee.totalRevenue > 0 ? "green f13" : ""}`}>
                        {employee.totalRevenue} zł
                      </span>
                    </div>
                    <ProgressBar
                      current={employee.totalRevenue}
                      goal={employee.totalRevenueGoal}
                      gradient={"linear-gradient(to right, #000000, #12e412)"}
                    />
                  </div>
                </section>
              </div>

              <div ref={(el) => (scrollButtonRefs.current[employee.id] = el)}>
                <ActionButton
                  src="src/assets/arrow_down.svg"
                  alt={visibleView[employee.id] === 'second' ? "Scroll Up" : "Scroll Down"}
                  onClick={(e) => {
                    e.stopPropagation();
                    const container = scrollContainerRefs.current[employee.id];
                    const button = scrollButtonRefs.current[employee.id];
                    const isSecond = visibleView[employee.id] === 'second';
                    container?.scrollTo({
                      top: isSecond ? 0 : button?.offsetTop || 0,
                      behavior: 'smooth'
                    });
                    setVisibleView(prev => ({ ...prev, [employee.id]: isSecond ? 'first' : 'second' }));
                  }}
                  disableText={true}
                  className={`emp-stats-scroll ${visibleView[employee.id] === 'second' ? 'up' : 'down'}`}
                />
              </div>

              <div className="empl-stat-card-body last width-90 flex-column align-items-center justify-self-center g-15  ">
                <section className="width-max flex-column g-1 align-items-center default">
                  <div className="width-90 flex">
                    <div className="flex width-max space-between">
                      
                      <div className="flex align-items-center g-5px">
                      <img src="src/assets/uslugi_blue.svg" alt="Services Sold" className="visit-form-icon"></img>
                      <span className="stat-span">Zrealizowane usługi:</span>
                      </div>
                      <span className="stat-span white">
                        {employee.servicesDone}
                      </span>
                    </div>
                  </div>

                  <div className=" width-90 flex">
                    <div className="flex width-max space-between">
                      
                      <div className="flex align-items-center g-5px">
                      <img src="src/assets/product_sold.svg" alt="Products Sold" className="visit-form-icon"></img>
                      <span className="stat-span">Sprzedane produkty:</span>
                      </div>
                      <span className="stat-span white">
                        {employee.productsSold}
                      </span>
                    </div>
                  </div>

                  <div className=" width-90 flex">
                    <div className="flex width-max space-between">
                      <div className="flex align-items-center g-5px">
                      <img src="src/assets/voucher.svg" alt="Vouchers Sold" className="visit-form-icon"></img>
                      <span className="stat-span">Sprzedane vouchery:</span>
                      </div>
                      <span className="stat-span white">
                        {employee.vouchersSold}
                      </span>
                    </div>
                  </div>

                  <div className=" width-90 flex">
                    <div className="flex width-max space-between">
                      <div className="flex align-items-center g-5px">
                      <img src="src/assets/crown.svg" alt="Best Selling Service" className="visit-form-icon"></img>
                      <span className="stat-span">Usługa:</span>
                      </div>
                      <span className="stat-span white text-ellipsis" title={employee.topSellingServiceName}>{employee.topSellingServiceName}</span>
                    </div>
                  </div>

                  <div className=" width-90 flex">
                    <div className="flex width-max space-between">
                      <div className="flex align-items-center g-5px">
                      <img src="src/assets/crown.svg" alt="Best Selling Product" className="visit-form-icon"></img>
                      
                      <span className="stat-span">Produkt:</span>
                      </div>
                      <span className="stat-span white text-ellipsis" title={employee.topSellingProductName}>{employee.topSellingProductName}</span>
                    </div>
                  </div>

                  <div className=" width-90 flex">
                    <div className="flex width-max space-between">
                      <div className="flex align-items-center g-5px">
                      <img src="src/assets/boost.svg" alt="Boost" className="visit-form-icon"></img>
                      <span className="stat-span">Nowi klienci Boost:</span>
                      </div>
                      <span className="stat-span white">
                        {"+" + employee.newBoostClients}
                      </span>
                    </div>
                  </div>

                  <div className=" width-90 flex">
                    <div className="flex width-max space-between">
                      
                      <div className="flex align-items-center g-5px">
                      <img src="src/assets/boost.svg" alt="Boost" className="visit-form-icon"></img>
                      <span className="stat-span">Konwersja klienta Boost:</span>
                      </div>
                      <span className="stat-span white">
                        {employee.boostClientsSecondVisitConversion + "%"}
                      </span>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          </div>
        )})}
      </section>
    </>
  );
}

export default EmployeesStats;
