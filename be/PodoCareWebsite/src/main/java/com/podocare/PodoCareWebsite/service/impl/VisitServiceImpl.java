package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.DTO.*;
import com.podocare.PodoCareWebsite.DTO.DebtRedemptionDTO;
import com.podocare.PodoCareWebsite.DTO.request.VisitFilterDTO;
import com.podocare.PodoCareWebsite.exceptions.CreationException;
import com.podocare.PodoCareWebsite.exceptions.DeletionException;
import com.podocare.PodoCareWebsite.exceptions.ResourceNotFoundException;
import com.podocare.PodoCareWebsite.model.*;
import com.podocare.PodoCareWebsite.model.constants.*;
import com.podocare.PodoCareWebsite.repo.*;
import com.podocare.PodoCareWebsite.service.VisitService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import static java.util.Objects.isNull;
import static java.util.Objects.nonNull;

@Service
@RequiredArgsConstructor
public class VisitServiceImpl implements VisitService {

    private final VisitRepo visitRepo;
    private final ClientRepo clientRepo;
    private final EmployeeRepo employeeRepo;
    private final ReviewRepo reviewRepo;
    private final AppSettingsRepo appSettingsRepo;
    private final DiscountRepo discountRepo;
    private final ClientDebtRepo clientDebtRepo;
    private final DebtRedemptionRepo debtRedemptionRepo;
    private final VoucherRepo voucherRepo;
    private final PaymentRepo paymentRepo;
    private final ProductRepo productRepo;
    private final BaseServiceRepo baseServiceRepo;
    private final BaseServiceVariantRepo baseServiceVariantRepo;
    private final SaleItemRepo saleItemRepo;


