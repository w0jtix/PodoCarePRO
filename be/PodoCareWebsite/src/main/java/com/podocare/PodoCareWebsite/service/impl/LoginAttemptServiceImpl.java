package com.podocare.PodoCareWebsite.service.impl;

import com.podocare.PodoCareWebsite.service.AuditLogService;
import com.podocare.PodoCareWebsite.service.LoginAttemptService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class LoginAttemptServiceImpl implements LoginAttemptService {

    private static final String ATTEMPTS_IP_PREFIX      = "login:attempts:ip:";
    private static final String ATTEMPTS_USER_PREFIX    = "login:attempts:username:";
    private static final String BLOCK_IP_PREFIX         = "login:block:ip:";
    private static final String BLOCK_USER_PREFIX       = "login:block:username:";
    private static final String SHADOWBAN_IP_PREFIX     = "login:shadowban:ip:";
    private static final String SHADOWBAN_USER_PREFIX   = "login:shadowban:username:";

    private static final int  BLOCK_THRESHOLD      = 5;
    private static final int  SHADOWBAN_THRESHOLD  = 10;
    private static final long BLOCK_DURATION_MS    = 3 * 60 * 1000L;
    private static final long SHADOWBAN_DURATION_H = 24L;

    private final StringRedisTemplate redisTemplate;
    private final AuditLogService auditLogService;

    @Override
    public void recordFailure(String ip, String username) {
        long ipCount   = incrementCounter(ATTEMPTS_IP_PREFIX + ip);
        long userCount = incrementCounter(ATTEMPTS_USER_PREFIX + username);

        if (ipCount >= SHADOWBAN_THRESHOLD || userCount >= SHADOWBAN_THRESHOLD) {
            redisTemplate.opsForValue().set(SHADOWBAN_IP_PREFIX + ip, "1", SHADOWBAN_DURATION_H, TimeUnit.HOURS);
            redisTemplate.opsForValue().set(SHADOWBAN_USER_PREFIX + username, "1", SHADOWBAN_DURATION_H, TimeUnit.HOURS);
            auditLogService.logCreate("Security-ShadowBan", 0L, username,
                    Map.of("ip", ip, "username", username, "ipAttempts", ipCount, "userAttempts", userCount));
        } else if (ipCount == BLOCK_THRESHOLD || userCount == BLOCK_THRESHOLD) {
            redisTemplate.opsForValue().set(BLOCK_IP_PREFIX + ip, "1", BLOCK_DURATION_MS, TimeUnit.MILLISECONDS);
            redisTemplate.opsForValue().set(BLOCK_USER_PREFIX + username, "1", BLOCK_DURATION_MS, TimeUnit.MILLISECONDS);
            auditLogService.logCreate("Security-Block", 0L, username,
                    Map.of("ip", ip, "username", username, "ipAttempts", ipCount, "userAttempts", userCount));
        }
    }

    @Override
    public void recordSuccess(String ip, String username) {
        redisTemplate.delete(ATTEMPTS_IP_PREFIX + ip);
        redisTemplate.delete(ATTEMPTS_USER_PREFIX + username);
        redisTemplate.delete(BLOCK_IP_PREFIX + ip);
        redisTemplate.delete(BLOCK_USER_PREFIX + username);
    }

    @Override
    public boolean isBlocked(String ip, String username) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(BLOCK_IP_PREFIX + ip)) ||
               Boolean.TRUE.equals(redisTemplate.hasKey(BLOCK_USER_PREFIX + username));
    }

    @Override
    public boolean isShadowBanned(String ip, String username) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(SHADOWBAN_IP_PREFIX + ip)) ||
               Boolean.TRUE.equals(redisTemplate.hasKey(SHADOWBAN_USER_PREFIX + username));
    }

    private long incrementCounter(String key) {
        Long count = redisTemplate.opsForValue().increment(key);
        if (count != null && count == 1) {
            redisTemplate.expire(key, 24, TimeUnit.HOURS);
        }
        return count != null ? count : 0;
    }
}
