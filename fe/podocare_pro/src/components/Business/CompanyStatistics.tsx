import { useState, useCallback, useEffect, useMemo } from "react";
import { useAlert } from "../Alert/AlertProvider";
import {
  EmployeeRevenueFilter,
  ChartMode,
  CompanyStats,
  CompanyFinancialSummary,
} from "../../models/statistics";
import StatisticsService from "../../services/StatisticsService";
import { AlertType } from "../../models/alert";
import CompanyRevenueChart from "./CompanyRevenueChart";
import ComparisonBox from "./ComparisonBox";
import {
  getPreviousMonthYearByDate,
  getSameMonthPreviousYearByDate,
} from "../../utils/dateUtils";
import ToggleButton from "../ToggleButton";
import { expenseCategoryItems } from "../../models/expense";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";

export function CompanyStatistics() {
  const { showAlert } = useAlert();

  const [statRequest, setStatRequest] = useState<EmployeeRevenueFilter>({
    mode: ChartMode.DAILY,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [companyStats, setCompanyStats] = useState<CompanyStats | null>(null);
  const [companySummary, setCompanySummary] =
    useState<CompanyFinancialSummary | null>(null);
  const [statUnit, setStatUnit] = useState<"zł" | "%">("%");

  const fetchCompanyStats = useCallback(async () => {
    StatisticsService.getCompanyStats(statRequest)
      .then((data) => {
        setCompanyStats(data);
        console.log("stats:", data);
      })
      .catch((error) => {
        showAlert("Błąd!", AlertType.ERROR);
        console.error("Error fetching Company Stats: ", error);
      });
  }, [statRequest, showAlert]);

  const fetchCompanySummary = useCallback(async () => {
    StatisticsService.getCompanyFinancialSummary(statRequest)
      .then((data) => {
        setCompanySummary(data);
        console.log("summary:", data);
      })
      .catch((error) => {
        showAlert("Błąd!", AlertType.ERROR);
        console.error("Error fetching Company Financial Summary: ", error);
      });
  }, [statRequest, showAlert]);

  const handleToggleUnit = useCallback((val: boolean) => {
    setStatUnit(val ? "%" : "zł");
  }, []);

  useEffect(() => {
    fetchCompanyStats();
  }, [fetchCompanyStats]);

  useEffect(() => {
    fetchCompanySummary();
  }, [fetchCompanySummary]);

  const formatCurrency = (value: number) => {
    const roundedValue = Math.round(value);
    return roundedValue.toLocaleString("pl-PL") + " zł";
  };

  const revenueShareData = useMemo(() => {
    if (!companyStats) return [];
    return [
      {
        name: "Produkty",
        value: companyStats.productsRevenueShare,
        amount: companyStats.productsRevenue,
      },
      {
        name: "Usługi",
        value: companyStats.servicesRevenueShare,
        amount: companyStats.servicesRevenue,
      },
    ];
  }, [companyStats]);

  const REVENUE_COLORS = ["#4f6fff", "#c084fc"];

  const waterfallData = useMemo(() => {
    if (!companySummary) return [];
    return [
      {
        name: "Przychód",
        base: 0,
        value: companySummary.currentRevenue,
        gradient: "url(#revenueGrad)",
      },
      {
        name: "Koszty",
        base: companySummary.currentExpenses > 0 ? companySummary.currentIncome : 0,
        value: companySummary.currentExpenses > 0 ? companySummary.currentExpenses : 0,
        gradient: "url(#expenseGrad)",
      },
      {
        name: "Dochód",
        base: 0,
        value: companySummary.currentIncome,
        gradient: "url(#incomeGrad)",
      },
    ];
  }, [companySummary]);

  const expensesBarData = useMemo(() => {
    return expenseCategoryItems.map((category) => {
      const found = companyStats?.expensesByCategory?.find(
        (e) => e.category === category.id
      );
      return {
        name: category.name,
        category: category.id,
        value: found?.amount ?? 0,
        sharePercent: found?.sharePercent ?? 0,
        color: category.color,
      };
    });
  }, [companyStats]);

  const getDateForComparison = () =>
    new Date(statRequest.year!, statRequest.month! - 1, 1);

  return (
    <div className="company-statistics width-90 flex-column align-items-center mt-1">
      <section className="company-scoreboard width-max flex justify-center g-1 default">
        <div className="scoreboard-card revenue flex align-items-center">
          <div className="scoreboard-main f-1 align-items-center flex-column">
            <div className="scoreboard-header flex align-items-center g-5px mb-05 mr-025">
              <img
                src="src/assets/revenue.svg"
                alt=""
                className="scoreboard-icon"
              />
              <span className="scoreboard-label">Przychód</span>
            </div>
            <span className={`scoreboard-value ${companySummary ? "blue" : "no-data"}`}>
              {companySummary
                ? formatCurrency(companySummary.currentRevenue)
                : "---"}
            </span>
          </div>

          {statRequest.mode === ChartMode.DAILY && companySummary && (
            <div className="scoreboard-comparisons-side flex-column g-05">
              <ComparisonBox
                label={getPreviousMonthYearByDate(getDateForComparison())}
                percentage={companySummary.revenueChangeVsPrevPeriod}
                title="Porównanie do poprzedniego miesiąca"
              />
              <ComparisonBox
                label={getSameMonthPreviousYearByDate(getDateForComparison())}
                percentage={companySummary.revenueChangeVsLastYear}
                title="Porównanie do tego samego miesiąca poprzedniego roku"
              />
            </div>
          )}
        </div>

        <div className="scoreboard-card expenses flex align-items-center">
          <div className="scoreboard-main f-1 align-items-center flex-column">
            <div className="scoreboard-header flex align-items-center g-5px mb-05 mr-025">
              <img
                src="src/assets/expenses.svg"
                alt=""
                className="scoreboard-icon"
              />
              <span className="scoreboard-label">Koszty</span>
            </div>
            <span className={`scoreboard-value ${companySummary ? "red" : "no-data"}`}>
              {companySummary
                ? formatCurrency(companySummary.currentExpenses)
                : "---"}
            </span>
          </div>

          {statRequest.mode === ChartMode.DAILY && companySummary && (
            <div className="scoreboard-comparisons-side flex-column g-05">
              <ComparisonBox
                label={getPreviousMonthYearByDate(getDateForComparison())}
                percentage={companySummary.expensesChangeVsPrevPeriod}
                title="Porównanie do poprzedniego miesiąca"
              />
              <ComparisonBox
                label={getSameMonthPreviousYearByDate(getDateForComparison())}
                percentage={companySummary.expensesChangeVsLastYear}
                title="Porównanie do tego samego miesiąca poprzedniego roku"
              />
            </div>
          )}
        </div>

        <div
          className={`scoreboard-card income ${companySummary && companySummary.currentIncome <= 0 ? "neutral" : ""} flex align-items-center`}
        >
          <div className="scoreboard-main f-1 align-items-center flex-column">
            <div className="scoreboard-header flex align-items-center g-5px mb-05 mr-025">
              <img
                src="src/assets/income.svg"
                alt=""
                className="scoreboard-icon"
              />
              <span className="scoreboard-label">Dochód</span>
            </div>
            <span
              className={`scoreboard-value ${!companySummary ? "no-data" : companySummary.currentIncome <= 0 ? "neutral" : "green"}`}
            >
              {companySummary
                ? formatCurrency(companySummary.currentIncome)
                : "---"}
            </span>
          </div>

          {statRequest.mode === ChartMode.DAILY && companySummary && (
            <div className="scoreboard-comparisons-side flex-column g-05">
              <ComparisonBox
                label={getPreviousMonthYearByDate(getDateForComparison())}
                percentage={companySummary.incomeChangeVsPrevPeriod}
                title="Porównanie do poprzedniego miesiąca"
              />
              <ComparisonBox
                label={getSameMonthPreviousYearByDate(getDateForComparison())}
                percentage={companySummary.incomeChangeVsLastYear}
                title="Porównanie do tego samego miesiąca poprzedniego roku"
              />
            </div>
          )}
        </div>

        <div className="scoreboard-card profitability flex align-items-center">
          <div className="scoreboard-main f-1 align-items-center flex-column">
            <div className="gauge-container">
              <svg width="120" height="63" viewBox="0 0 120 63">
                <defs>
                  <linearGradient id="gaugeGradient" gradientUnits="userSpaceOnUse" x1="12" y1="58" x2="108" y2="58">
                    <stop offset="0%" stopColor="#ff0000" />
                    <stop offset="50%" stopColor="#ff8000" />
                    <stop offset="100%" stopColor="#00ff00" />
                  </linearGradient>
                  <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.3" />
                  </filter>
                </defs>
                {/* Left arc */}
                <path
                  d={(() => {
                    const cx = 60, cy = 58, r = 48;
                    const startAngle = 180;
                    const endAngle = 96;
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;
                    const x1 = cx + r * Math.cos(startRad);
                    const y1 = cy - r * Math.sin(startRad);
                    const x2 = cx + r * Math.cos(endRad);
                    const y2 = cy - r * Math.sin(endRad);
                    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
                  })()}
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  filter="url(#gaugeShadow)"
                />
                {/* Right arc */}
                <path
                  d={(() => {
                    const cx = 60, cy = 58, r = 48;
                    const startAngle = 84;
                    const endAngle = 0;
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;
                    const x1 = cx + r * Math.cos(startRad);
                    const y1 = cy - r * Math.sin(startRad);
                    const x2 = cx + r * Math.cos(endRad);
                    const y2 = cy - r * Math.sin(endRad);
                    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
                  })()}
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  filter="url(#gaugeShadow)"
                />
                {/* Indicator dot */}
                {(() => {
                  const profitability = companyStats?.profitabilityPercent ?? 0;
                  const clampedValue = Math.max(-100, Math.min(100, profitability));
                  const angle = 180 - ((clampedValue + 100) / 200) * 180;
                  const angleRad = (angle * Math.PI) / 180;
                  const cx = 60, cy = 58, r = 48;
                  const dotX = cx + r * Math.cos(angleRad);
                  const dotY = cy - r * Math.sin(angleRad);
                  return (
                    <circle
                      cx={dotX}
                      cy={dotY}
                      r="5"
                      fill="white"
                      filter="url(#gaugeShadow)"
                    />
                  );
                })()}
                {/* Center value text */}
                <text
                  x="60"
                  y="56"
                  textAnchor="middle"
                  className={`gauge-value-text ${
                    !companyStats ? "no-data" : (companyStats.profitabilityPercent ?? 0) >= 0 ? "positive" : "negative"
                  }`}
                >
                  {companyStats ? `${companyStats.profitabilityPercent}%` : "---"}
                </text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <section className="company-data-table width-max mt-05 flex-column">
        <div className="unit-toggle flex width-max align-items-center justify-end">
          <ToggleButton
            prefix={"zł"}
            suffix={"%"}
            className="mb-025"
            onChange={handleToggleUnit}
          />
        </div>
        {!companyStats && !companySummary ? (
          <div className="data-table-frame flex align-items-center justify-center">
            <span className="no-data-message">Brak danych</span>
          </div>
        ) : (
        <div className="data-table-frame flex align-items-center space-between">
          <section className="cmp-data-section width-33 flex align-items-center justify-center height-max">
            <div className="revenue-pie-chart flex align-items-center g-1">
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <defs>
                    <linearGradient id="navyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f6fff" />
                      <stop offset="100%" stopColor="#1e3a8a" />
                    </linearGradient>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c084fc" />
                      <stop offset="100%" stopColor="#7c3aed" />
                    </linearGradient>
                    <filter
                      id="dropShadow"
                      x="-20%"
                      y="-20%"
                      width="140%"
                      height="140%"
                    >
                      <feDropShadow
                        dx="0"
                        dy="2"
                        stdDeviation="3"
                        floodColor="#000"
                        floodOpacity="0.4"
                      />
                    </filter>
                  </defs>
                  <Pie
                    data={revenueShareData}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={56}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth={1}
                    filter="url(#dropShadow)"
                    startAngle={90}
                    endAngle={-270}
                    animationBegin={0}
                    animationDuration={800}
                    animationEasing="ease-out"
                  >
                    {revenueShareData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#${index === 0 ? "navyGrad" : "purpleGrad"})`}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const index = revenueShareData.findIndex(
                          (d) => d.name === data.name,
                        );
                        return (
                          <div className="pie-tooltip flex-column g-025">
                            <div className="flex g-5px align-items-center">
                              <span
                                className="pie-legend-color"
                                style={{
                                  backgroundColor: REVENUE_COLORS[index],
                                }}
                              />
                              <span className="pie-tooltip-label">
                                {data.name}
                              </span>
                            </div>
                            <span className="pie-tooltip-value">
                              {data.value}%
                            </span>
                            <span className="pie-tooltip-amount">
                              {data.amount} zł
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pie-legend flex-column g-05">
                {revenueShareData.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="pie-legend-item flex align-items-center g-05"
                  >
                    <span
                      className="pie-legend-color"
                      style={{ backgroundColor: REVENUE_COLORS[index] }}
                    />
                    <span className="pie-legend-label">{entry.name}</span>
                    <span className="pie-legend-value">
                      {statUnit === "%"
                        ? `${entry.value}%`
                        : `${entry.amount} zł`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="cmp-data-section expenses width-40 flex align-items-center justify-center height-max">
            <div className="expenses-bar-chart flex align-items-center g-1">
              <ResponsiveContainer width={240} height={140}>
                <BarChart
                  data={expensesBarData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                  barSize={22}
                >
                  <defs>
                    {expenseCategoryItems.map((cat, index) => (
                      <linearGradient
                        key={`expBarGrad-${index}`}
                        id={`expBarGrad-${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={`rgb(${cat.color})`}
                          stopOpacity={1}
                        />
                        <stop
                          offset="100%"
                          stopColor={`rgb(${cat.color})`}
                          stopOpacity={0.6}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <XAxis
                    dataKey="name"
                    hide
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 9 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                    tickLine={false}
                    tickCount={3}
                    tickFormatter={(value) =>
                      statUnit === "%"
                        ? `${value}%`
                        : value >= 100000
                          ? `${Math.round(value / 1000)}k`
                          : value >= 1000
                            ? `${(value / 1000).toFixed(1)}k`
                            : `${value}`
                    }
                    width={statUnit === "%" ? 40 : 45}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="pie-tooltip flex-column g-025">
                            <div className="flex g-5px align-items-center">
                              <span
                                className="pie-legend-color"
                                style={{ backgroundColor: `rgb(${data.color})` }}
                              />
                              <span className="pie-tooltip-label">{data.name}</span>
                            </div>
                            <span className="pie-tooltip-value">{data.sharePercent}%</span>
                            <span className="pie-tooltip-amount">{data.value} zł</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey={statUnit === "%" ? "sharePercent" : "value"}
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                  >
                    {expensesBarData.map((_, index) => (
                      <Cell key={`exp-bar-${index}`} fill={`url(#expBarGrad-${index})`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="pie-legend flex-column g-025">
                {expensesBarData.map((expense) => (
                  <div
                    key={expense.category}
                    className="pie-legend-item flex align-items-center g-05"
                  >
                    <span
                      className="pie-legend-color"
                      style={{
                        backgroundColor: `rgb(${expense.color})`,
                      }}
                    />
                    <span className="pie-legend-label">
                      {expense.name}
                    </span>
                    <span className="pie-legend-value">
                      {statUnit === "%"
                        ? `${expense.sharePercent}%`
                        : `${expense.value} zł`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="cmp-data-section width-33 flex align-items-center justify-center height-max">
            <div className="waterfall-chart flex align-items-center g-1">
              <ResponsiveContainer width={160} height={115}>
                <BarChart
                  data={waterfallData}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 0, bottom: 20 }}
                  barSize={10}
                >
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#53a0ff" />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ff0000" />
                      <stop offset="100%" stopColor="#8f0404" />
                    </linearGradient>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={companySummary && companySummary.currentIncome < 0 ? "#e5e7eb" : "#16a34a"} />
                      <stop offset="100%" stopColor={companySummary && companySummary.currentIncome < 0 ?  "#9ca3af": "#00fe00"} />
                    </linearGradient>
                  </defs>
                  <YAxis
                    dataKey="name"
                    type="category"
                    hide
                  />
                  <XAxis
                    type="number"
                    hide
                    domain={[0, "dataMax"]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0]?.payload;
                        if (!data) return null;
                        const isIncomeNegative = companySummary && companySummary.currentIncome < 0;
                        const colors: Record<string, string> = {
                          Przychód: "#53a0ff",
                          Koszty: "#ff0000",
                          Dochód: isIncomeNegative ? "#d1d5db" : "#00fe00",
                        };
                        const percentages: Record<string, string> = {
                          Przychód: "100%",
                          Koszty: `${companyStats?.costShareInRevenue ?? 0}%`,
                          Dochód: `${companyStats?.profitabilityPercent ?? 0}%`,
                        };
                        const getValueColor = (name: string) => {
                          if (name === "Dochód") return isIncomeNegative ? "#ff0000" : "#00fe00";
                          return "rgba(255,255,255,0.9)";
                        };
                        return (
                          <div className="pie-tooltip flex-column g-025">
                            <div className="flex g-5px align-items-center">
                              <span
                                className="pie-legend-color"
                                style={{ backgroundColor: colors[data.name] }}
                              />
                              <span className="pie-tooltip-label">{data.name}</span>
                            </div>
                            <span
                              className="pie-tooltip-value"
                              style={{ color: getValueColor(data.name) }}
                            >
                              {percentages[data.name]}
                            </span>
                            <span
                              className="pie-tooltip-amount"
                              style={{ color: getValueColor(data.name) }}
                            >
                              {Math.round(data.value).toLocaleString("pl-PL")} zł
                            </span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    x={0}
                    stroke="rgba(255,255,255,0.8)"
                    strokeWidth={1}
                    label={{
                      value: "0 zł",
                      position: "bottom",
                      fill: "rgba(255,255,255,0.7)",
                      fontSize: 9,
                      offset: 5,
                      fontFamily: "Outfit, sans-serif",
                    }}
                  />
                  <Bar dataKey="base" stackId="stack" fill="transparent" />
                  <Bar
                    dataKey="value"
                    stackId="stack"
                    radius={[0, 4, 4, 0]}
                    animationDuration={800}
                  >
                    {waterfallData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.gradient} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="pie-legend flex-column g-05">
                <div className="pie-legend-item flex align-items-center g-05">
                  <span
                    className="pie-legend-color"
                    style={{ backgroundColor: "#53a0ff" }}
                  />
                  <span className="pie-legend-label">Przychód</span>
                  <span className="pie-legend-value">
                    {companySummary
                      ? statUnit === "%"
                        ? "100%"
                        : `${Math.round(companySummary.currentRevenue).toLocaleString("pl-PL")} zł`
                      : "---"}
                  </span>
                </div>
                <div className="pie-legend-item flex align-items-center g-05">
                  <span
                    className="pie-legend-color"
                    style={{ backgroundColor: "#ff0000" }}
                  />
                  <span className="pie-legend-label">Koszty</span>
                  <span className="pie-legend-value">
                    {companySummary
                      ? statUnit === "%"
                        ? `${companyStats?.costShareInRevenue ?? 0}%`
                        : `${Math.round(companySummary.currentExpenses).toLocaleString("pl-PL")} zł`
                      : "---"}
                  </span>
                </div>
                <div className="pie-legend-item flex align-items-center g-05">
                  <span
                    className="pie-legend-color"
                    style={{
                      backgroundColor:
                        companySummary && companySummary.currentIncome < 0
                          ? "#d1d5db"
                          : "#00fe00",
                    }}
                  />
                  <span className="pie-legend-label">Dochód</span>
                  <span
                    className="pie-legend-value"
                    style={{
                      color:
                        companySummary && companySummary.currentIncome < 0
                          ? "#ff0000"
                          : "#00fe00",
                    }}
                  >
                    {companySummary
                      ? statUnit === "%"
                        ? `${companyStats?.profitabilityPercent ?? 0}%`
                        : `${Math.round(companySummary.currentIncome).toLocaleString("pl-PL")} zł`
                      : "---"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
        )}
      </section>

      <section className="company-chart width-max flex-column align-items-center mt-2">
        <CompanyRevenueChart
          statRequest={statRequest}
          setStatRequest={setStatRequest}
        />
      </section>
    </div>
  );
}

export default CompanyStatistics;
