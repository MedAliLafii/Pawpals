import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1055;">
      <div 
        *ngFor="let toast of toasts" 
        class="toast show" 
        [class]="getToastClasses(toast)"
        role="alert"
        [attr.aria-live]="toast.type === 'error' ? 'assertive' : 'polite'"
      >
        <div class="toast-header">
          <i [class]="getToastIcon(toast)"></i>
          <strong class="me-auto">{{ getToastTitle(toast) }}</strong>
          <button 
            type="button" 
            class="btn-close" 
            (click)="removeToast(toast.id)"
            aria-label="Close"
          ></button>
        </div>
        <div class="toast-body">
          {{ toast.message }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      max-width: 350px;
    }
    
    .toast {
      margin-bottom: 0.5rem;
    }
    
    .toast.success {
      border-left: 4px solid #28a745;
    }
    
    .toast.error {
      border-left: 4px solid #dc3545;
    }
    
    .toast.warning {
      border-left: 4px solid #ffc107;
    }
    
    .toast.info {
      border-left: 4px solid #17a2b8;
    }
    
    .toast-header i {
      margin-right: 0.5rem;
    }
  `]
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.getToasts().subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  removeToast(id: number): void {
    this.toastService.remove(id);
  }

  getToastClasses(toast: Toast): string {
    return `toast-${toast.type}`;
  }

  getToastIcon(toast: Toast): string {
    const icons = {
      success: 'fas fa-check-circle text-success',
      error: 'fas fa-exclamation-circle text-danger',
      warning: 'fas fa-exclamation-triangle text-warning',
      info: 'fas fa-info-circle text-info'
    };
    return icons[toast.type];
  }

  getToastTitle(toast: Toast): string {
    const titles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information'
    };
    return titles[toast.type];
  }
}
