export interface Alert {
    message: string;
    variant: AlertType;
}

export enum AlertType {
    SUCCESS,
    ERROR,
    INFO,
}