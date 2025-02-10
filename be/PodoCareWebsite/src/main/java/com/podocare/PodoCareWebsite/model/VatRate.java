package com.podocare.PodoCareWebsite.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Getter;


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

    @JsonValue
    public Object getJsonValue() {
        return rate;
    }

    public double getRate() {
        return (rate instanceof Number) ? ((Number) rate).doubleValue() : 0.0;
    }

    public boolean isNumeric() {
        return rate instanceof Number;
    }

    @JsonCreator
    public static VatRate fromValue(Object value) {
        if (value instanceof Integer) {
            for (VatRate rate : values()) {
                if (rate.rate instanceof Number && ((Number) rate.rate).intValue() == (Integer) value) {
                    return rate;
                }
            }
        } else if (value instanceof String) {

            for (VatRate rate : values()) {
                if (rate.rate.equals(value)) {
                    return rate;
                }
            }
        }
        throw new IllegalArgumentException("Unknown VAT rate: " + value);
    }
}
