package com.podocare.PodoCareWebsite.model.constants;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;


public enum VatRate {
    VAT_23(23),
    VAT_8(8),
    VAT_7(7),
    VAT_5(5),
    VAT_0(0),
    VAT_ZW("zw"),
    VAT_NP("np");

    private final Object rate;

    VatRate(Object rate) {
        this.rate = rate;
    }

    public double getRate() {
        return (rate instanceof Number) ? ((Number) rate).doubleValue() : 0.0;
    }

    public boolean isNumeric() {
        return rate instanceof Number;
    }

    @JsonCreator
    public static VatRate fromValue(Object value) {
        if (value instanceof String stringValue) {
            try  {
                return VatRate.valueOf(stringValue);
            } catch (IllegalArgumentException e) {
                for (VatRate rate : values()) {
                    if (rate.rate.equals(stringValue)) {
                        return rate;
                    }
                }
            }
        } else if (value instanceof Integer) {
            for (VatRate rate : values()) {
                if (rate.rate instanceof Number && ((Number) rate.rate).intValue() == (Integer) value) {
                    return rate;
                }
            }
        }
        throw new IllegalArgumentException("Unknown VAT rate: " + value);
    }
}
