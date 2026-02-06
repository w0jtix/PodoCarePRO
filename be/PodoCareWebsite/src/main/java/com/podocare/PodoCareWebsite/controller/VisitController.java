package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.VisitDTO;
import com.podocare.PodoCareWebsite.DTO.request.VisitFilterDTO;
import com.podocare.PodoCareWebsite.service.VisitService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/visits")
public class VisitController {
    private final VisitService visitService;

    @PostMapping("/search")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<Page<VisitDTO>> getVisits(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @RequestBody(required = false) VisitFilterDTO filter
    ) {
        Page<VisitDTO> visitList = visitService.getVisits(filter, page, size);
        return new ResponseEntity<>(visitList, visitList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<VisitDTO> getVisitById(@PathVariable(value = "id") Long id) {
        VisitDTO visit = visitService.getVisitById(id);
        return  new ResponseEntity<>(visit, HttpStatus.OK);
    }

    @PostMapping("/preview")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<VisitDTO> getVisitPreview(@NonNull @RequestBody VisitDTO visit) {
        VisitDTO previewVisit = visitService.getVisitPreview(visit);
        return  new ResponseEntity<>(previewVisit, HttpStatus.CREATED);
    }

    @PostMapping
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<VisitDTO> createVisit(@NonNull @RequestBody VisitDTO visit) {
        VisitDTO createdVisit = visitService.createVisit(visit);
        return  new ResponseEntity<>(createdVisit, HttpStatus.CREATED);
    }

    /*@PutMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<VisitDTO> updateVisit(@PathVariable(value = "id") Long id, @NonNull @RequestBody VisitDTO visit) {
        VisitDTO saved = visitService.updateVisit(id, visit);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }*/

    @DeleteMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<Void> deleteVisit(@PathVariable(value = "id") Long id) {
        visitService.deleteVisitById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }


    @GetMapping("/search/voucher/{voucherId}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<VisitDTO>findVisitPaidByVoucher(@PathVariable(value = "voucherId") Long voucherId) {
        VisitDTO visit = visitService.findVisitPaidByVoucher(voucherId);
        return new ResponseEntity<>(visit, HttpStatus.OK);
    }

    @GetMapping("/search/debt-source/{visitId}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<VisitDTO>findByDebtSourceVisitId(@PathVariable(value = "visitId") Long visitId) {
        VisitDTO visit = visitService.findByDebtSourceVisitId(visitId);
        return new ResponseEntity<>(visit, HttpStatus.OK);
    }

    @GetMapping("/search/debt/{debtId}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<VisitDTO> getVisitByDebtSourceId(@PathVariable(value = "debtId") Long debtId) {
        VisitDTO visit = visitService.getVisitByDebtSourceId(debtId);
        return new ResponseEntity<>(visit, HttpStatus.OK);
    }

    @GetMapping("/search/review/{reviewId}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<VisitDTO>findVisitReviewId(@PathVariable(value = "reviewId") Long reviewId) {
        VisitDTO visit = visitService.findByReviewId(reviewId);
        return new ResponseEntity<>(visit, HttpStatus.OK);
    }

    @GetMapping("/count/client/{clientId}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<Long> countVisitsByClientId(@PathVariable(value = "clientId") Long clientId) {
        long count = visitService.countVisitsByClientId(clientId);
        return new ResponseEntity<>(count, HttpStatus.OK);
    }
}
