import { Client } from "./client";

export enum ReviewSource {
    BOOKSY = "BOOKSY",
    GOOGLE = "GOOGLE"
}

export interface Review {
    id: string | number,
    client: Client,
    isUsed: boolean,
    source: ReviewSource,
    issueDate: string,
}

export interface NewReview {
    client: Client | null,
    isUsed?: boolean | null,
    source: ReviewSource | null,
    issueDate: string,
}

export interface ReviewFilterDTO {
    keyword?: string | null,
    source?: ReviewSource | null,
    isUsed?: Boolean | null,
}