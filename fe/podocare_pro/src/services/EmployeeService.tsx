import { sendApiRequest } from "../components/send-api-request/SendApiRequest";
import { Employee, NewEmployee } from "../models/employee";

class EmployeeService {
    
    static async getAllEmployees(): Promise<Employee[]> {
        return await sendApiRequest<Employee[]> ('employee/all', {
            method: 'get',
            errorMessage: "Error fetching employees."
        })
    }

    static async getEmployeeById(id: number ): Promise<Employee> {
        return await sendApiRequest<Employee>(`employee/${id}`, {
            method: "get",
            errorMessage: "Error fetching Employee."
        })
    }

    static async createEmployee(employee: NewEmployee): Promise<Employee> {
        return await sendApiRequest<Employee> ('employee', {
            method: 'post',
            body: employee,
            errorMessage: "Error creating new Employee."
        })
    }

    static async updateEmployee(id: number, employee: NewEmployee,): Promise<Employee> {
        return await sendApiRequest<Employee>(`employee/${id}`, {
            method: "put",
            body: employee,
            errorMessage: "Error updating Employee."
        })
    }
}

export default EmployeeService;