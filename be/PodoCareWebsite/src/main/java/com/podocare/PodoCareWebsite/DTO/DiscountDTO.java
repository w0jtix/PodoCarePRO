package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.Discount;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DiscountDTO {
    private Long id;
    private String name;
    private Integer percentageValue;
    private List<ClientDTO> clients = new ArrayList<>();
    private Long clientCount;

    public DiscountDTO(Discount discount) {
        this.id = discount.getId();
        this.name = discount.getName();
        this.percentageValue = discount.getPercentageValue();
    }
    public DiscountDTO(Long id, String name, Integer percentageValue, Long clientCount) {
        this.id = id;
        this.name = name;
        this.percentageValue = percentageValue;
        this.clientCount = clientCount;
    }

    public Discount toEntity() {
        String trimmedName = this.name != null && this.name.length() > 6
                ? this.name.substring(0, 6)
                : this.name;

        return Discount.builder()
                .id(this.id)
                .name(trimmedName)
                .percentageValue(this.percentageValue)
                .build();
    }
}
