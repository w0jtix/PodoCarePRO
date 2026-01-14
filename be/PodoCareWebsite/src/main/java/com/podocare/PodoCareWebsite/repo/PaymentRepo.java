package com.podocare.PodoCareWebsite.repo;

import com.podocare.PodoCareWebsite.DTO.PaymentDTO;
import com.podocare.PodoCareWebsite.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepo  extends JpaRepository<Payment, Long> {

    Optional<PaymentDTO> findOneById(Long id);
}
