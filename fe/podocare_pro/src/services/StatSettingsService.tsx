import { sendApiRequest } from "../components/send-api-request/SendApiRequest";
import { StatSettings, NewStatSettings } from "../models/business_settings";

class StatSettingsService {
    static async getSettings(): Promise<StatSettings> {
        return await sendApiRequest<StatSettings> (`stat-settings`, {
            method: "get",
            body: {},
            errorMessage: "Error fetching StatSettings.",
        });
    }

    static async updateSettings(
        settings: NewStatSettings
    ): Promise <StatSettings> {
        return await sendApiRequest<StatSettings>(`stat-settings`, {
            method: "put",
            body: settings,
            errorMessage: "Error updating StatSettings.",
        });
    }
}
export default StatSettingsService;