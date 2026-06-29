import { Routes } from '@angular/router';
import { MainLayoutComponent } from '../../layout/main-layout/main-layout.component';
import { adminGuard, mustChangePasswordGuard, permissionGuard } from '../../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '', component: MainLayoutComponent, canActivate: [adminGuard, mustChangePasswordGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', canActivate: [permissionGuard], data: { permission: 'dashboard', permissionAction: 'view' }, loadComponent: () => import('../dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'reception', canActivate: [permissionGuard], data: { permission: 'appointments', permissionAction: 'view' }, loadComponent: () => import('../reception/reception-quick/reception-quick.component').then(m => m.ReceptionQuickComponent) },
      { path: 'patients', canActivate: [permissionGuard], data: { permission: 'patients', permissionAction: 'view' }, loadComponent: () => import('../patients/patient-list/patient-list.component').then(m => m.PatientListComponent) },
      { path: 'patients/:id', canActivate: [permissionGuard], data: { permission: 'patients', permissionAction: 'view' }, loadComponent: () => import('../patients/patient-360/patient-360.component').then(m => m.Patient360Component) },
      { path: 'doctors', canActivate: [permissionGuard], data: { permission: 'doctors', permissionAction: 'view' }, loadComponent: () => import('../doctors/doctor-list/doctor-list.component').then(m => m.DoctorListComponent) },
      { path: 'doctors/:id', canActivate: [permissionGuard], data: { permission: 'doctors', permissionAction: 'view' }, loadComponent: () => import('../doctors/doctor-profile/doctor-profile.component').then(m => m.DoctorProfileComponent) },
      { path: 'appointments', canActivate: [permissionGuard], data: { permission: 'appointments', permissionAction: 'view' }, loadComponent: () => import('../appointments/appointment-list/appointment-list.component').then(m => m.AppointmentListComponent) },
      { path: 'appointments/:id', canActivate: [permissionGuard], data: { permission: 'appointments', permissionAction: 'view' }, loadComponent: () => import('../appointments/appointment-detail/appointment-detail.component').then(m => m.AppointmentDetailComponent) },
      { path: 'calendar', canActivate: [permissionGuard], data: { permission: 'calendar', permissionAction: 'view' }, loadComponent: () => import('../calendar/calendar-view/calendar-view.component').then(m => m.CalendarViewComponent) },
      { path: 'queue', canActivate: [permissionGuard], data: { permission: 'queue', permissionAction: 'view' }, loadComponent: () => import('../queue/queue-dashboard/queue-dashboard.component').then(m => m.QueueDashboardComponent) },
      { path: 'consultation', canActivate: [permissionGuard], data: { permission: 'consultation', permissionAction: 'view' }, loadComponent: () => import('../consultation/consultation-list/consultation-list.component').then(m => m.ConsultationListComponent) },
      { path: 'consultation/new', canActivate: [permissionGuard], data: { permission: 'consultation', permissionAction: 'create' }, loadComponent: () => import('../consultation/consultation-form/consultation-form.component').then(m => m.ConsultationFormComponent) },
      { path: 'consultation/:id', canActivate: [permissionGuard], data: { permission: 'consultation', permissionAction: 'view' }, loadComponent: () => import('../consultation/consultation-hub/consultation-hub.component').then(m => m.ConsultationHubComponent) },
      { path: 'consultation/:id/edit', canActivate: [permissionGuard], data: { permission: 'consultation', permissionAction: 'edit' }, loadComponent: () => import('../consultation/consultation-form/consultation-form.component').then(m => m.ConsultationFormComponent) },
      { path: 'prescription', canActivate: [permissionGuard], data: { permission: 'prescription', permissionAction: 'view' }, loadComponent: () => import('../prescription/prescription-list/prescription-list.component').then(m => m.PrescriptionListComponent) },
      { path: 'lab', canActivate: [permissionGuard], data: { permission: 'lab', permissionAction: 'view' }, loadComponent: () => import('../lab/lab-list/lab-list.component').then(m => m.LabListComponent) },
      { path: 'radiology', canActivate: [permissionGuard], data: { permission: 'radiology', permissionAction: 'view' }, loadComponent: () => import('../radiology/radiology-list/radiology-list.component').then(m => m.RadiologyListComponent) },
      { path: 'billing', canActivate: [permissionGuard], data: { permission: 'billing', permissionAction: 'view' }, loadComponent: () => import('../billing/billing-list/billing-list.component').then(m => m.BillingListComponent) },
      { path: 'billing/payments', canActivate: [permissionGuard], data: { permission: 'billing', permissionAction: 'view' }, loadComponent: () => import('../billing/payment-list/payment-list.component').then(m => m.PaymentListComponent) },
      { path: 'billing/:id', canActivate: [permissionGuard], data: { permission: 'billing', permissionAction: 'view' }, loadComponent: () => import('../billing/billing-detail/billing-detail.component').then(m => m.BillingDetailComponent) },
      { path: 'insurance', canActivate: [permissionGuard], data: { permission: 'insurance', permissionAction: 'view' }, loadComponent: () => import('../insurance/insurance-list/insurance-list.component').then(m => m.InsuranceListComponent) },
      { path: 'reports', canActivate: [permissionGuard], data: { permission: 'reports', permissionAction: 'view' }, loadComponent: () => import('../reports/reports-dashboard/reports-dashboard.component').then(m => m.ReportsDashboardComponent) },
      { path: 'audit-logs', canActivate: [permissionGuard], data: { permission: 'reports', permissionAction: 'view' }, loadComponent: () => import('../audit/audit-log-list/audit-log-list.component').then(m => m.AuditLogListComponent) },
      { path: 'settings', canActivate: [permissionGuard], data: { permission: 'settings', permissionAction: 'view' }, loadComponent: () => import('../settings/settings-page/settings-page.component').then(m => m.SettingsPageComponent) },
      { path: 'lookups', canActivate: [permissionGuard], data: { permission: 'settings', permissionAction: 'view' }, loadComponent: () => import('../lookups/lookup-management/lookup-management.component').then(m => m.LookupManagementComponent) },
      { path: 'branches', canActivate: [permissionGuard], data: { permission: 'settings', permissionAction: 'view' }, loadComponent: () => import('../branches/branch-list/branch-list.component').then(m => m.BranchListComponent) },
      { path: 'permissions', canActivate: [permissionGuard], data: { permission: 'permissions', permissionAction: 'view' }, loadComponent: () => import('../permissions/permissions-page/permissions-page.component').then(m => m.PermissionsPageComponent) },
      { path: 'users', canActivate: [permissionGuard], data: { permission: 'users', permissionAction: 'view' }, loadComponent: () => import('../users/user-list/user-list.component').then(m => m.UserListComponent) },
      { path: 'profile', loadComponent: () => import('../profile/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'notifications', loadComponent: () => import('../notifications/notifications-page/notifications-page.component').then(m => m.NotificationsPageComponent) },
    ]
  }
];
