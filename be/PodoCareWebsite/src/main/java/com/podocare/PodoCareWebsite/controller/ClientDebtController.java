package com.podocare.PodoCareWebsite.controller;

import com.podocare.PodoCareWebsite.DTO.ClientDebtDTO;
import com.podocare.PodoCareWebsite.DTO.request.DebtFilterDTO;
import com.podocare.PodoCareWebsite.service.ClientDebtService;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/client_debts")
public class ClientDebtController {
    private final ClientDebtService debtService;

    @PostMapping("/search")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<List<ClientDebtDTO>> getDebts(@RequestBody DebtFilterDTO filter) {
        List<ClientDebtDTO> debtDTOList = debtService.getDebts(filter);
        return new ResponseEntity<>(debtDTOList, debtDTOList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<ClientDebtDTO> getDebtById(@PathVariable(value = "id") Long id){
        ClientDebtDTO debt = debtService.getDebtById(id);
        return new ResponseEntity<>(debt, HttpStatus.OK);
    }

    @GetMapping("/visit/{visitId}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<ClientDebtDTO> getDebtBySourceVisitId(@PathVariable(value = "visitId") Long visitId){
        ClientDebtDTO debt = debtService.getDebtBySourceVisitId(visitId);
        return new ResponseEntity<>(debt, debt != null ? HttpStatus.OK : HttpStatus.NO_CONTENT);
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<List<ClientDebtDTO>> getUnpaidDebtsByClientId(@PathVariable(value = "clientId") Long id){
        List<ClientDebtDTO> debtDTOList = debtService.getUnpaidDebtsByClientId(id);
        return new ResponseEntity<>(debtDTOList, debtDTOList.isEmpty() ? HttpStatus.NO_CONTENT : HttpStatus.OK);
    }

    @PostMapping
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<ClientDebtDTO> createDebt(@NonNull @RequestBody ClientDebtDTO debt) {
        ClientDebtDTO newDebt = debtService.createDebt(debt);
        return new ResponseEntity<>(newDebt, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<ClientDebtDTO> updateDebt(@PathVariable(value = "id") Long id, @NonNull @RequestBody ClientDebtDTO debt){
        ClientDebtDTO saved = debtService.updateDebt(id, debt);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize(("hasRole('USER')"))
    public ResponseEntity<Void> deleteDebt(@PathVariable(value = "id") Long id) {
        debtService.deleteDebtById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
