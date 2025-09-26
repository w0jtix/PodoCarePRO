export interface Employee {
    id: number;
    name: string;
    secondName: string;
    username: string;
}

export interface NewEmployee {
    name?: string;
    secondName?: string;
    username?: string;
}