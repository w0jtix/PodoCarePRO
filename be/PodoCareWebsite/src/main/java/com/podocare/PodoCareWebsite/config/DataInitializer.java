package com.podocare.PodoCareWebsite.config;

import com.podocare.PodoCareWebsite.model.*;
import com.podocare.PodoCareWebsite.model.constants.RoleType;
import com.podocare.PodoCareWebsite.repo.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepo roleRepo;
    private final UserRepo userRepo;
    private final ProductCategoryRepo productCategoryRepo;
    private final AppSettingsRepo appSettingsRepo;
    private final StatSettingsRepo statSettingsRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedRoles();
        seedAdminUser();
        seedProductCategories();
        seedAppSettings();
        seedStatSettings();
    }

    private void seedRoles() {
        if (roleRepo.count() == 0) {
            roleRepo.save(Role.builder().name(RoleType.ROLE_USER).build());
            roleRepo.save(Role.builder().name(RoleType.ROLE_ADMIN).build());
        }
    }

    private void seedAdminUser() {
        if (!userRepo.existsByUsername("admin")) {
            Role adminRole = roleRepo.findByName(RoleType.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));
            Role userRole = roleRepo.findByName(RoleType.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("User role not found"));
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("Admin123"))
                    .roles(Set.of(adminRole, userRole))
                    .build();
            userRepo.save(admin);
        }
    }

    private void seedProductCategories() {
        if (productCategoryRepo.count() == 0) {
            productCategoryRepo.save(ProductCategory.builder().name("Produkty").color("0,255,4").build());
            productCategoryRepo.save(ProductCategory.builder().name("Narzędzia").color("255,200,0").build());
            productCategoryRepo.save(ProductCategory.builder().name("Użytkowe").color("0,163,245").build());
        }
    }

    private void seedAppSettings() {
        if (appSettingsRepo.count() == 0) {
            appSettingsRepo.save(AppSettings.builder().build());
        }
    }

    private void seedStatSettings() {
        if (statSettingsRepo.count() == 0) {
            statSettingsRepo.save(StatSettings.builder().build());
        }
    }
}
