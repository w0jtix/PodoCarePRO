import { Action } from "../models/action";

export type EntityType = 'product' | 'category' | 'brand' | 'supplier' | 'employee';

export const extractErrorMessage = (
    error:any,
    action: Action.CREATE | Action.EDIT,
    entityType: EntityType = 'product'
): string => {
    const entityConfig = getEntityConfig(entityType);

    const defaultMessage = `Błąd ${action === Action.CREATE ? entityConfig.createAction : entityConfig.updateAction} ${entityConfig.entityName}.`;

    const getErrorString = (err: any): string => {
        if (err?.response?.data) {
        if (typeof err.response.data === 'string') {
            return err.response.data;
        }
        if (err.response.data.message) {
            return err.response.data.message;
        }
        if (err.response.data.error) {
            return err.response.data.error;
        }
        }
        
        if (err?.message) {
        return err.message;
        }
        
        return String(err);
    };

    const errorString = getErrorString(error);

    if (errorString.includes('already exists')) {
    return entityConfig.alreadyExistsMessage;
    }
    
    return defaultMessage;
}

const getEntityConfig = (entityType: EntityType) => {
  const configs = {
    product: {
      createAction: 'tworzenia',
      updateAction: 'aktualizacji',
      entityName: 'produktu',
      alreadyExistsMessage: 'Produkt o takiej nazwie już istnieje!'
    },
    category: {
      createAction: 'tworzenia',
      updateAction: 'aktualizacji',
      entityName: 'kategorii',
      alreadyExistsMessage: 'Kategoria o takiej nazwie już istnieje!'
    },
    brand: {
      createAction: 'tworzenia',
      updateAction: 'aktualizacji',
      entityName: 'marki',
      alreadyExistsMessage: 'Marka o takiej nazwie już istnieje!'
    },
    supplier: {
      createAction: 'tworzenia',
      updateAction: 'aktualizacji',
      entityName: 'sklepu',
      alreadyExistsMessage: 'Sklep o takiej nazwie już istnieje!'
    },
    employee: {
      createAction: 'tworzenia',
      updateAction: 'aktualizacji',
      entityName: 'pracownika',
      alreadyExistsMessage: 'Pracownik o takiej nazwie już istnieje!'
    }
  };

  return configs[entityType];
};

export const extractProductErrorMessage = (error: any, action: Action.CREATE | Action.EDIT): string => {
  return extractErrorMessage(error, action, 'product');
};

export const extractCategoryErrorMessage = (error: any, action: Action.CREATE | Action.EDIT): string => {
  return extractErrorMessage(error, action, 'category');
};

export const extractBrandErrorMessage = (error: any, action: Action.CREATE | Action.EDIT): string => {
  return extractErrorMessage(error, action, 'brand');
};

export const extractSupplierErrorMessage = (error: any, action: Action.CREATE | Action.EDIT): string => {
  return extractErrorMessage(error, action, 'supplier');
};

export const extractEmployeesErrorMessage = (error: any, action: Action.CREATE | Action.EDIT): string => {
  return extractErrorMessage(error, action, 'employee');
};