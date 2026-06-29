import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AppConstants } from '../constants/app-constants';
import { ApiResponse } from '../models/api-response.model';

export interface Branch {
  id: number;
  branchCode: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface BranchContext {
  multiBranchEnabled: boolean;
  currentBranchId: number;
  currentBranchName: string;
  branches: Branch[];
}

const STORAGE_KEY = 'cm_branch_id';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private readonly context$ = new BehaviorSubject<BranchContext | null>(null);

  constructor(private readonly api: ApiService) {}

  get context(): BranchContext | null { return this.context$.value; }
  get multiBranchEnabled(): boolean { return this.context$.value?.multiBranchEnabled ?? false; }
  get currentBranchId(): number | null { return this.context$.value?.currentBranchId ?? null; }

  loadContext(): Observable<ApiResponse<BranchContext>> {
    return this.api.get<ApiResponse<BranchContext>>(AppConstants.API.BRANCHES_CONTEXT).pipe(
      tap((res) => {
        const ctx = res.data;
        if (!ctx) return;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (ctx.multiBranchEnabled && stored) {
          const id = Number(stored);
          const match = ctx.branches?.find((b) => b.id === id);
          if (match) {
            ctx.currentBranchId = match.id;
            ctx.currentBranchName = match.name;
          }
        }
        this.context$.next(ctx);
      })
    );
  }

  setBranch(branchId: number): void {
    const ctx = this.context$.value;
    if (!ctx) return;
    const branch = ctx.branches.find((b) => b.id === branchId);
    if (!branch) return;
    localStorage.setItem(STORAGE_KEY, String(branchId));
    this.context$.next({ ...ctx, currentBranchId: branch.id, currentBranchName: branch.name });
  }

  observeContext(): Observable<BranchContext | null> { return this.context$.asObservable(); }

  list(): Observable<ApiResponse<Branch[]>> {
    return this.api.get<ApiResponse<Branch[]>>(AppConstants.API.BRANCHES);
  }

  create(payload: Partial<Branch>): Observable<ApiResponse<Branch>> {
    return this.api.post<ApiResponse<Branch>>(AppConstants.API.BRANCHES, payload);
  }

  update(id: number, payload: Partial<Branch>): Observable<ApiResponse<Branch>> {
    return this.api.put<ApiResponse<Branch>>(AppConstants.API.BRANCH_BY_ID(id), payload);
  }
}
