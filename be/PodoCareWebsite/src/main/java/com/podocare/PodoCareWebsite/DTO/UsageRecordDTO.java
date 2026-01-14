package com.podocare.PodoCareWebsite.DTO;

import com.podocare.PodoCareWebsite.model.UsageRecord;
import com.podocare.PodoCareWebsite.model.constants.UsageReason;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

import static java.util.Objects.isNull;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UsageRecordDTO {

    private Long id;
    private ProductDTO product;
    private EmployeeDTO employee;
    private LocalDate usageDate;
    private Integer quantity;
    private UsageReason usageReason;

    public UsageRecordDTO(UsageRecord usageRecord) {
        if (isNull(usageRecord))
            return;
        this.id = usageRecord.getId();
        this.product = new ProductDTO(usageRecord.getProduct());
        this.employee = new EmployeeDTO(usageRecord.getEmployee());
        this.usageDate = usageRecord.getUsageDate();
        this.quantity = usageRecord.getQuantity();
        this.usageReason = usageRecord.getUsageReason();
    }

    public UsageRecord toEntity() {
        return UsageRecord.builder()
                .id(this.id)
                .product(this.product != null ? this.product.toEntity() : null)
                .employee(this.employee != null ? this.employee.toEntity() : null)
                .usageDate(this.usageDate)
                .quantity(this.quantity)
                .usageReason(this.usageReason)
                .build();
    }
}
