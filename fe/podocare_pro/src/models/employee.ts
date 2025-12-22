export interface Employee {
    id: number;
    name: string;
    secondName: string;   
    isDeleted?: boolean;
}


export interface NewEmployee {
    name?: string;
    secondName?: string;
}