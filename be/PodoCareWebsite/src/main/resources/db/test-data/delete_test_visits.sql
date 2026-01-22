-- ============================================
-- USUWANIE TESTOWYCH DANYCH WIZYT
-- Uruchom w pgAdmin: Query Tool -> Execute (F5)
-- ============================================

DO $$
DECLARE
    v_visits_count INT;
    v_sales_count INT;
    v_vouchers_count INT;
    v_sale_ids BIGINT[];
    v_voucher_ids BIGINT[];
BEGIN
    -- Policz dane przed usunieciem
    SELECT COUNT(*) INTO v_visits_count FROM visit WHERE notes = '[TEST]';

    -- Zbierz ID sprzedazy powiazanych z testowymi wizytami
    SELECT ARRAY_AGG(sale_id) INTO v_sale_ids
    FROM visit
    WHERE notes = '[TEST]' AND sale_id IS NOT NULL;

    IF v_sale_ids IS NOT NULL THEN
        SELECT COUNT(*) INTO v_sales_count FROM unnest(v_sale_ids);

        -- Zbierz voucher_ids z tych sprzedazy (do pozniejszego usuniecia)
        SELECT ARRAY_AGG(voucher_id) INTO v_voucher_ids
        FROM sale_item
        WHERE sale_id = ANY(v_sale_ids) AND voucher_id IS NOT NULL;
    ELSE
        v_sales_count := 0;
    END IF;

    -- Policz vouchery z testowych sprzedazy
    IF v_voucher_ids IS NOT NULL THEN
        v_vouchers_count := array_length(v_voucher_ids, 1);
    ELSE
        v_vouchers_count := 0;
    END IF;

    RAISE NOTICE 'Znaleziono do usuniecia:';
    RAISE NOTICE '- % wizyt testowych', v_visits_count;
    RAISE NOTICE '- % sprzedazy', v_sales_count;
    RAISE NOTICE '- % voucherow', v_vouchers_count;

    IF v_visits_count = 0 THEN
        RAISE NOTICE 'Brak danych testowych do usuniecia.';
        RETURN;
    END IF;

    -- 1. Usun payments powiazane z testowymi wizytami
    DELETE FROM payment
    WHERE visit_id IN (SELECT id FROM visit WHERE notes = '[TEST]');
    RAISE NOTICE 'Usunieto payments';

    -- 2. Usun visit_items powiazane z testowymi wizytami
    DELETE FROM visit_item
    WHERE visit_id IN (SELECT id FROM visit WHERE notes = '[TEST]');
    RAISE NOTICE 'Usunieto visit_items';

    -- 3. Usun visit_discounts powiazane z testowymi wizytami
    DELETE FROM visit_discount
    WHERE visit_id IN (SELECT id FROM visit WHERE notes = '[TEST]');
    RAISE NOTICE 'Usunieto visit_discounts';

    -- 4. Usun debt_redemptions powiazane z testowymi wizytami
    DELETE FROM debt_redemption
    WHERE visit_id IN (SELECT id FROM visit WHERE notes = '[TEST]');
    RAISE NOTICE 'Usunieto debt_redemptions';

    -- 5. Usun sale_items (musi byc przed usunieciem voucherow!)
    IF v_sale_ids IS NOT NULL AND array_length(v_sale_ids, 1) > 0 THEN
        DELETE FROM sale_item WHERE sale_id = ANY(v_sale_ids);
        RAISE NOTICE 'Usunieto sale_items';
    END IF;

    -- 6. Usun wizyty testowe (to zwolni referencje do sale)
    DELETE FROM visit WHERE notes = '[TEST]';
    RAISE NOTICE 'Usunieto wizyty testowe';

    -- 7. Usun sales ktore byly powiazane z testowymi wizytami
    IF v_sale_ids IS NOT NULL AND array_length(v_sale_ids, 1) > 0 THEN
        DELETE FROM sale WHERE id = ANY(v_sale_ids);
        RAISE NOTICE 'Usunieto sales';
    END IF;

    -- 8. Usun vouchery stworzone w ramach testow
    IF v_voucher_ids IS NOT NULL AND array_length(v_voucher_ids, 1) > 0 THEN
        DELETE FROM voucher WHERE id = ANY(v_voucher_ids);
        RAISE NOTICE 'Usunieto vouchery testowe';
    END IF;

    RAISE NOTICE '============================================';
    RAISE NOTICE 'USUNIETO WSZYSTKIE DANE TESTOWE!';
    RAISE NOTICE '============================================';
END $$;

-- Weryfikacja - powinno zwrocic 0
SELECT 'Pozostale wizyty testowe: ' || COUNT(*)::TEXT as weryfikacja
FROM visit
WHERE notes = '[TEST]';
