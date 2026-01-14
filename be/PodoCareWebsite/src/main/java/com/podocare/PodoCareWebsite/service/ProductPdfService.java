package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.request.ProductFilterDTO;

public interface ProductPdfService {

    /**
     * Generuje raport PDF stanu magazynowego.
     * Produkty są grupowane według kategorii, każda kategoria ma osobną tabelę.
     *
     * @param filter filtry do zawężenia listy produktów (może być null dla wszystkich produktów)
     * @return tablica bajtów reprezentująca dokument PDF
     */
    byte[] generateInventoryReport(ProductFilterDTO filter);
}
