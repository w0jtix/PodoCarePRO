-- ============================================
-- TESTOWE DANE WIZYT DO STATYSTYK
-- Uruchom w pgAdmin: Query Tool -> Execute (F5)
-- Usuniecie: uzyj pliku delete_test_visits.sql
-- ============================================

DO $$
DECLARE
    v_client_ids BIGINT[];
    v_employee_ids BIGINT[];
    v_product_ids BIGINT[];
    v_product_prices DOUBLE PRECISION[];
    v_product_names VARCHAR[];
    v_service_ids INT[] := ARRAY[7,8,9,10,11,12,13,14,15,16,17,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48];
    v_visit_id BIGINT;
    v_sale_id BIGINT;
    v_voucher_id BIGINT;
    v_date DATE;
    v_client_id BIGINT;
    v_employee_id BIGINT;
    v_service_id BIGINT;
    v_price DOUBLE PRECISION;
    v_service_name VARCHAR;
    v_service_duration INT;
    v_payment_method VARCHAR;
    v_is_vip BOOLEAN;
    v_is_boost BOOLEAN;
    v_has_sale BOOLEAN;
    v_has_voucher_sale BOOLEAN;
    v_product_id BIGINT;
    v_product_price DOUBLE PRECISION;
    v_product_name VARCHAR;
    v_sale_total DOUBLE PRECISION;
    v_visit_total DOUBLE PRECISION;
    v_voucher_value DOUBLE PRECISION;
    v_num_services INT;
    v_num_products INT;
    i INT;
    j INT;
    k INT;
    v_visits_per_day INT;
    v_total_visits INT := 0;
    v_total_sales INT := 0;
    v_total_vouchers INT := 0;
    v_total_services INT := 0;
