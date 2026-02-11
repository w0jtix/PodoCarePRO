package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.DTO.UsageRecordDTO;
import com.podocare.PodoCareWebsite.DTO.request.UsageRecordFilterDTO;
import org.springframework.data.domain.Page;

import java.util.List;

public interface UsageRecordService {

    UsageRecordDTO getUsageRecordById(Long id);

    Page<UsageRecordDTO> getUsageRecords(UsageRecordFilterDTO filter, int page, int size);

    UsageRecordDTO createUsageRecord(UsageRecordDTO usageRecord);

    List<UsageRecordDTO> createUsageRecords(List<UsageRecordDTO> usageRecords);

    void deleteUsageRecordById(Long id);
}
