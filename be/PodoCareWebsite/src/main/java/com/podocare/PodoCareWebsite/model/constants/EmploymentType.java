package com.podocare.PodoCareWebsite.model.constants;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EmploymentType {
    QUARTER(0.25),
    HALF(0.5),
    THREE_QUARTERS(0.75),
    FULL(1.0);

    private final double multiplier;
}
