package com.podocare.PodoCareWebsite.service;

import com.podocare.PodoCareWebsite.model.BonusParamsSnapshot;

import java.util.Optional;

public interface BonusParamsSnapshotService {

    void createMonthlySnapshots();

    Optional<BonusParamsSnapshot> getSnapshot(Long employeeId, int year, int month);
}
