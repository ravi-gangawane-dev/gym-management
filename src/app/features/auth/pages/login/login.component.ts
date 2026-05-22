import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../../core/services/auth.service';
import { BrandThemeService } from '../../../../core/services/brand-theme.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private brandTheme = inject(BrandThemeService);
  private toast = inject(ToastService);
  private router = inject(Router);
  theme = this.brandTheme.theme;
  showPassword = false;
  forgotMode = false;

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]],
    rememberMe: [false]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { email, password, rememberMe } = this.form.getRawValue();
    if (this.auth.login(email, password, undefined, rememberMe)) {
      this.toast.success('Login Success', `Welcome back, ${this.auth.currentUser()?.role ?? 'User'}`);
      this.router.navigateByUrl('/dashboard');
    } else {
      this.toast.error('Login Failed', 'Invalid credentials or role');
    }
  }

  sendReminder(): void {
    const email = this.form.controls.email.value;
    if (!email) {
      this.form.controls.email.markAsTouched();
      this.toast.error('Email Required', 'Enter your registered email first.');
      return;
    }

    if (this.auth.requestPasswordReminder(email)) {
      this.toast.success('Reminder Sent', 'Password reminder details have been sent to the registered contact.');
      this.forgotMode = false;
      return;
    }

    this.toast.error('Account Not Found', 'No account exists for this email.');
  }
}
