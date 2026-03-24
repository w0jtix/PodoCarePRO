export const environment = {
    production: import.meta.env.PROD,
    apiUrl: import.meta.env.PROD ? '/api/' : ':8080/api/',
}