import {
  ChartMode,
  EmployeeRevenue,
  EmployeeRevenueSeries,
  EmployeeRevenueFilter,
  ChartDataPoint,
  FrontendEmployeeRevenueSeries,
  FrontendEmployeeRevenue
} from "../models/statistics";
import { generateMonthlyLabels, generateDailyLabels, getDaysInMonth } from "./dateUtils";

export const CHART_COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
];

export const CARD_BACKGROUND_COLORS = [
  "#110126c8",
  "rgba(1, 11, 27, 0.9)",
  "#010b048d",
  "#150e01bd",
];

export const assignColorToSeries = (
  backendSeries: EmployeeRevenueSeries[],
): FrontendEmployeeRevenueSeries[] => {
  return backendSeries.map((s) => ({
    ...s,
    color: CHART_COLORS[s.employeeId -1 % CHART_COLORS.length],
  }));
};

export const generateLabels = (filter: EmployeeRevenueFilter): string[] => {
  if (filter.mode === ChartMode.MONTHLY) {
    return generateMonthlyLabels();
  }

  if (filter.year && filter.month) {
    return generateDailyLabels(filter.year, filter.month);
  }

  return [];
};

export const validateDataLength = (
  data: number[],
  filter: EmployeeRevenueFilter
): boolean => {
  const expectedLength = filter.mode === ChartMode.MONTHLY
    ? 12
    : getDaysInMonth(filter.year!, filter.month!);

  return data.length === expectedLength;
};

export const transformBackendResponse = (
  backendData: EmployeeRevenue,
  filter: EmployeeRevenueFilter
): FrontendEmployeeRevenue => {
  const labels = generateLabels(filter);
  const series = assignColorToSeries(backendData.series);

  return { labels, series };
};

//Reformat to Recharts (ChartDataPoint[])
export const transformToChartData = (
  employeeRevenue: FrontendEmployeeRevenue
): ChartDataPoint[] => {
  return employeeRevenue.labels.map((label, index) => {
    const point: ChartDataPoint = { label };
    employeeRevenue.series.forEach((s) => {
      point[s.employeeName] = s.data[index] ?? 0;
    });
    return point;
  });
};

const isCurrentMonth = (filter: EmployeeRevenueFilter): boolean => {
  const now = new Date();
  return (
    filter.mode === ChartMode.DAILY &&
    filter.year === now.getFullYear() &&
    filter.month === now.getMonth() + 1
  );
};

const isCurrentYear = (filter: EmployeeRevenueFilter): boolean => {
  const now = new Date();
  return (
    filter.mode === ChartMode.MONTHLY &&
    filter.year === now.getFullYear()
  );
};

export const processEmployeeRevenueResponse = (
  backendData: EmployeeRevenue,
  filter: EmployeeRevenueFilter
): { chartData: ChartDataPoint[]; series: FrontendEmployeeRevenueSeries[] } => {
  const employeeRevenue = transformBackendResponse(backendData, filter);
  let chartData = transformToChartData(employeeRevenue);
  let series = employeeRevenue.series;
  const employeeNames = series.map((s) => s.employeeName);

  // null values for future days
  if (isCurrentMonth(filter)) {
    const today = new Date().getDate();

    chartData = chartData.map((point, index) => {
      if (index >= today) {
        const nulledPoint: ChartDataPoint = { label: point.label };
        employeeNames.forEach((name) => {
          nulledPoint[name] = null;
        });
        return nulledPoint;
      }
      return point;
    });

    series = series.map((s) => ({
      ...s,
      data: s.data.map((value, index) => (index >= today ? null : value)),
    }));
  }

  // null values for future months
  if (isCurrentYear(filter)) {
    const currentMonth = new Date().getMonth();

    chartData = chartData.map((point, index) => {
      if (index > currentMonth) {
        const nulledPoint: ChartDataPoint = { label: point.label };
        employeeNames.forEach((name) => {
          nulledPoint[name] = null;
        });
        return nulledPoint;
      }
      return point;
    });

    series = series.map((s) => ({
      ...s,
      data: s.data.map((value, index) => (index > currentMonth ? null : value)),
    }));
  }

  return {
    chartData,
    series
  };
};

export const SERIES_CONFIG = [
  { key: "Przychód", color: "#1199ed" },
  { key: "Koszty", color: "#e10f0f" },
  { key: "Dochód", color: "#14dc1e" },
];
