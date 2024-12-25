package com.podocare.PodoCareWebsite.controller.order;

import com.podocare.PodoCareWebsite.model.order.DraftOrder;
import com.podocare.PodoCareWebsite.model.order.Order;
import com.podocare.PodoCareWebsite.service.order.DraftOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/draftOrder")
public class DraftOrderController {

    @Autowired
    private DraftOrderService draftOrderService;

    @PostMapping
    public ResponseEntity<DraftOrder> createDraftOrder(){
        DraftOrder newDraftOrder = draftOrderService.createDraftOrder();
        return new ResponseEntity<>(newDraftOrder, HttpStatus.CREATED);
    }

}
