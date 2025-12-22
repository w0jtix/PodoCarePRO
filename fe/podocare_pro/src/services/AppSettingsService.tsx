import { sendApiRequest } from "../components/send-api-request/SendApiRequest";
import { AppSettings, NewAppSettings } from "../models/app_settings";

class AppSettingsService {
    static async getSettings(): Promise<AppSettings> {
        return await sendApiRequest<AppSettings> (`settings`, {
            method: "get",
            body: {},
            errorMessage: "Error fetching AppSettings.",
        });
    }

    static async updateSettings(
        settings: NewAppSettings
    ): Promise <AppSettings> {
        return await sendApiRequest<AppSettings>(`settings`, {
            method: "put",
            body: settings,
            errorMessage: "Error updating AppSettings.",
        });
    }
}
export default AppSettingsService;