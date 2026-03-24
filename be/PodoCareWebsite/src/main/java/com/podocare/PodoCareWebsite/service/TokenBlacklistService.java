package com.podocare.PodoCareWebsite.service;

public interface TokenBlacklistService {

    void blacklist(String token, long remainingMs);

    boolean isBlacklisted(String token);

}
