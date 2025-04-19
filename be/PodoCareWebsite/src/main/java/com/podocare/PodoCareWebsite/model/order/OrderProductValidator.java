package com.podocare.PodoCareWebsite.model.order;

import com.podocare.PodoCareWebsite.model.order.DTOs.OrderProductDTO;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class OrderProductValidator {

    private List<OrderProductDTO> existingProducts = new ArrayList<>();
    private List<OrderProductDTO> nonExistingProducts = new ArrayList<>();
}
