package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.VoucherDTO;
import com.podocare.PodoCareWebsite.DTO.request.DebtFilterDTO;
import com.podocare.PodoCareWebsite.DTO.request.VoucherFilterDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.exceptions.UpdateException;
import com.podocare.PodoCareWebsite.model.AppSettings;
import com.podocare.PodoCareWebsite.model.Voucher;
import com.podocare.PodoCareWebsite.model.constants.VoucherStatus;
import com.podocare.PodoCareWebsite.repo.AppSettingsRepo;
import com.podocare.PodoCareWebsite.repo.SaleItemRepo;
import com.podocare.PodoCareWebsite.repo.VisitRepo;
import com.podocare.PodoCareWebsite.repo.VoucherRepo;
import com.podocare.PodoCareWebsite.service.AuditLogService;
import com.podocare.PodoCareWebsite.service.VoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import static java.util.Objects.isNull;

@Service
@RequiredArgsConstructor
public class VoucherServiceImpl  implements VoucherService {

    private final VoucherRepo voucherRepo;
    private final SaleItemRepo saleItemRepo;
    private final AppSettingsRepo settingsRepo;
    private final VisitRepo visitRepo;
    private final AuditLogService auditLogService;

    @Override
    public VoucherDTO getVoucherById(Long id) {
        return new VoucherDTO(voucherRepo.findOneById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher not found with given id: " + id)));
    }

    @Override
    public List<VoucherDTO> getVouchers(VoucherFilterDTO filter) {
        if(isNull(filter)) {
            filter = new VoucherFilterDTO();
        }

        return voucherRepo.findAllWithFilters(
                filter.getStatus(),
                filter.getKeyword()
                )
                .stream()
                .map(v -> {
                    Long visitId = visitRepo.findPurchaseVisitIdByVoucherId(v.getId());
                    return new VoucherDTO(v, visitId);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VoucherDTO createVoucher(VoucherDTO voucher) {
        try{
            AppSettings settings = settingsRepo.getSettings();
            if(voucher.getExpiryDate() == null && voucher.getIssueDate() !=null) {
                LocalDate expiryDate = voucher.getIssueDate().plusMonths(settings.getVoucherExpiryTime());
                voucher.setExpiryDate(expiryDate);
            }
            VoucherDTO savedDTO = new VoucherDTO(voucherRepo.save(voucher.toEntity()));
            auditLogService.logCreate("Voucher", savedDTO.getId(), "Voucher Klienta: " + savedDTO.getClient().getFirstName() + savedDTO.getClient().getLastName(), savedDTO);
            return savedDTO;
        } catch (Exception e) {
            throw new CreationException("Failed to create Voucher. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public VoucherDTO updateVoucher(Long id, VoucherDTO voucher) {
        try{
            VoucherDTO oldVoucherSnapshot = getVoucherById(id);
            voucher.setId(id);
            VoucherDTO savedDTO = new VoucherDTO(voucherRepo.save(voucher.toEntity()));
            auditLogService.logUpdate("Voucher", id, "Voucher Klienta: " + oldVoucherSnapshot.getClient().getFirstName() + oldVoucherSnapshot.getClient().getLastName(), oldVoucherSnapshot, savedDTO);
            return savedDTO;
        } catch (Exception e) {
            throw new UpdateException("Failed to update Voucher. Reason: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteVoucherById(Long id) {
        try{
            VoucherDTO voucherSnapshot = getVoucherById(id);
            voucherRepo.deleteById(id);
            auditLogService.logDelete("Voucher", id, "Voucher Klienta: " + voucherSnapshot.getClient().getFirstName() + voucherSnapshot.getClient().getLastName(), voucherSnapshot);
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Voucher. Reason: "+ e.getMessage(), e);
        }
    }

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void updateVoucherStatuses() {
        voucherRepo.findAll().forEach(voucher -> {
            VoucherStatus newStatus = recalculateStatus(voucher);
            if (voucher.getStatus() != newStatus) {
                voucher.setStatus(newStatus);
                voucherRepo.save(voucher);
            }
        });
    }

    public VoucherStatus recalculateStatus(Voucher voucher) {
        if (voucher.getStatus() == VoucherStatus.USED) return VoucherStatus.USED;
        if (voucher.getExpiryDate() != null && voucher.getExpiryDate().isBefore(LocalDate.now()))
            return VoucherStatus.EXPIRED;
        return VoucherStatus.ACTIVE;
    }

    @Override
    public Boolean hasSaleReference(Long voucherId) {
        return saleItemRepo.existsByVoucherId(voucherId);
    }
}
