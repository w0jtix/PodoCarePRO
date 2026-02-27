  export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  export const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const sec = String(date.getSeconds()).padStart(2, "0");
    return `${day}.${month}.${year}\u00A0\u00A0\u00A0${hour}:${min}:${sec}`;
  };

  export const MONTHS = [
    { id: 1, name: "Styczeń" },
    { id: 2, name: "Luty" },
    { id: 3, name: "Marzec" },
    { id: 4, name: "Kwiecień" },
    { id: 5, name: "Maj" },
    { id: 6, name: "Czerwiec" },
    { id: 7, name: "Lipiec" },
    { id: 8, name: "Sierpień" },
    { id: 9, name: "Wrzesień" },
    { id: 10, name: "Październik" },
    { id: 11, name: "Listopad" },
    { id: 12, name: "Grudzień" },
  ];

  export const START_YEAR = 2025;

  export const getYears = (): { id: number; name: string }[] => {
    const currentYear = new Date().getFullYear();
    const years: { id: number; name: string }[] = [];
    for (let year = START_YEAR; year <= currentYear; year++) {
      years.push({ id: year, name: String(year) });
    }
    return years;
  };

  function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

  export function getWeekday(dateString: string): string {
  const weekday = new Date(dateString).toLocaleDateString("pl-PL", {
    weekday: "long",
  });
  return capitalize(weekday);
}

  export const getPreviousMonth = (): string => {
    const currentMonth = new Date().getMonth();
    const previousMonthIndex = currentMonth === 0 ? 11 : currentMonth - 1;
    return MONTHS[previousMonthIndex].name;
  };

  export const getPreviousMonthYear = (): number => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return currentMonth === 0 ? currentYear - 1 : currentYear;
  };

  export const getPreviousMonthYearByDate = (date: Date): string => {
    const month = date.getMonth();
    const year = date.getFullYear();

    const previousMonth = month === 0 ? 12 : month;
    const previousYear = month === 0 ? year - 1 : year;

    return `${String(previousMonth).padStart(2, "0")}.${String(previousYear).slice(-2)}`;
  }

  export const getSameMonthPreviousYearByDate = (date: Date): string => {
    return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getFullYear() - 1).slice(-2)}`;
  }

  export const getCurrentYear = (): number => {
    return new Date().getFullYear();
  };

    export const getCurrentMonth = (): string => {
    const currentMonth = new Date().getMonth();
    return MONTHS[currentMonth].name;
  };

  // Chart Axis Labels
  export const MONTH_LABELS_SHORT = [
    "Sty", "Lut", "Mar", "Kwi", "Maj", "Cze",
    "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"
  ];

   export const SHORT_TO_INDEX: Record<string, number> = {
    "Sty": 0, "Lut": 1, "Mar": 2, "Kwi": 3, "Maj": 4, "Cze": 5,
    "Lip": 6, "Sie": 7, "Wrz": 8, "Paź": 9, "Lis": 10, "Gru": 11
  };

  // For Chart Day Axis
  export const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month, 0).getDate();
  };

  // DailyChart Axis Labels
  export const generateDailyLabels = (year: number, month: number): string[] => {
    const daysCount = getDaysInMonth(year, month);
    return Array.from({ length: daysCount }, (_, i) => String(i + 1));
  };

  // MonthlyChart Axis Labels
  export const generateMonthlyLabels = (): string[] => {
    return [...MONTH_LABELS_SHORT];
  };

  export function getMonday(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  export function getSunday(monday: Date): Date {
    const d = new Date(monday);
    d.setDate(d.getDate() + 6);
    return d;
  }

  export function getMondayKey(date: Date): string {
    return getMonday(date).toISOString().slice(0, 10);
  }

  export interface WeekRange {
    weekNumber: number;
    start: Date;
    end: Date;
  }

  export function getWeeksOfMonth(year: number, month: number): WeekRange[] {
    const weeks: WeekRange[] = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    let weekStart = new Date(firstDay);
    let weekNumber = 1;

    while (weekStart <= lastDay) {
      const dayOfWeek = weekStart.getDay();
      let weekEnd: Date;

      if (weekNumber === 1 && dayOfWeek !== 1) {
        const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
        weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + daysUntilSunday);
      } else {
        weekEnd = getSunday(weekStart);
      }

      if (weekEnd > lastDay) {
        weekEnd = new Date(lastDay);
      }

      weeks.push({
        weekNumber,
        start: new Date(weekStart),
        end: new Date(weekEnd),
      });

      weekNumber++;
      const nextDay = new Date(weekEnd);
      nextDay.setDate(nextDay.getDate() + 1);
      weekStart = nextDay;
    }

    return weeks;
  }