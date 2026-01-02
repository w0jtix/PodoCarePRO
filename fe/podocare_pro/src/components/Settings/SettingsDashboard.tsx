import { useState, useEffect, useCallback } from "react";
import { useAlert } from "../Alert/AlertProvider";
import AppSettingsService from "../../services/AppSettingsService";
import { AppSettings, NewAppSettings } from "../../models/app_settings";
import NavigationBar from "../NavigationBar";
import { Slider } from "../Slider";
import ActionButton from "../ActionButton";
import { AlertType } from "../../models/alert";
import { validateSettingsForm } from "../../utils/validators";

export function SettingsDashboard() {
  const [initialSettings, setIninitalSettings] = useState<AppSettings>({
    id: 0,
    voucherExpiryTime: 0,
    visitAbsenceRate: 0,
    visitVipRate: 0,
    boostNetRate: 0,
    googleReviewDiscount: 0,
    booksyHappyHours: 0
  });
  const [settings, setSettings] = useState<NewAppSettings>({
    voucherExpiryTime: 0,
    visitAbsenceRate: 0,
    visitVipRate: 0,
    boostNetRate: 0,
    googleReviewDiscount: 0,  
    booksyHappyHours: 0
  });
  const { showAlert } = useAlert();

  const fetchSettings = async () => {
    AppSettingsService.getSettings()
      .then((data) => {
        setSettings(data);
        setIninitalSettings(data);
      })
      .catch((error) => {
        setSettings({
          voucherExpiryTime: 0,
          visitAbsenceRate: 0,
          visitVipRate: 0,
          boostNetRate: 0,
          googleReviewDiscount: 0,
          booksyHappyHours: 0
        });
        showAlert("Błąd", AlertType.ERROR);
        console.error("Error fetching settings:", error);
      });
  };

  const handleVoucherExpiryTimeChange = useCallback((months: number) => {
    setSettings((prev) => ({
      ...prev,
      voucherExpiryTime: months,
    }));
  }, []);
  const handleAbsenceRateChange = useCallback((rate: number) => {
    setSettings((prev) => ({
      ...prev,
      visitAbsenceRate: rate,
    }));
  }, []);
  const handleVipRateChange = useCallback((rate: number) => {
    setSettings((prev) => ({
      ...prev,
      visitVipRate: rate,
    }));
  }, []);
  
  const handleBoostNetRateChange = useCallback((rate: number) => {
    setSettings((prev) => ({
      ...prev,
      boostNetRate: rate,
    }));
  }, []);
  const handleGoogleReviewDiscountChange = useCallback((rate: number) => {
    setSettings((prev) => ({
      ...prev,
      googleReviewDiscount: rate,
    }));
  }, []);
   const handleHappyHoursChange = useCallback((rate: number) => {
    setSettings((prev) => ({
      ...prev,
      booksyHappyHours: rate,
    }));
  }, []);

  const handleSaveSettings = useCallback(async () => {
    let error;
    if (initialSettings.id != 0)
      error = validateSettingsForm(settings, initialSettings);
    if (error) {
      showAlert(error, AlertType.ERROR);
      return;
    }
    try {
      await AppSettingsService.updateSettings(
        settings as AppSettings | NewAppSettings
      );
      showAlert("Ustawienia pomyślnie zaktualizowane!", AlertType.SUCCESS);
      fetchSettings();
    } catch (error) {
      showAlert("Błąd aktualizacji ustawień!", AlertType.ERROR);
    }
  }, [settings, showAlert, initialSettings]);

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="dashboard-panel width-85 height-max flex-column align-items-center">
      <NavigationBar showSearchbar={false} />
      <div className="settings-grid grid g-2 width-90 mt-3">
        
        <div className="setting-container flex width-max align-items-center justify-center">
          <Slider
            onChange={handleVoucherExpiryTimeChange}
            min={0}
            max={36}
            unit={" msc"}
            value={settings?.voucherExpiryTime}
            label={"Okres ważności Vouchera:"}
            description={
              "Podczas tworzenia nowego Vouchera, na podstawie podanej wartości, program przeliczy datę ważności względem daty utworzenia."
            }
            className="mt-1 mb-1 mr-1 ml-1"
          />
        </div>
        <div className="setting-container flex width-max align-items-center justify-center">
          <Slider
            onChange={handleAbsenceRateChange}
            min={0}
            max={100}
            unit={" %"}
            value={settings?.visitAbsenceRate}
            label={"Przelicznik za nieodbytą wizytę:"}
            description={
              "Tworząc nową Wizytę z nieobecnością (<24h), wartość Wizyty będzie przemnożona przez wskazaną wartość tworząc nowy Dług Klienta."
            }
            className="mt-1 mb-1 mr-1 ml-1"
          />
        </div>
        <div className="setting-container flex width-max align-items-center justify-center">
          <Slider
            onChange={handleVipRateChange}
            min={100}
            max={200}
            unit={" %"}
            value={settings?.visitVipRate}
            label={"Przelicznik wizyty VIP:"}
            description={
              "Podczas tworzenia Wizyty VIP program automatycznie przeliczy koszt Wizyty w oparciu o ustawioną wartość."
            }
            className="mt-1 mb-1 mr-1 ml-1"
          />
        </div>
        <div className="setting-container flex width-max align-items-center justify-center">
          <Slider
            onChange={handleBoostNetRateChange}
            min={0}
            max={100}
            unit={" %"}
            value={settings?.boostNetRate}
            label={"Prowizja Netto Boost:"}
            description={
              "Prowizja Netto od pierwszej Wizyty nowego Klienta pozyskanego przez Boost. Podatek VAT zostanie autmatycznie przeliczony."
            }
            className="mt-1 mb-1 mr-1 ml-1"
          />
        </div>
        <div className="setting-container flex width-max align-items-center justify-center">
          <Slider
            onChange={handleGoogleReviewDiscountChange}
            min={0}
            max={100}
            unit={" %"}
            value={settings?.googleReviewDiscount}
            label={"Rabat za opinię Google:"}
            description={
              "Podczas tworzenia Wizyty wraz z wykorzystaniem Rabatu za pozostawienie Opinii Google, program automatycznie przeliczy zniżkę i wartość końcową Wizyty."
            }
            className="mt-1 mb-1 mr-1 ml-1"
          />
        </div>
        <div className="setting-container flex width-max align-items-center justify-center">
            <Slider
            onChange={handleHappyHoursChange}
            min={0}
            max={100}
            unit={" %"}
            value={settings?.booksyHappyHours}
            label={"Rabat Booksy Happy Hours:"}
            description={
              "Podczas tworzenia Wizyty wraz z wykorzystaniem Rabatu Happy Hours, program automatycznie przeliczy zniżkę i wartość końcową Wizyty."
            }
            className="mt-1 mb-1 mr-1 ml-1"
          />

        </div>
      </div>
      <div className="flex width-90 justify-end mt-2">
        <ActionButton
          src={"src/assets/tick.svg"}
          alt={"Zapisz"}
          text={"Zapisz"}
          disableImg={true}
          onClick={handleSaveSettings}
          className="yellow"
        />
      </div>
    </div>
  );
}
export default SettingsDashboard;
