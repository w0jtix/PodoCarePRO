package com.podocare.PodoCareWebsite.utils;

import jakarta.servlet.http.HttpServletRequest;
import lombok.experimental.UtilityClass;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Optional;

@UtilityClass
public class RequestContextUtils {

    private static final String[] IP_HEADERS = {
            "X-Forwarded-For",
            "X-Real-IP",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED",
            "HTTP_CLIENT_IP"
    };

    public static Optional<HttpServletRequest> getCurrentRequest() {
        return Optional.ofNullable(RequestContextHolder.getRequestAttributes())
                .filter(ServletRequestAttributes.class::isInstance)
                .map(ServletRequestAttributes.class::cast)
                .map(ServletRequestAttributes::getRequest);
    }

    public static String getClientIpAddress() {
        return getCurrentRequest()
                .map(RequestContextUtils::extractIpAddress)
                .orElse("UNKNOWN");
    }

    private static String getUserAgent() {
        return getCurrentRequest()
                .map(request -> request.getHeader("User-Agent"))
                .orElse("UNKNOWN");
    }

    public static String getSessionId() {
        return getCurrentRequest()
                .map(request -> {
                    if (request.getSession(false) != null) {
                        return request.getSession(false).getId();
                    }
                    return null;
                })
                .orElse("UNKNOWN");
    }

    public static String getDeviceType() {
        String userAgent = getUserAgent().toLowerCase();

        if (userAgent.contains("mobile") || userAgent.contains("android") || userAgent.contains("iphone")) {
            return "MOBILE";
        } else if (userAgent.contains("tablet") || userAgent.contains("ipad")) {
            return "TABLET";
        } else if (userAgent.contains("postman") || userAgent.contains("insomnia") || userAgent.contains("curl")) {
            return "API_CLIENT";
        } else if (!userAgent.equals("unknown")) {
            return "DESKTOP";
        }
        return "UNKNOWN";
    }

    public static String getBrowserName() {
        String userAgent = getUserAgent().toLowerCase();

        if (userAgent.contains("edg")) {
            return "Edge";
        } else if (userAgent.contains("chrome") && !userAgent.contains("edg")) {
            return "Chrome";
        } else if (userAgent.contains("firefox")) {
            return "Firefox";
        } else if (userAgent.contains("safari") && !userAgent.contains("chrome")) {
            return "Safari";
        } else if (userAgent.contains("opera") || userAgent.contains("opr")) {
            return "Opera";
        } else if (userAgent.contains("msie") || userAgent.contains("trident")) {
            return "Internet Explorer";
        }
        return "Unknown";
    }

    private static String extractIpAddress(HttpServletRequest request) {
        for (String header : IP_HEADERS) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                return ip.contains(",") ? ip.split(",")[0].trim() : ip;
            }
        }
        String remoteAddr = request.getRemoteAddr();
        return remoteAddr != null ? remoteAddr : "UNKNOWN";
    }
}