BEGIN
    -- Pobierz istniejacych pracownikow
    SELECT ARRAY_AGG(id) INTO v_employee_ids FROM employee WHERE is_deleted = false;

    -- Pobierz istniejacych klientow
    SELECT ARRAY_AGG(id) INTO v_client_ids FROM client WHERE is_deleted = false;

    -- Pobierz produkty z cenami
    SELECT ARRAY_AGG(id), ARRAY_AGG(COALESCE(selling_price, 50.0)), ARRAY_AGG(name)
    INTO v_product_ids, v_product_prices, v_product_names
    FROM product WHERE is_deleted = false AND selling_price IS NOT NULL;

    -- Sprawdz czy mamy dane
    IF v_employee_ids IS NULL OR array_length(v_employee_ids, 1) IS NULL THEN
        RAISE EXCEPTION 'Brak pracownikow w bazie! Najpierw dodaj pracownikow.';
    END IF;

    IF v_client_ids IS NULL OR array_length(v_client_ids, 1) IS NULL THEN
        RAISE EXCEPTION 'Brak klientow w bazie! Najpierw dodaj klientow.';
    END IF;

    RAISE NOTICE 'Znaleziono % pracownikow, % klientow',
        array_length(v_employee_ids, 1),
        array_length(v_client_ids, 1);

    IF v_product_ids IS NOT NULL THEN
        RAISE NOTICE 'Znaleziono % produktow do sprzedazy', array_length(v_product_ids, 1);
    END IF;

    RAISE NOTICE 'Uzyje % roznych uslug (ID: 7-17, 22-48)', array_length(v_service_ids, 1);

    -- Generuj wizyty dla ostatnich 365 dni
    FOR i IN 0..364 LOOP
        v_date := CURRENT_DATE - i;

        -- Losowa liczba wizyt dziennie (3-7 w dni robocze, 1-3 w weekendy)
        IF EXTRACT(DOW FROM v_date) IN (0, 6) THEN
            v_visits_per_day := 1 + floor(random() * 3)::INT;
        ELSE
            v_visits_per_day := 3 + floor(random() * 5)::INT;
        END IF;

        FOR j IN 1..v_visits_per_day LOOP
            -- Losowy wybor klienta i pracownika
            v_client_id := v_client_ids[1 + floor(random() * array_length(v_client_ids, 1))::INT];
            v_employee_id := v_employee_ids[1 + floor(random() * array_length(v_employee_ids, 1))::INT];

            -- Losowa metoda platnosci
            v_payment_method := (ARRAY['CASH', 'CARD', 'BLIK', 'TRANSFER'])[1 + floor(random() * 4)::INT];

            -- VIP i boost (10% szansy)
            v_is_vip := random() < 0.1;
            v_is_boost := random() < 0.1;

            -- Ile uslug w wizycie (70% - 1 usluga, 20% - 2 uslugi, 10% - 3 uslugi)
            DECLARE
                v_rand DOUBLE PRECISION := random();
            BEGIN
                IF v_rand < 0.70 THEN
                    v_num_services := 1;
                ELSIF v_rand < 0.90 THEN
                    v_num_services := 2;
                ELSE
                    v_num_services := 3;
                END IF;
            END;

            -- Czy wizyta ma sprzedaz produktow (15% szansy)
            v_has_sale := random() < 0.15 AND v_product_ids IS NOT NULL AND array_length(v_product_ids, 1) > 0;

            -- Ile produktow sprzedanych (jesli jest sprzedaz: 60% - 1 produkt, 30% - 2, 10% - 3)
            IF v_has_sale THEN
                DECLARE
                    v_rand DOUBLE PRECISION := random();
                BEGIN
                    IF v_rand < 0.60 THEN
                        v_num_products := 1;
                    ELSIF v_rand < 0.90 THEN
                        v_num_products := 2;
                    ELSE
                        v_num_products := 3;
                    END IF;
                END;
            ELSE
                v_num_products := 0;
            END IF;

            -- Czy wizyta ma sprzedaz vouchera (5% szansy)
            v_has_voucher_sale := random() < 0.05;

            v_sale_id := NULL;
            v_sale_total := 0;
            v_visit_total := 0;

            -- Stworz Sale jesli jest sprzedaz produktow lub vouchera
            IF v_has_sale OR v_has_voucher_sale THEN
                INSERT INTO sale (total_net, total_vat, total_value)
                VALUES (0, 0, 0)
                RETURNING id INTO v_sale_id;

                -- Dodaj produkty do sprzedazy
                IF v_has_sale THEN
                    FOR k IN 1..v_num_products LOOP
                        DECLARE
                            v_prod_idx INT := 1 + floor(random() * array_length(v_product_ids, 1))::INT;
                        BEGIN
                            v_product_id := v_product_ids[v_prod_idx];
                            v_product_price := v_product_prices[v_prod_idx];
                            v_product_name := v_product_names[v_prod_idx];

                            INSERT INTO sale_item (product_id, voucher_id, name, net_value, vat_value, price, sale_id)
                            VALUES (
                                v_product_id,
                                NULL,
                                v_product_name,
                                ROUND((v_product_price / 1.23)::NUMERIC, 2),
                                ROUND((v_product_price - v_product_price / 1.23)::NUMERIC, 2),
                                v_product_price,
                                v_sale_id
                            );

                            v_sale_total := v_sale_total + v_product_price;
                            v_total_sales := v_total_sales + 1;
                        END;
                    END LOOP;
                END IF;

                -- Dodaj voucher do sprzedazy
                IF v_has_voucher_sale THEN
                    v_voucher_value := (ARRAY[50, 100, 150, 200, 250])[1 + floor(random() * 5)::INT]::DOUBLE PRECISION;

                    -- Stworz voucher
                    INSERT INTO voucher (value, issue_date, expiry_date, client_id, status)
                    VALUES (
                        v_voucher_value,
                        v_date,
                        v_date + INTERVAL '3 months',
                        v_client_id,
                        'ACTIVE'
                    )
                    RETURNING id INTO v_voucher_id;

                    -- Dodaj voucher jako sale_item
                    INSERT INTO sale_item (product_id, voucher_id, name, net_value, vat_value, price, sale_id)
                    VALUES (
                        NULL,
                        v_voucher_id,
                        'Voucher ' || v_voucher_value::INT || ' zl',
                        ROUND((v_voucher_value / 1.08)::NUMERIC, 2),
                        ROUND((v_voucher_value - v_voucher_value / 1.08)::NUMERIC, 2),
                        v_voucher_value,
                        v_sale_id
                    );

                    v_sale_total := v_sale_total + v_voucher_value;
                    v_total_vouchers := v_total_vouchers + 1;
                END IF;

                -- Aktualizuj sumy w sale
                UPDATE sale SET
                    total_value = v_sale_total,
                    total_net = ROUND((v_sale_total / 1.23)::NUMERIC, 2),
                    total_vat = ROUND((v_sale_total - v_sale_total / 1.23)::NUMERIC, 2)
                WHERE id = v_sale_id;
            END IF;

            -- Wstaw wizyte (najpierw z zerowym total, potem zaktualizujemy)
            INSERT INTO visit (
                client_id,
                employee_id,
                notes,
                receipt,
                is_boost,
                is_vip,
                delay_time,
                absence,
                date,
                payment_status,
                total_net,
                total_vat,
                total_value,
                sale_id
            ) VALUES (
                v_client_id,
                v_employee_id,
                '[TEST]',
                true,
                v_is_boost,
                v_is_vip,
                CASE WHEN random() < 0.15 THEN floor(random() * 20)::INT ELSE NULL END,
                false,
                v_date,
                'PAID',
                0,
                0,
                0,
                v_sale_id
            ) RETURNING id INTO v_visit_id;

            -- Wstaw visit_items (uslugi)
            FOR k IN 1..v_num_services LOOP
                -- Losowa usluga z tablicy dozwolonych ID
                v_service_id := v_service_ids[1 + floor(random() * array_length(v_service_ids, 1))::INT];

                -- Pobierz dane uslugi
                SELECT name, price, duration INTO v_service_name, v_price, v_service_duration
                FROM service WHERE id = v_service_id AND is_deleted = false;

                -- Jesli usluga nie istnieje, uzyj domyslnych wartosci
                IF v_service_name IS NULL THEN
                    v_service_name := 'Usluga podologiczna';
                    v_price := 80 + floor(random() * 120)::DOUBLE PRECISION;
                    v_service_duration := 30 + floor(random() * 60)::INT;
                    v_service_id := NULL;
                END IF;

                INSERT INTO visit_item (
                    service_id,
                    service_variant_id,
                    name,
                    duration,
                    price,
                    final_price,
                    boost_item,
                    visit_id
                ) VALUES (
                    v_service_id,
                    NULL,
                    v_service_name,
                    v_service_duration,
                    v_price,
                    v_price,
                    v_is_boost AND k = 1, -- tylko pierwsza usluga jako boost
                    v_visit_id
                );

                v_visit_total := v_visit_total + v_price;
                v_total_services := v_total_services + 1;
            END LOOP;

            -- Zaktualizuj sumy w visit
            UPDATE visit SET
                total_value = v_visit_total,
                total_net = ROUND((v_visit_total / 1.23)::NUMERIC, 2),
                total_vat = ROUND((v_visit_total - v_visit_total / 1.23)::NUMERIC, 2)
            WHERE id = v_visit_id;

            -- Wstaw payment dla wizyty (uslugi + sprzedaz)
            INSERT INTO payment (method, amount, voucher_id, visit_id)
            VALUES (v_payment_method, v_visit_total + COALESCE(v_sale_total, 0), NULL, v_visit_id);

            v_total_visits := v_total_visits + 1;

        END LOOP;
    END LOOP;

    RAISE NOTICE '============================================';
    RAISE NOTICE 'PODSUMOWANIE:';
    RAISE NOTICE 'Dodano % wizyt testowych', v_total_visits;
    RAISE NOTICE 'Dodano % uslug (visit_items)', v_total_services;
    RAISE NOTICE 'Dodano % sprzedazy produktow', v_total_sales;
    RAISE NOTICE 'Dodano % voucherow', v_total_vouchers;
    RAISE NOTICE '============================================';
