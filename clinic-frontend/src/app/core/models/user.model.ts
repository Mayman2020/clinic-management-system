export type UserRole =
  | 'ADMIN'
  | 'RECEPTIONIST'
  | 'DOCTOR'
  | 'NURSE'
  | 'LAB_TECHNICIAN'
  | 'RADIOLOGY_STAFF'
  | 'CASHIER';

export const USER_ROLE_VALUES: readonly UserRole[] = [
  'ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE', 'LAB_TECHNICIAN', 'RADIOLOGY_STAFF', 'CASHIER'
];

const USER_ROLE_CODE_SET = new Set<string>(USER_ROLE_VALUES as readonly string[]);

export function isUserRoleCode(code: string | null | undefined): code is UserRole {
  return !!code && USER_ROLE_CODE_SET.has(code);
}

export type PermissionAction =
  | 'enabled' | 'menu' | 'view' | 'create' | 'edit' | 'delete' | 'export' | 'approve';

export type ModulePermissions = Record<PermissionAction, boolean>;
export type PermissionMap = Record<string, ModulePermissions>;

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  fullNameAr?: string;
  fullNameEn?: string;
  phone?: string;
  profileImageUrl?: string;
  role: UserRole;
  extraRoles?: UserRole[];
  doctorId?: number;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
  permissions?: PermissionMap;
}

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  fullNameAr?: string;
  fullNameEn?: string;
  phone?: string;
  profileImageUrl?: string;
  role: UserRole;
  activeRole?: UserRole;
  extraRoles?: UserRole[];
  doctorId?: number;
  initials: string;
  permissions?: PermissionMap;
  mustChangePassword?: boolean;
}

export interface LoginRequest { username: string; password: string; }

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: number; email: string; username: string; fullName: string;
    fullNameAr?: string; fullNameEn?: string; profileImageUrl?: string;
    role: UserRole; extraRoles?: UserRole[]; doctorId?: number;
    permissions?: PermissionMap; mustChangePassword?: boolean;
  };
}
