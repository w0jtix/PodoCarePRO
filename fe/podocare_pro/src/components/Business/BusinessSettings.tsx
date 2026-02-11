import { useState, useEffect, useCallback } from "react";
import { useAlert } from "../Alert/AlertProvider";
import { Slider } from "../Slider";
import ActionButton from "../ActionButton";
import { AlertType } from "../../models/alert";
import { validateStatSettingsForm } from "../../utils/validators";
import { NewStatSettings, StatSettings } from "../../models/business_settings";
import StatSettingsService from "../../services/StatSettingsService";
import { MONTHS } from "../../utils/dateUtils";
import LogsPopup from "../Popups/LogsPopup";

export function BusinessSettings() {
  const [initialSettings, setIninitalSettings] = useState<StatSettings>({
    id: 0,
    bonusThreshold: 0,
    servicesRevenueGoal: 0,
    productsRevenueGoal: 0,
    saleBonusPayoutMonths: [],
  });
  const [settings, setSettings] = useState<NewStatSettings>({
    bonusThreshold: 0,
    servicesRevenueGoal: 0,
    productsRevenueGoal: 0,
    saleBonusPayoutMonths: [],
  });
  const [logsPopupOpen, setLogsPopupOpen] = useState<boolean>(false);
  const { showAlert } = useAlert();

  const fetchStatSettings = async () => {
    StatSettingsService.getSettings()
      .then((data) => {
        setSettings(data);
        setIninitalSettings(data);
      })
      .catch((error) => {
        setSettings({
          bonusThreshold: 0,
          servicesRevenueGoal: 0,
          productsRevenueGoal: 0,
          saleBonusPayoutMonths: [],
        });
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching Stat Settings:", error);
      });
  };

  const handleBonusThresholdChange = useCallback((threshold: number) => {
    setSettings((prev) => ({
      ...prev,
      bonusThreshold: threshold,
    }));
  }, []);
  const handleServicesRevenueChange = useCallback((revenue: number) => {
    setSettings((prev) => ({
      ...prev,
      servicesRevenueGoal: revenue,
    }));
  }, []);
  const handleProductsRevenueChange = useCallback((revenue: number) => {
    setSettings((prev) => ({
      ...prev,
      productsRevenueGoal: revenue,
    }));
  }, []);
  
  const handleSaleBonusPayoutMonthChange = useCallback((months: number[]) => {
    setSettings((prev) => ({
      ...prev,
      saleBonusPayoutMonths: months,
    }));
  }, []);
  

  const handleSaveStatSettings = useCallback(async () => {
    let error;
    if (initialSettings.id != 0)
      error = validateStatSettingsForm(settings, initialSettings);
    if (error) {
      showAlert(error, AlertType.ERROR);
      return;
    }
    try {
      await StatSettingsService.updateSettings(
        settings as StatSettings | NewStatSettings
      );
      showAlert("Ustawienia pomyślnie zaktualizowane!", AlertType.SUCCESS);
      fetchStatSettings();
    } catch (error) {
      showAlert("Błąd aktualizacji ustawień!", AlertType.ERROR);
    }
  }, [settings, showAlert, initialSettings]);

  useEffect(() => {
    fetchStatSettings();
  }, []);

  return (
    <div className="flex-column align-items-center">

    <div className="flex width-90 mt-1 justify-end">
      <ActionButton
        src={"/src/assets/logs.svg"}
        alt={"Logs"}
        text={"Wyświetl logi"}
        onClick={() => setLogsPopupOpen(true)}
      />
      </div>
     
      <div className="settings-grid grid g-2 width-90 mt-1">
        
        <div className="setting-container flex width-max align-items-center justify-center">
          <Slider
            onChange={handleBonusThresholdChange}
            min={0}
            max={10000}
            step={100}
            unit={" zł"}
            value={settings?.bonusThreshold}
            label={"Próg, od którego naliczana jest premia:"}
            description={
              "Przychód wygenerowany przez zrealizowane usługi w danym miesiącu, który nie wlicza się do premii. Innymi słowy, jeśli pracownik wygeneruje przychód poniżej tej wartości, nie otrzyma premii."
            }
            className="mt-1 mb-1 mr-1 ml-1"
          />
        </div>
        <div className="setting-container flex width-max align-items-center justify-center">
          <Slider
            onChange={handleServicesRevenueChange}
            min={0}
            max={50000}
            step={100}
            unit={" zł"}
            value={settings?.servicesRevenueGoal}
            label={"Cel usług:"}
            description={
              "Miesięczny cel przychodu z usług dla pracownika pełnoetatowego, który powinien osiągnąć. Na podstawie ustawionego wymiaru czasu pracy pracownika program automatycznie przeliczy cel przychodu z usług."
            }
            className="mt-1 mb-1 mr-1 ml-1"
          />
        </div>
        <div className="setting-container flex width-max align-items-center justify-center">
          <Slider
            onChange={handleProductsRevenueChange}
            min={0}
            max={10000}
            step={100}
            unit={" zł"}
            value={settings?.productsRevenueGoal}
            label={"Cel sprzedaży produktów:"}
            description={
              "Miesięczny cel przychodu ze sprzedaży produktów dla pracownika pełnoetatowego, który powinien osiągnąć. Na podstawie ustawionego wymiaru czasu pracy pracownika program automatycznie przeliczy cel przychodu ze sprzedaży produktów."
            }
            className="mt-1 mb-1 mr-1 ml-1"
          />
        </div>
        <div className="setting-container flex-column width-max align-items-center justify-center">
          <span className="setting-label mb-1">Miesiące wypłaty premii kwartalnej:</span>
          <div className="flex-column g-05">
            {[[1, 4, 7, 10], [2, 5, 8, 11], [3, 6, 9, 12]].map((row) => {
              const isRowSelected = row.every(m => settings.saleBonusPayoutMonths.includes(m));
              return (
                <div key={row[0]} className="month-row flex g-05">
                  {row.map((month) => (
                    <ActionButton
                      key={month}
                      text={MONTHS[month - 1].name}
                      disableImg={true}
                      className={isRowSelected ? 'selected' : ''}
                      onClick={() => handleSaleBonusPayoutMonthChange(row)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex width-90 justify-end mt-2">
        <ActionButton
          src={"src/assets/tick.svg"}
          alt={"Zapisz"}
          text={"Zapisz"}
          disableImg={true}
          onClick={handleSaveStatSettings}
          className="yellow"
        />
      </div>
      {logsPopupOpen && (
        <LogsPopup
        onClose={() => setLogsPopupOpen(false)}
        />
      )}
    </div>
  );
}
export default BusinessSettings;
