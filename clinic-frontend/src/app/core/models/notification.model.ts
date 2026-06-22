export interface NotificationItem {
  id: number;
  type: string;
  titleKey: string;
  bodyKey: string;
  varsJson?: string;
  referenceType?: string;
  referenceId?: number;
  read: boolean;
  readAt?: string;
  createdAt?: string;
}
