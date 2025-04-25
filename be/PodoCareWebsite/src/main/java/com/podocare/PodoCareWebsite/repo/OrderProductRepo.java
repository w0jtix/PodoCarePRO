package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.model.OrderProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderProductRepo extends JpaRepository<OrderProduct, Long> {

}
