package com.clinicmanagement.shared.util;

public final class SearchQueryUtil {
    private SearchQueryUtil() {}

    /** Empty string means "no text filter" — avoids PostgreSQL lower(bytea) when binding null in CONCAT. */
    public static String normalize(String q) {
        return q == null || q.isBlank() ? "" : q.trim();
    }
}
