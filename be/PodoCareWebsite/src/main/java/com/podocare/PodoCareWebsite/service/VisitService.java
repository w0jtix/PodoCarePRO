package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.VisitDTO;
import com.podocare.PodoCareWebsite.DTO.request.VisitFilterDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface VisitService {

    VisitDTO getVisitById(Long id);

    Page<VisitDTO> getVisits(VisitFilterDTO filter, int page, int size);

    VisitDTO getVisitPreview(VisitDTO visit);

    VisitDTO createVisit(VisitDTO visit);

    /*VisitDTO updateVisit(Long id, VisitDTO visit);*/

    void deleteVisitById(Long id);

    VisitDTO findVisitPaidByVoucher(Long voucherId);

    VisitDTO findByDebtSourceVisitId(Long visitId);

    VisitDTO getVisitByDebtSourceId(Long debtId);

    VisitDTO findByReviewId(Long reviewId);

    long countVisitsByClientId(Long clientId);

}
