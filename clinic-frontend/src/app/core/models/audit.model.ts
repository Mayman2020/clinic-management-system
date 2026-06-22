export interface AuditLog {
  id: number;
  userId?: number;
  action: string;
  entityType?: string;
  entityId?: number;
  details?: string;
  ipAddress?: string;
  createdAt?: string;
}
