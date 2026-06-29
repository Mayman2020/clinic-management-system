package com.clinicmanagement.shared.branch;

public final class BranchContextHolder {
    private static final ThreadLocal<Long> CURRENT = new ThreadLocal<>();

    private BranchContextHolder() {}

    public static void set(Long branchId) { CURRENT.set(branchId); }
    public static Long get() { return CURRENT.get(); }
    public static void clear() { CURRENT.remove(); }
}