END $$;

-- ============================================
-- PODSUMOWANIE (wyswietli sie po wykonaniu)
-- ============================================

SELECT 'WIZYTY TESTOWE' as kategoria,
       COUNT(*) as ilosc,
       MIN(date)::TEXT as od_daty,
       MAX(date)::TEXT as do_daty,
       ROUND(SUM(total_value)::NUMERIC, 2) as suma_wartosci
FROM visit WHERE notes = '[TEST]'

UNION ALL

SELECT 'USLUGI (visit_items)',
       COUNT(*),
       NULL,
       NULL,
       ROUND(SUM(final_price)::NUMERIC, 2)
FROM visit_item
WHERE visit_id IN (SELECT id FROM visit WHERE notes = '[TEST]')

UNION ALL

SELECT 'SPRZEDAZ PRODUKTOW',
       COUNT(*),
       NULL,
       NULL,
       ROUND(SUM(si.price)::NUMERIC, 2)
FROM sale_item si
JOIN sale s ON si.sale_id = s.id
WHERE si.product_id IS NOT NULL
  AND s.id IN (SELECT sale_id FROM visit WHERE notes = '[TEST]' AND sale_id IS NOT NULL)

UNION ALL

SELECT 'VOUCHERY SPRZEDANE',
       COUNT(*),
       NULL,
       NULL,
       ROUND(SUM(si.price)::NUMERIC, 2)
FROM sale_item si
JOIN sale s ON si.sale_id = s.id
WHERE si.voucher_id IS NOT NULL
  AND s.id IN (SELECT sale_id FROM visit WHERE notes = '[TEST]' AND sale_id IS NOT NULL);
