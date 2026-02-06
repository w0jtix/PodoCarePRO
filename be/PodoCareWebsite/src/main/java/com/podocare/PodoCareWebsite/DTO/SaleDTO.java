package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.DebtRedemption;
import com.podocare.PodoCareWebsite.model.Payment;
import com.podocare.PodoCareWebsite.model.Sale;
import com.podocare.PodoCareWebsite.model.SaleItem;
import com.podocare.PodoCareWebsite.model.constants.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static java.util.Objects.nonNull;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SaleDTO {
    private Long id;
    private List<SaleItemDTO> items =  new ArrayList<>();
    private Double totalNet;
    private Double totalVat;
    private Double totalValue;

    public SaleDTO(Sale sale) {
        this.id = sale.getId();

        if(nonNull(sale.getItems())){
            this.items = sale.getItems().stream()
                    .map(SaleItemDTO::new)
                    .collect(Collectors.toList());
        }
        this.totalNet = sale.getTotalNet();
        this.totalVat = sale.getTotalVat();
        this.totalValue = sale.getTotalValue();
    }

    public Sale toEntity() {
        Sale sale = Sale.builder()
                .id(this.id)
                .items(new ArrayList<>())
                .totalNet(this.totalNet)
                .totalVat(this.totalVat)
                .totalValue(this.totalValue)
                .build();

        if(nonNull(this.items)) {
            List<SaleItem> items = this.items.stream()
                    .map(SaleItemDTO::toEntity)
                    .collect(Collectors.toList());
            sale.setItems(items);
        }
        return sale;
    }
}