    @Override
    public VisitDTO getVisitById(Long id) {
        return new VisitDTO(visitRepo.findOneById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found with given id: " + id)));
    }

    @Override
    public Page<VisitDTO> getVisits(VisitFilterDTO filter, int page, int size) {
        if(isNull(filter)) {
            filter = new VisitFilterDTO();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date"));

        LocalDate dateFrom = filter.getDateFrom() != null ? filter.getDateFrom() : LocalDate.of(1900, 1, 1);
        LocalDate dateTo = filter.getDateTo() != null ? filter.getDateTo() : LocalDate.of(2100, 12, 31);

        Page<Visit> visits = visitRepo.findAllWithFilters(
                filter.getClientIds(),
                filter.getServiceIds(),
                filter.getEmployeeIds(),
                filter.getIsBoost(),
                filter.getIsVip(),
                filter.getDelayed(),
                filter.getAbsence(),
                filter.getHasDiscount(),
                filter.getHasSale(),
                dateFrom,
                dateTo,
                filter.getPaymentStatus(),
                filter.getTotalValueFrom(),
                filter.getTotalValueTo(),
                        pageable);
        return visits.map(VisitDTO::new);
    }

    @Override
    public VisitDTO getVisitPreview(VisitDTO visit) {
        Client client = new Client();
        if(visit.getClient() != null) {
            client = clientRepo.findOneById(visit.getClient().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Client not found with given id: " + visit.getClient().getId()));
        }

        AppSettings appSettings = appSettingsRepo.getSettings();

        processVisitDiscounts(visit, client, appSettings, true);
        processDebtRedemptions(visit, client, true);
        processVisitItems(visit);
        processSale(visit, appSettings, true);

        calculateVisitTotals(visit, appSettings, true);
        previewPaymentStatus(visit);
        
        return visit;
    }

    @Override
    @Transactional
    public VisitDTO createVisit(VisitDTO visit) {
        try{
            Client client = clientRepo.findOneById(visit.getClient().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Client not found with given id: " + visit.getClient().getId()));

            AppSettings appSettings = appSettingsRepo.getSettings();

            Visit savedVisit = visitRepo.save(createBaseEntity(visit,  client));

            visit.setId(savedVisit.getId());

            processVisitDiscounts(visit, client, appSettings, false);
            processBoostFlag(visit, client); // w saleItem dodać oznaczenie BoostItem???
            processDebtRedemptions(visit, client, false);
            processVisitItems(visit);
            processSale(visit, appSettings, false);
            processPayments(visit);

            calculateVisitTotals(visit, appSettings, false);


            Visit updatedVisit = visitRepo.save(visit.toEntity());

            processPaymentStatus(savedVisit, appSettings);

            return new VisitDTO(updatedVisit);
        } catch (Exception e) {
            throw new CreationException("Failed to create Visit. Reason: " + e.getMessage(), e);
        }
    }

    /*@Override
    @Transactional
    public VisitDTO updateVisit(Long id, VisitDTO visitDTO) {
        try {
            Visit existingVisit = visitRepo.findOneById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Visit not found with given id: " + id));

            Client dtoClient = clientRepo.findOneById(visitDTO.getClient().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Client not found with given id: " + visitDTO.getClient().getId()));

            if(!Objects.equals(existingVisit.getClient(), dtoClient)) {
                throw new IllegalStateException("Client change forbidden. Create new Visit!");
            }
            if (!Objects.equals(existingVisit.getAbsence(), visitDTO.getAbsence())) {
                throw new IllegalStateException("Absence status change forbidden via updateVisit. Use dedicated function!");
            }

            if (!Objects.equals(existingVisit.getIsBoost(), visitDTO.getIsBoost())) {
                if (visitDTO.getIsBoost()) {
                    processBoostFlag(visitDTO, dtoClient);
                } else {
                    undoBoostFlag(existingVisit);
                }
            };
            AppSettings appSettings = appSettingsRepo.getSettings();


            processVisitDiscounts(existingVisit, visitDTO, dtoClient, appSettings, false, true);
            existingVisit.getServiceDiscounts().clear();

            processVisitItems(visitDTO);
            existingVisit.getItems().clear();









        } catch (Exception e) {
            throw new UpdateException("Failed to update Visit, Reason: " + e.getMessage(), e);
        }
    }*/

    @Override
    @Transactional
    public void deleteVisitById(Long id) {
        try {
            Visit existingVisit = visitRepo.findOneById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Visit not found with given id: " + id));

            undoSale(existingVisit);
            undoVoucherPayment(existingVisit);
            undoClientDebtRedemption(existingVisit);
            undoGoogleReviewAssignment(existingVisit);
            undoBoostFlag(existingVisit);
            if(existingVisit.getAbsence() || !isFullyPaid(existingVisit)) {
                checkIfDebtIsPaid(existingVisit);
                undoAbsenceFeeOrPartialPaymentFee(existingVisit);
            }
            removePayments(existingVisit);
            visitRepo.deleteById(id);
        } catch (Exception e) {
            throw new DeletionException("Failed to delete Visit, Reason: " + e.getMessage(), e);
        }
    }

    @Override
    public VisitDTO findVisitPaidByVoucher(Long voucherId) {
        return new VisitDTO(visitRepo.findByVoucherId(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found with given voucherId: " + voucherId)));
    }

    @Override
    public VisitDTO findByDebtSourceVisitId(Long visitId) {
        return new VisitDTO(visitRepo.findByDebtSourceVisitId(visitId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found with given visitId: " + visitId)));
    }

    @Override
    public VisitDTO getVisitByDebtSourceId(Long debtId) {
        return new VisitDTO(visitRepo.findByDebtSourceId(debtId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found with given debtId: " + debtId)));
    }

    @Override
    public VisitDTO findByReviewId(Long reviewId) {
        return new VisitDTO(visitRepo.findByReviewId(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Visit not found with given reviewId: " + reviewId)));
    }

    @Override
    public long countVisitsByClientId(Long clientId) {
        return visitRepo.countVisitsByClientId(clientId);
    }


    private void checkSaleItemVouchers(Visit visit) {
        if(!visit.getSale().getItems().isEmpty()) {
            for(SaleItem saleItem : visit.getSale().getItems()) {
                if(saleItem.getVoucher() != null && saleItem.getVoucher().getStatus() == VoucherStatus.USED) {
                    Visit visitPaidByVoucher = visitRepo.findByVoucherId(saleItem.getVoucher().getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Visit paid by used Voucher not found, voucherId: " + saleItem.getVoucher().getId()));
                    throw new IllegalStateException("Failed to delete Visit, Reason: Voucher from this Visit was used as Payment method for the Visit with Id:" + visitPaidByVoucher.getId());
                }
            }
        }
    }
    private boolean isFullyPaid(Visit visit) {
        double totalPaid = 0.0;
        for(Payment payment : visit.getPayments()) {
           totalPaid += payment.getAmount();
        }
        return totalPaid >= visit.getTotalValue();
    }
    private boolean isPartiallyPaid(Visit visit) {
        double totalPaid = 0.0;
        for(Payment payment : visit.getPayments()) {
            totalPaid += payment.getAmount();
        }
        return 0 < totalPaid && totalPaid < visit.getTotalValue();
    }
    private void checkIfDebtIsPaid(Visit visit) {

        Optional<Visit> visitWithPaidDebt = visitRepo.findByDebtSourceVisitId(visit.getId());

        if(visitWithPaidDebt.isPresent()) {
            ClientDebt debt = clientDebtRepo.findOneBySourceVisitId(visit.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Debt paid, but was not found in database. SourceVisitId: " + visit.getId()));

            throw new IllegalStateException(
                    "Failed to delete Visit, Reason: Debt(" + debt.getType() + ") from this Visit was redeemed during Visit with Id: "
                            + visitWithPaidDebt.get().getId()
            );
        }
    }

    private Double calculateVisitItemsTotalValue(VisitDTO visit, AppSettings settings, boolean preview) {
        Double totalValue = 0.0;
        for(VisitItemDTO item : visit.getItems()) {
            if(visit.getIsVip()) {
                double vipPrice = item.getFinalPrice() * (settings.getVisitVipRate() / 100.0);

                item.setFinalPrice(roundPrice(vipPrice));
            }
            if(preview && visit.getAbsence()){
                double absencePrice = item.getFinalPrice() * (settings.getVisitAbsenceRate() / 100.0);
                item.setFinalPrice(roundPrice(absencePrice));
            }
            totalValue += item.getFinalPrice();
        }

        return totalValue;
    }
    public void calculateVisitTotals(VisitDTO visit, AppSettings settings, boolean preview) {
        Double visitItemsTotalValue = calculateVisitItemsTotalValue(visit, settings,preview);
        Double visitItemsTotalNet = visitItemsTotalValue / (1 + (VatRate.VAT_8.getRate() / 100)); // all services Vat = 8%;
        Double visitItemsTotalVat = visitItemsTotalValue - visitItemsTotalNet;

        Double debtRedemptionsTotalValue = 0.0;
        Double debtRedemptionsTotalVat = 0.0;
        Double debtRedemptionsTotalNet = 0.0;
        if(!visit.getDebtRedemptions().isEmpty()) {
            for(DebtRedemptionDTO redemption : visit.getDebtRedemptions()) {
                debtRedemptionsTotalValue += redemption.getDebtSource().getValue();
                debtRedemptionsTotalNet += debtRedemptionsTotalValue / (1 + (VatRate.VAT_8.getRate() / 100)); // debts always have source in services
                debtRedemptionsTotalVat += debtRedemptionsTotalValue - debtRedemptionsTotalNet;
            }
        }

        Double saleTotalValue = nonNull(visit.getSale()) ? visit.getSale().getTotalValue() : 0.0;
        Double saleTotalVat = nonNull(visit.getSale()) ? visit.getSale().getTotalVat() : 0.0;
        Double saleTotalNet = nonNull(visit.getSale()) ? visit.getSale().getTotalNet() : 0.0;

        Double totalValue = visitItemsTotalValue + saleTotalValue + debtRedemptionsTotalValue;
        Double totalVat = visitItemsTotalVat + saleTotalVat + debtRedemptionsTotalVat;
        Double totalNet = visitItemsTotalNet + saleTotalNet + debtRedemptionsTotalNet;

        visit.setTotalValue(roundPrice(totalValue));
        visit.setTotalNet(roundPrice(totalNet));
        visit.setTotalVat(roundPrice(totalVat));
    }
    private void applyDiscountsToVisitItems(VisitDTO visit) {
        List<VisitDiscountDTO> sortedDiscounts = visit.getServiceDiscounts().stream()
                .sorted(Comparator.comparingInt(this::getDiscountPriority))
                .collect(Collectors.toList());

        sanitizeFinalPrices(visit);

        for (VisitItemDTO visitItem : visit.getItems()) {
            Double discountedPrice = visitItem.getPrice();
            if(visitItem.getFinalPrice() == null) {
                for (VisitDiscountDTO discount : sortedDiscounts) {
                    if (discount.getPercentageValue() == null) continue;

                    switch (discount.getType()) {

                        case CLIENT_DISCOUNT:
                            if(!visit.getIsVip()){
                                discountedPrice *= (1 - discount.getPercentageValue() / 100.0);
                            }
                            break;

                        case GOOGLE_REVIEW:
                            if(!visit.getAbsence()){
                                discountedPrice *= (1 - discount.getPercentageValue() / 100.0);
                            }
                            break;
                        case HAPPY_HOURS, CUSTOM:
                            if(!visit.getAbsence() && !visit.getIsVip()){
                                discountedPrice *= (1 - discount.getPercentageValue() / 100.0);
                            }
                            break;
                    }
                }
                visitItem.setFinalPrice(roundPrice(discountedPrice));
            }

        }
    }
    private int getDiscountPriority(VisitDiscountDTO discount) {
        return switch (discount.getType()) {
            case CLIENT_DISCOUNT -> 1;
            case HAPPY_HOURS -> 2;
            case GOOGLE_REVIEW -> 3;
            case CUSTOM -> 4;
        };
    }
    private void calculateSaleItemTotals(SaleItemDTO saleItem) {
        Double itemTotalPrice = roundPrice(saleItem.getPrice());
        Double netVal = saleItem.getProduct() != null ? itemTotalPrice / (1 + (saleItem.getProduct().getVatRate().getRate() / 100))
                : saleItem.getVoucher() != null ? itemTotalPrice / (1 + (VatRate.VAT_8.getRate() / 100))
                : itemTotalPrice / (1 + (VatRate.VAT_23.getRate() / 100));

        Double vatVal = itemTotalPrice - netVal;

        saleItem.setNetValue(netVal);
        saleItem.setVatValue(vatVal);
    }
    private void calculateSaleTotals(SaleDTO sale) {
        Double netVal = 0.0;
        Double vatVal = 0.0;
        Double total = 0.0;
        for(SaleItemDTO saleItem : sale.getItems()) {
            netVal += saleItem.getNetValue();
            vatVal  += saleItem.getVatValue();
            total += saleItem.getPrice();
        }
        sale.setTotalNet(roundPrice(netVal));
        sale.setTotalVat(roundPrice(vatVal));
        sale.setTotalValue(roundPrice(total));
    }



    private void processVisitDiscounts(VisitDTO visit, Client client, AppSettings settings, boolean preview) {
        if (visit.getServiceDiscounts() == null || visit.getServiceDiscounts().isEmpty() || (visit.getAbsence() && visit.getIsVip())) return;

        List<VisitDiscountDTO> validDiscounts = visit.getServiceDiscounts().stream()
                .filter(discount -> {
                    if (discount.getType() == VisitDiscountType.CUSTOM) {
                        return !visit.getAbsence() && !visit.getIsVip();
                    }
                    if (discount.getType() == VisitDiscountType.HAPPY_HOURS) {
                        return !visit.getAbsence() && !visit.getIsVip();
                    }
                    if (discount.getType() == VisitDiscountType.GOOGLE_REVIEW) {
                        return !visit.getAbsence();
                    }
                    if (discount.getType() == VisitDiscountType.CLIENT_DISCOUNT) {
                        return !visit.getIsVip();
                    }
                    return true;
                })
                .collect(Collectors.toList());

        visit.setServiceDiscounts(validDiscounts);

        for (VisitDiscountDTO discount : visit.getServiceDiscounts()) {
            switch (discount.getType()) {
                case CLIENT_DISCOUNT -> {

                    if (client.getDiscount().getId() != null) {
                        discount.setClientDiscountId(client.getDiscount().getId());
                        applyClientDiscount(discount, client);
                    } else {
                        throw new IllegalStateException("ClientDiscount Id missing!");
                    }

                }
                case HAPPY_HOURS -> {
                        discount.setPercentageValue(settings.getBooksyHappyHours());
                }
                case GOOGLE_REVIEW -> {
                            applyGoogleReviewDiscount(discount, client, settings, preview);
                }
                // case CUSTOM should have percentageValue already set
            }
        }
    }
    private void applyClientDiscount(VisitDiscountDTO discount, Client client) {
        Discount clientDiscount = discountRepo.findOneById(discount.getClientDiscountId())
                .orElseThrow(() -> new ResourceNotFoundException("ClientDiscount not found with id: " + discount.getClientDiscountId()));

        discount.setPercentageValue(clientDiscount.getPercentageValue());
        discount.setName(clientDiscount.getName());
    }
    private void applyGoogleReviewDiscount(VisitDiscountDTO discount, Client client, AppSettings settings, boolean preview) {
            Review review = reviewRepo.findFirstByClientIdAndSourceAndIsUsedFalse(client.getId(), ReviewSource.GOOGLE)
                    .orElseThrow(() -> new ResourceNotFoundException("No Active Review found with Client id: " + client.getId()));
            if(!preview) {
                review.setIsUsed(true);
                reviewRepo.save(review);
            }
            discount.setReviewId(review.getId());
            discount.setPercentageValue(settings.getGoogleReviewDiscount());
    }

    private void processBoostFlag(VisitDTO visit, Client client) {
        if (Boolean.TRUE.equals(visit.getIsBoost()) && !client.getBoostClient()) {
            client.setBoostClient(true);
            clientRepo.save(client);
        }
    }
    private void processDebtRedemptions(VisitDTO visit, Client client, boolean preview) {
        if (visit.getDebtRedemptions() == null || visit.getDebtRedemptions().isEmpty()) return;
        for (DebtRedemptionDTO redemption : visit.getDebtRedemptions()) {
            ClientDebt clientDebt = clientDebtRepo.findOneById(redemption.getDebtSource().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("ClientDebt not found with id: " + redemption.getDebtSource().getId()));

            if (!Objects.equals(clientDebt.getClient().getId(), client.getId()))
                throw new IllegalStateException("ClientDebt doesn't belong to provided Client.");

            if (clientDebt.getSourceVisit() != null) {
                Visit sourceVisit = visitRepo.findOneById(clientDebt.getSourceVisit().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Visit not found with id: " + clientDebt.getSourceVisit().getId()));
                if(!preview) {
                    sourceVisit.setPaymentStatus(PaymentStatus.PAID);
                    visitRepo.save(sourceVisit);
                }
            }
            if(!preview) {
                clientDebt.setPaymentStatus(PaymentStatus.PAID);
                clientDebtRepo.save(clientDebt);
            }
        }

    }
    private void processVisitItems(VisitDTO visit) {
        if (visit.getItems() == null) return;

        for (VisitItemDTO item : visit.getItems()) {
            BaseService service = baseServiceRepo.findOneById(item.getService().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("BaseService not found with given id: " + item.getService().getId()));

            Double price = service.getPrice();
            String name = service.getName();
            int duration = service.getDuration();

            if(item.getServiceVariant() != null) {
                BaseServiceVariant serviceVariant = baseServiceVariantRepo.findOneById(item.getServiceVariant().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("BaseService not found with given id: " + item.getServiceVariant().getId()));

                if(!baseServiceRepo.serviceHasVariant(service.getId(), serviceVariant.getId())) {
                    throw new IllegalStateException("Variant does not belong to the given service");
                }

                price = serviceVariant.getPrice();
                name = name + " " + serviceVariant.getName();
                duration = serviceVariant.getDuration();
            }

            item.setPrice(price);
            item.setName(name);
            item.setDuration(duration);
        }

        applyDiscountsToVisitItems(visit);
    }
    private void processSale(VisitDTO visit, AppSettings settings, boolean preview) {
        if (visit.getSale() == null) return;
        SaleDTO sale = visit.getSale();

        for (SaleItemDTO item : sale.getItems()) {
            if(!preview) {
                if (item.getProduct() != null) {
                    Product product = productRepo.findOneById(item.getProduct().getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + item.getProduct().getId()));
                    if(item.getPrice() == null) {
                        if(product.getSellingPrice() != null) {
                            item.setPrice(product.getSellingPrice());
                        } else {
                            throw new IllegalStateException("SaleItem Price not defined, Product sellingPrice not set either.");
                        }
                    }

                    item.setName(product.getName());
                    if(product.getSupply() < 1) {
                        throw new IllegalStateException("Product out of stock! ProductId: " + product.getId());
                    }
                    product.setSupply(product.getSupply() - 1);
                    productRepo.save(product);
                }

                if (item.getVoucher() != null) {
                    VoucherDTO voucher = item.getVoucher();
                    voucher.setClient(visit.getClient());
                    voucher.setIssueDate(LocalDate.from(visit.getDate()));
                    voucher.setValue(item.getPrice());
                    voucher.setStatus(VoucherStatus.ACTIVE);
                    voucher.setExpiryDate(
                            voucher.getIssueDate().plusMonths(settings.getVoucherExpiryTime())
                    );
                    Voucher savedVoucher = voucherRepo.save(voucher.toEntity());
                    voucher.setId(savedVoucher.getId());
                    if (item.getName() == null) item.setName("Voucher");
                }
            }
            calculateSaleItemTotals(item);
        }
        calculateSaleTotals(sale);
    }
    private void processPayments(VisitDTO visit) {
        if (visit.getPayments() == null || (visit.getPayments().isEmpty() && !visit.getAbsence())) {
            return;
        };

        Set<Long> usedVoucherIds = new HashSet<>();
        for (PaymentDTO payment : visit.getPayments()) {
            if (payment.getVoucher() != null) {
                if(usedVoucherIds.contains(payment.getVoucher().getId())) {
                    throw new IllegalStateException("Using same Voucher twice as Payment method is forbidden! VoucherId: " + payment.getVoucher().getId());
                }
                Voucher voucher = voucherRepo.findOneById(payment.getVoucher().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Voucher not found with id: " + payment.getVoucher().getId()));
                if (voucher.getStatus() == VoucherStatus.ACTIVE && voucher.getExpiryDate().isAfter(LocalDate.now())) {
                    voucher.setStatus(VoucherStatus.USED);
                    voucherRepo.save(voucher);
                    payment.setAmount(voucher.getValue());
                    payment.setMethod(PaymentMethod.VOUCHER);
                    usedVoucherIds.add(voucher.getId());
                }
            }
        }
    }
    private void processPaymentStatus(Visit visit, AppSettings settings) {
        Double visitTotalValue = visit.getTotalValue();
        Double clientPaid = visit.getPayments().stream()
                .mapToDouble(Payment::getAmount)
                .sum();
        if (clientPaid >= visitTotalValue) {
            visit.setPaymentStatus(PaymentStatus.PAID);
        } else if (clientPaid > 0 && clientPaid < visitTotalValue) {
            visit.setPaymentStatus(PaymentStatus.PARTIAL);
            ClientDebt clientDebt = ClientDebt.builder()
                    .client(visit.getClient())
                    .sourceVisit(visit)
                    .type(DebtType.PARTIAL_PAYMENT)
                    .value(roundPrice(visitTotalValue - clientPaid))
                    .createdAt(LocalDate.from(visit.getDate()))
                    .build();

            clientDebtRepo.save(clientDebt);
        } else {
            visit.setPaymentStatus(PaymentStatus.UNPAID);
            ClientDebt clientDebt = ClientDebt.builder()
                    .client(visit.getClient())
                    .sourceVisit(visit)
                    .type(visit.getAbsence() ? DebtType.ABSENCE_FEE : DebtType.UNPAID)
                    .value(
                            visit.getAbsence() ?
                                    ((settings.getVisitAbsenceRate() / 100.0)
                                    * calculateVisitItemsTotalValue(new VisitDTO(visit), settings, false))

                                    : visitTotalValue)
                    .createdAt(LocalDate.from(visit.getDate()))
                    .build();

            clientDebtRepo.save(clientDebt);
        }
        visitRepo.save(visit);
    }

    private void undoVoucherPayment(Visit visit) {
        for(Payment payment : visit.getPayments()){
            if(payment.getVoucher() != null) {
                Voucher voucher = voucherRepo.findOneById(payment.getVoucher().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Voucher (Payment method) not found with id: " + payment.getVoucher().getId()));
                if(voucher.getExpiryDate().isAfter(LocalDate.now())){
                    voucher.setStatus(VoucherStatus.ACTIVE);
                } else {
                    voucher.setStatus(VoucherStatus.EXPIRED);
                }
                voucherRepo.save(voucher);
            }
        }
    }
    private void undoClientDebtRedemption(Visit visit) {

        List<DebtRedemption> redemptions = visit.getDebtRedemptions();
        for(DebtRedemption redemption : redemptions) {
            ClientDebt clientDebt = clientDebtRepo.findOneById(redemption.getDebtSource().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Redeemed ClientDebt not found with id: " + redemption.getDebtSource().getId()));

            if (!Objects.equals(clientDebt.getClient().getId(), visit.getClient().getId()))
                throw new IllegalStateException("Redeemed ClientDebt doesn't belong to provided Client.");

            if (clientDebt.getSourceVisit() != null) {
                Visit sourceVisit = visitRepo.findOneById(clientDebt.getSourceVisit().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Visit not found with id: " + clientDebt.getSourceVisit().getId()));
                sourceVisit.setPaymentStatus(isPartiallyPaid(sourceVisit) ? PaymentStatus.PARTIAL : PaymentStatus.UNPAID);
                visitRepo.save(sourceVisit);
            }
            clientDebt.setPaymentStatus(PaymentStatus.UNPAID);
            clientDebtRepo.save(clientDebt);
        }
    }
    private void undoGoogleReviewAssignment(Visit visit) {
        for(VisitDiscount discount : visit.getServiceDiscounts()) {
            if(discount.getType().equals(VisitDiscountType.GOOGLE_REVIEW) && discount.getReviewId() != null) {
                Review review = reviewRepo.findOneById(discount.getReviewId())
                        .orElseThrow(() -> new ResourceNotFoundException("Review not found with id: " + discount.getReviewId()));
                if (review.getSource() == ReviewSource.GOOGLE
                        && Objects.equals(review.getClient().getId(), visit.getClient().getId())) {
                    review.setIsUsed(false);
                    reviewRepo.save(review);
                }
            }
        }
    }
    private void undoBoostFlag(Visit visit) {
        if (Boolean.TRUE.equals(visit.getIsBoost()) && visit.getClient().getBoostClient()) {
            Client client = clientRepo.findOneById(visit.getClient().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + visit.getClient().getId()));
            client.setBoostClient(false);
            clientRepo.save(client);
        }
    }
    private void undoAbsenceFeeOrPartialPaymentFee(Visit visit) {
        ClientDebt clientDebt = clientDebtRepo.findOneBySourceVisitId(visit.getId())
                .orElseThrow(() -> new ResourceNotFoundException("ClientDebt not found with sourceVisitId: " + visit.getId()));

        clientDebtRepo.delete(clientDebt);
    }
    private void undoSale(Visit visit) {
        Sale sale = visit.getSale();
        if (sale == null) return;

        for (Iterator<SaleItem> it = sale.getItems().iterator(); it.hasNext();) {
            SaleItem item = it.next();

            if (item.getVoucher() != null) {
                Voucher voucher = voucherRepo.findOneById(item.getVoucher().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Voucher not found with id: " + item.getVoucher().getId()));
                checkSaleItemVouchers(visit);
                voucherRepo.delete(voucher);
            }

            if (item.getProduct() != null) {
                Product product = productRepo.findOneById(item.getProduct().getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + item.getProduct().getId()));

                if (product.getIsDeleted()) {
                    product.restore(1);
                } else {
                    product.setSupply(product.getSupply() + 1);
                }
                productRepo.save(product);
            }

            it.remove();
        }

        visit.setSale(null);
    }
    private void removePayments(Visit visit) {
        if(visit.getPayments().isEmpty()) return;
        for (Iterator<Payment> it = visit.getPayments().iterator(); it.hasNext();) {
            Payment payment = it.next();
            paymentRepo.delete(payment);
            it.remove();
        }
    }

    private Visit createBaseEntity(VisitDTO visit, Client client) {
        Employee employee = employeeRepo.findOneById(visit.getEmployee().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with given id: " + visit.getEmployee().getId()));

        return Visit.builder()
                .client(client)
                .employee(employee)
                .notes(visit.getNotes())
                .receipt(visit.getReceipt() != null ? visit.getReceipt() : true)
                .isBoost(visit.getIsBoost())
                .isVip(visit.getIsVip())
                .delayTime(visit.getDelayTime())
                .absence(visit.getAbsence())
                .date(visit.getDate())
                .paymentStatus(PaymentStatus.UNPAID)
                .serviceDiscounts(new ArrayList<>())
                .items(new ArrayList<>())
                .debtRedemptions(new ArrayList<>())
                .payments(new ArrayList<>())
                .build();
    }
    private void previewPaymentStatus(VisitDTO visit) {
        Double visitTotalValue = visit.getTotalValue();
        Double clientPaid = visit.getPayments().stream()
                .mapToDouble(PaymentDTO::getAmount)
                .sum();
        if (clientPaid >= visitTotalValue) {
            visit.setPaymentStatus(PaymentStatus.PAID);
        } else if (clientPaid > 0 && clientPaid < visitTotalValue) {
            visit.setPaymentStatus(PaymentStatus.PARTIAL);
        } else {
            visit.setPaymentStatus(PaymentStatus.UNPAID);
        }
    }
    private double roundPrice(Double price) {
        return BigDecimal
                .valueOf(price)
                .setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
    private void sanitizeFinalPrices(VisitDTO visit) {

        boolean forbidden = visit.getAbsence() || visit.getIsVip();

        for (VisitItemDTO item : visit.getItems()) {
            if (forbidden) {
                item.setFinalPrice(null);
            }
        }
    }
}
