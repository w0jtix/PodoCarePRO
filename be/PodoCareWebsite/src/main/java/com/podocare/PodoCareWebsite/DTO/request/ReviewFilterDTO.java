package com.podocare.PodoCareWebsite.DTO.request;

import com.podocare.PodoCareWebsite.model.constants.ReviewSource;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewFilterDTO {
    private String keyword;
    private ReviewSource source;
    private Boolean isUsed;
}
