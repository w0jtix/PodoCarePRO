  export const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
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