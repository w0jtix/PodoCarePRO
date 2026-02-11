package com.podocare.PodoCareWebsite.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.podocare.PodoCareWebsite.DTO.AuditLogDTO;
import com.podocare.PodoCareWebsite.config.security.services.UserDetailsImpl;
import com.podocare.PodoCareWebsite.DTO.request.AuditLogFilterDTO;
import com.podocare.PodoCareWebsite.exceptions.AuditException;
import com.podocare.PodoCareWebsite.model.AuditLog;
import com.podocare.PodoCareWebsite.model.constants.AuditAction;
import com.podocare.PodoCareWebsite.repo.AuditLogRepo;
import com.podocare.PodoCareWebsite.service.AuditLogService;
import com.podocare.PodoCareWebsite.utils.SessionUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static java.util.Objects.isNull;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepo auditLogRepo;
    private final ObjectMapper objectMapper;

    @Override
    public <T> void logCreate(String entityType, Long entityId,String entityKeyTrait, T newEntity) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .entityKeyTrait(entityKeyTrait)
                    .action(AuditAction.CREATE)
                    .performedBy(getCurrentUsername())
                    .timestamp(LocalDateTime.now())
                    .oldValue(null)
                    .newValue(toJson(newEntity))
                    .changedFields(null)
                    .build();

            auditLogRepo.save(auditLog);
        } catch (AuditException e) {
            throw e;
        } catch (Exception e) {
            throw new AuditException("Failed to save audit log for CREATE on " + entityType, e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public <T> void logUpdate(String entityType, Long entityId,String entityKeyTrait, T oldEntity, T newEntity) {
        try {
            Map<String, Object> oldMap = objectMapper.convertValue(oldEntity, Map.class);
            Map<String, Object> newMap = objectMapper.convertValue(newEntity, Map.class);

            boolean useSmartListCompare = ENTITIES_WITH_SMART_LIST_COMPARE.contains(entityType);

            Map<String, Object> filteredOld = new LinkedHashMap<>();
            Map<String, Object> filteredNew = new LinkedHashMap<>();
            List<String> changedFields = new ArrayList<>();

            for (String key : newMap.keySet()) {
                Object oldVal = oldMap.get(key);
                Object newVal = newMap.get(key);

                if (!areValuesEqual(oldVal, newVal, useSmartListCompare)) {
                    changedFields.add(key);

                    if (useSmartListCompare && oldVal instanceof List && newVal instanceof List) {
                        List<Object> filteredOldList = new ArrayList<>();
                        List<Object> filteredNewList = new ArrayList<>();
                        filterUnchangedListItems((List<Object>) oldVal, (List<Object>) newVal, filteredOldList, filteredNewList);
                        filteredOld.put(key, filteredOldList);
                        filteredNew.put(key, filteredNewList);
                    } else {
                        filteredOld.put(key, oldVal);
                        filteredNew.put(key, newVal);
                    }
                }
            }

            if (changedFields.isEmpty()) {
                return;
            }

            String oldJson = toJson(filteredOld);
            String newJson = toJson(filteredNew);

            AuditLog auditLog = AuditLog.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .entityKeyTrait(entityKeyTrait)
                    .action(AuditAction.UPDATE)
                    .performedBy(getCurrentUsername())
                    .timestamp(LocalDateTime.now())
                    .oldValue(oldJson)
                    .newValue(newJson)
                    .changedFields(String.join(",", changedFields))
                    .build();

            auditLogRepo.save(auditLog);
        } catch (AuditException e) {
            throw e;
        } catch (Exception e) {
            throw new AuditException("Failed to save audit log for UPDATE on " + entityType, e);
        }
    }

    @Override
    public <T> void logDelete(String entityType, Long entityId,String entityKeyTrait, T deletedEntity) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .entityKeyTrait(entityKeyTrait)
                    .action(AuditAction.DELETE)
                    .performedBy(getCurrentUsername())
                    .timestamp(LocalDateTime.now())
                    .oldValue(toJson(deletedEntity))
                    .newValue(null)
                    .changedFields(null)
                    .build();

            auditLogRepo.save(auditLog);
        } catch (AuditException e) {
            throw e;
        } catch (Exception e) {
            throw new AuditException("Failed to save audit log for DELETE on " + entityType, e);
        }
    }

    @Override
    public Page<AuditLogDTO> getAuditLogs(AuditLogFilterDTO filter, int page, int size) {
        if (isNull(filter)) {
            filter = new AuditLogFilterDTO();
        }

        LocalDateTime dateFrom = filter.getDateFrom() != null
                ? filter.getDateFrom().atStartOfDay()
                : LocalDateTime.of(1900, 1, 1, 0, 0);
        LocalDateTime dateTo = filter.getDateTo() != null
                ? filter.getDateTo().atTime(23, 59, 59)
                : LocalDateTime.now();

        Pageable pageable = PageRequest.of(page, size);

        Page<AuditLog> logs = auditLogRepo.findAllWithFilters(
                filter.getEntityType(),
                filter.getAction(),
                filter.getPerformedBy(),
                filter.getKeyword(),
                dateFrom,
                dateTo,
                pageable
        );
        return logs.map(AuditLogDTO::new);
    }

    private String getCurrentUsername() {
        UserDetailsImpl userDetails = SessionUtils.getUserDetailsFromSession();
        if (userDetails != null) {
            return userDetails.getUsername();
        }
        return "SYSTEM";
    }

    private <T> String toJson(T entity) {
        try {
            return objectMapper.writeValueAsString(entity);
        } catch (JsonProcessingException e) {
            throw new AuditException("Failed to serialize entity to JSON", e);
        }
    }

    private static final Set<String> ENTITIES_WITH_SMART_LIST_COMPARE = Set.of("Order", "CompanyExpense");

    @SuppressWarnings("unchecked")
    private boolean areValuesEqual(Object oldVal, Object newVal, boolean useSmartListCompare) {
        if (Objects.equals(oldVal, newVal)) {
            return true;
        }

        if (useSmartListCompare && oldVal instanceof List && newVal instanceof List) {
            return areListsEqual((List<Object>) oldVal, (List<Object>) newVal);
        }

        return false;
    }

    @SuppressWarnings("unchecked")
    private boolean areListsEqual(List<Object> oldList, List<Object> newList) {
        if (oldList.size() != newList.size()) {
            return false;
        }

        List<Map<String, Object>> normalizedOld = normalizeList(oldList);
        List<Map<String, Object>> normalizedNew = normalizeList(newList);

        return normalizedOld.equals(normalizedNew);
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> normalizeList(List<Object> list) {
        return list.stream()
                .filter(item -> item instanceof Map)
                .map(item -> {
                    Map<String, Object> map = new LinkedHashMap<>((Map<String, Object>) item);
                    map.remove("id");
                    map.remove("isDeleted");
                    return map;
                })
                .sorted((a, b) -> {
                    Object aProductId = extractProductId(a);
                    Object bProductId = extractProductId(b);
                    if (aProductId instanceof Comparable && bProductId instanceof Comparable) {
                        return ((Comparable) aProductId).compareTo(bProductId);
                    }
                    return 0;
                })
                .collect(java.util.stream.Collectors.toList());
    }

    private Object extractProductId(Map<String, Object> item) {
        Object product = item.get("product");
        if (product instanceof Map) {
            return ((Map<?, ?>) product).get("id");
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private void filterUnchangedListItems(List<Object> oldListObj, List<Object> newListObj,
                                          List<Object> filteredOldResult, List<Object> filteredNewResult) {
        // Normalize items (remove id) and count occurrences
        Map<Map<String, Object>, Integer> oldCounts = new LinkedHashMap<>();
        Map<Map<String, Object>, Integer> newCounts = new LinkedHashMap<>();

        // Keep original items mapped by their normalized version
        Map<Map<String, Object>, List<Map<String, Object>>> oldOriginals = new LinkedHashMap<>();
        Map<Map<String, Object>, List<Map<String, Object>>> newOriginals = new LinkedHashMap<>();

        for (Object item : oldListObj) {
            if (item instanceof Map) {
                Map<String, Object> original = new LinkedHashMap<>((Map<String, Object>) item);
                Map<String, Object> normalized = new LinkedHashMap<>(original);
                normalized.remove("id");
                normalized.remove("isDeleted");

                oldCounts.merge(normalized, 1, Integer::sum);
                oldOriginals.computeIfAbsent(normalized, k -> new ArrayList<>()).add(original);
            }
        }

        for (Object item : newListObj) {
            if (item instanceof Map) {
                Map<String, Object> original = new LinkedHashMap<>((Map<String, Object>) item);
                Map<String, Object> normalized = new LinkedHashMap<>(original);
                normalized.remove("id");
                normalized.remove("isDeleted");

                newCounts.merge(normalized, 1, Integer::sum);
                newOriginals.computeIfAbsent(normalized, k -> new ArrayList<>()).add(original);
            }
        }

        // Find all unique normalized items
        Set<Map<String, Object>> allNormalized = new LinkedHashSet<>();
        allNormalized.addAll(oldCounts.keySet());
        allNormalized.addAll(newCounts.keySet());

        for (Map<String, Object> normalized : allNormalized) {
            int oldCount = oldCounts.getOrDefault(normalized, 0);
            int newCount = newCounts.getOrDefault(normalized, 0);

            if (oldCount != newCount) {
                // There's a difference - add appropriate number of items
                List<Map<String, Object>> oldItems = oldOriginals.getOrDefault(normalized, Collections.emptyList());
                List<Map<String, Object>> newItems = newOriginals.getOrDefault(normalized, Collections.emptyList());

                if (newCount > oldCount) {
                    // Items were added - show only the added ones
                    for (int i = oldCount; i < newCount; i++) {
                        filteredNewResult.add(newItems.get(i));
                    }
                } else {
                    // Items were removed - show only the removed ones
                    for (int i = newCount; i < oldCount; i++) {
                        filteredOldResult.add(oldItems.get(i));
                    }
                }
            }
        }
    }
}
