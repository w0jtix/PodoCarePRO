package com.podocare.PodoCareWebsite.service;

public interface LoginAttemptService {

    void recordFailure(String ip, String username);

    void recordSuccess(String ip, String username);

    boolean isBlocked(String ip, String username);

    boolean isShadowBanned(String ip, String username);

}
