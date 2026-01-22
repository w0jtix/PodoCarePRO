import { useState, useEffect, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ChartMode,
  FrontendEmployeeRevenueSeries,
  ChartDataPoint,
  EmployeeRevenueFilter,
  chartModeItems,
} from "../../models/statistics";
import DropdownSelect from "../DropdownSelect";
import { MONTHS, getYears } from "../../utils/dateUtils";
import { processEmployeeRevenueResponse } from "../../utils/statisticsUtils";
import ChartTooltip from "./ChartTooltip";
import ActionButton from "../ActionButton";
import StatisticsService from "../../services/StatisticsService";
import { useAlert } from "../Alert/AlertProvider";
import { AlertType } from "../../models/alert";

export interface EmployeeRevenueChartProps {
  selectedEmployeeIds?: number[];
  statRequest: EmployeeRevenueFilter;
  setStatRequest: React.Dispatch<React.SetStateAction<EmployeeRevenueFilter>>;
}

type ChartType = "line" | "bar";

export function EmployeeRevenueChart({
  selectedEmployeeIds,
  statRequest,
  setStatRequest,
}: EmployeeRevenueChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [series, setSeries] = useState<FrontendEmployeeRevenueSeries[]>([]);
  const [chartType, setChartType] = useState<ChartType>("line");
  const [isCumulative, setIsCumulative] = useState(true);
  const [loading, setLoading] = useState(false);

  const { showAlert } = useAlert();
  const years = useMemo(() => getYears(), []);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const disabledMonthIds = useMemo(() => {
    if (statRequest.year !== currentYear) return [];
    return MONTHS.filter(m => m.id > currentMonth).map(m => m.id);
  }, [statRequest.year, currentYear, currentMonth]);

  const fetchEmployeeRevenues = useCallback(() => {
    setLoading(true);
    StatisticsService.getEmployeeRevenue(statRequest)
      .then((backendData) => {
        console.log(backendData)
        let filteredData = backendData;
        if (selectedEmployeeIds && selectedEmployeeIds.length > 0) {
          filteredData = {
            ...backendData,
            series: backendData.series.filter((s) =>
              selectedEmployeeIds.includes(s.employeeId)
            ),
          };
        }

        const { chartData, series } = processEmployeeRevenueResponse(filteredData, statRequest);
        setChartData(chartData);
        setSeries(series);
      })
      .catch((error) => {
        showAlert("Błąd!", AlertType.ERROR);
        console.error("Error fetching Employee Revenue Statistics: ", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [statRequest, selectedEmployeeIds, showAlert]);

  useEffect(() => {
    fetchEmployeeRevenues();
  }, [fetchEmployeeRevenues]);

  const handleYearChange = useCallback((selected:
        | { id: number; name: string }
        | { id: number; name: string }[]
        | null
    ) => {
      const year = Array.isArray(selected) ? selected[0]?.id : selected?.id;
      setStatRequest((prev) => {
        let newMonth = prev.month;
        if (year === currentYear && prev.month && prev.month > currentMonth) {
          newMonth = currentMonth;
        }
        return {
          ...prev,
          year: year ?? null,
          month: newMonth,
        };
      });
    },
    [currentYear, currentMonth]
  );
  const handleMonthChange = useCallback((selected:
        | { id: number; name: string }
        | { id: number; name: string }[]
        | null
    ) => {
      const month = Array.isArray(selected) ? selected[0]?.id : selected?.id;
      setStatRequest((prev) => ({
        ...prev,
        month: month ?? null,
      }));
    },
    []
  );
  const handleChartModeChange = useCallback((newMode: ChartMode) => {
    setStatRequest((prev) => ({
      ...prev,
      mode: newMode,
    }));
  }, []);

  const displayChartData = useMemo(() => {
    if (!isCumulative || chartType !== "line") return chartData;

    const employeeNames = series.map((s) => s.employeeName);
    const cumulatives: Record<string, number> = {};
    employeeNames.forEach((name) => (cumulatives[name] = 0));

    return chartData.map((point) => {
      const newPoint: ChartDataPoint = { label: point.label };
      employeeNames.forEach((name) => {
        const value = point[name];
        if (value === null) {
          newPoint[name] = null;
        } else {
          cumulatives[name] += (value as number) || 0;
          newPoint[name] = cumulatives[name];
        }
      });
      return newPoint;
    });
  }, [chartData, series, isCumulative, chartType]);

  const displaySeries = useMemo(() => {
    if (!isCumulative || chartType !== "line") return series;

    return series.map((s) => {
      const cumulativeData: (number | null)[] = [];
      let cumulative = 0;
      chartData.forEach((point) => {
        const value = point[s.employeeName];
        if (value === null) {
          cumulativeData.push(null);
        } else {
          cumulative += (value as number) || 0;
          cumulativeData.push(cumulative);
        }
      });
      return { ...s, data: cumulativeData };
    });
  }, [series, chartData, isCumulative, chartType]);

  const yAxisTicks = useMemo(() => {
    if (displaySeries.length === 0) return [0];

    const allValues = displaySeries.flatMap((s) => s.data).filter((v): v is number => v !== null);
    if (allValues.length === 0) return [0];
    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues);
    const step = statRequest.mode === ChartMode.MONTHLY ? 2000 : 100;
    const roundedMin = Math.floor(minValue / step) * step;
    const minTick  = Math.max(0, roundedMin === minValue ? roundedMin - step : roundedMin);
    const roundedMax = Math.ceil(maxValue / step) * step;
    const maxTick = roundedMax === maxValue ? roundedMax + step : roundedMax;

    const ticks: number[] = [];
    for (let i = minTick; i <= maxTick; i += step) {
      ticks.push(i);
    }
    return ticks;
  }, [displaySeries, statRequest.mode]);

  return (
    <div className="employee-revenue-chart width-max flex-column align-items-center">

      <div className="chart-filters flex width-90 align-items-center mt-1 space-between">
        <div className="flex g-1 align-items-center">
        <div className="flex">
          <DropdownSelect
            items={chartModeItems}
            value={
              chartModeItems.find((r) => r.id === statRequest.mode) ||
              chartModeItems[0]
            }
            onChange={(selected) => {
              const reason = Array.isArray(selected)
                ? selected[0]?.id
                : selected?.id;
              if (reason) handleChartModeChange(reason);
            }}
            searchable={false}
            allowNew={false}
            multiple={false}
            className=""
          />
        </div>

        <div className="flex">
          <DropdownSelect
            items={years}
            value={
              statRequest.year
                ? years.find((y) => y.id === statRequest.year) ?? null
                : null
            }
            onChange={handleYearChange}
            searchable={false}
            allowNew={false}
            placeholder="Wybierz"
            className="expense-year"
          />
        </div>

        {statRequest.mode === "DAILY" && (
          <div className="flex">
            <DropdownSelect
              items={MONTHS}
              value={
                statRequest.month
                  ? MONTHS.find((m) => m.id === statRequest.month) ?? null
                  : null
              }
              onChange={handleMonthChange}
              searchable={false}
              allowNew={false}
              placeholder="Wybierz"
              className="expense-month"
              disabledItemIds={disabledMonthIds}
            />
          </div>
        )}
        </div>

        <div className="flex g-05 align-items-center">
          {chartType === "line" && (
            <ActionButton
              disableImg={true}
              text="Narastający"
              onClick={() => setIsCumulative((prev) => !prev)}
              className={isCumulative ? "chart-selected" : ""}
            />
          )}
          <ActionButton
            src={chartType === "line" ? "src/assets/bar_chart.svg" : "src/assets/chart.svg"}
            alt={chartType === "line" ? "Wykres Słupkowy" : "Wykres Liniowy"}
            iconTitle={chartType === "line" ? "Wykres Słupkowy" : "Wykres Liniowy"}
            text={chartType === "line" ? "Słupkowy" : "Liniowy"}
            onClick={() => setChartType((prev) => (prev === "line" ? "bar" : "line"))}
          />         
        </div>


      </div>

      <div className="chart-container">
        
        {loading ? (
          <div className="chart-loading flex justify-center align-items-center" style={{ height: 300 }}>
            Ładowanie...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            {chartType === "line" ? (
              <LineChart
                data={displayChartData}
                margin={{ top: 20, right: 40, left: 20, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#9ca3af", fontSize: 13 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                  tickLine={false}
                  tickMargin={5}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                  tickLine={false}
                  tickFormatter={(value) => `${value.toLocaleString("pl-PL")} zł`}
                  ticks={yAxisTicks}
                  domain={[yAxisTicks[0] || 0, yAxisTicks[yAxisTicks.length - 1] || "auto"]}
                  width={56}
                  tickMargin={5}
                />
                <Tooltip content={<ChartTooltip mode={statRequest.mode} month={statRequest.month ?? null} />} />
                <Legend
                  wrapperStyle={{ marginTop: "0.5rem" }}
                  formatter={(value) => <span style={{ color: "#e5e7eb" }}>{value}</span>}
                />
                {series.map((s) => (
                  <Line
                    key={s.employeeId}
                    type="monotone"
                    dataKey={s.employeeName}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: s.color, stroke: "#fff", strokeWidth: 2 }}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 40, left: 20, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#9ca3af", fontSize: 13 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                  tickLine={false}
                  tickMargin={5}
                />
                <YAxis
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                  tickLine={false}
                  tickFormatter={(value) => `${value.toLocaleString("pl-PL")} zł`}
                  ticks={yAxisTicks}
                  domain={[yAxisTicks[0] || 0, yAxisTicks[yAxisTicks.length - 1] || "auto"]}
                  width={56}
                  tickMargin={5}
                />
                <Tooltip
                  content={<ChartTooltip mode={statRequest.mode} month={statRequest.month ?? null} />}
                  offset={60}
                />
                <Legend
                  wrapperStyle={{ marginTop: "0.5rem" }}
                  formatter={(value) => <span style={{ color: "#e5e7eb" }}>{value}</span>}
                />
                {series.map((s) => (
                  <Bar
                    key={s.employeeId}
                    dataKey={s.employeeName}
                    fill={s.color}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default EmployeeRevenueChart;
