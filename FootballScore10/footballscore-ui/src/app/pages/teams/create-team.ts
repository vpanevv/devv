import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamsService } from '../../api/team.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-create-team',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './create-team.html',
    styleUrls: ['./create-team.scss']
})
export class CreateTeamComponent {
    isSaving = false;
    error: string | null = null;
    form: FormGroup;

    constructor(
        private teamsService: TeamsService,
        private fb: FormBuilder,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]]
        });
    }

    cancel(): void {
        this.router.navigateByUrl('/standings');
    }

    submit(): void {
        this.error = null;

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const name = ((this.form.value as any).name ?? '').trim();
        if (!name) {
            this.error = 'Team name is required';
            return;
        }

        this.isSaving = true;
        this.cdr.detectChanges();

        this.teamsService.createTeam({ name })
            .pipe(
                finalize(() => {
                    this.isSaving = false;
                    this.cdr.detectChanges();
                })
            )
            .subscribe({
                next: () => {
                    this.isSaving = false;
                    this.cdr.detectChanges();
                    this.router.navigateByUrl('/standings');
                },
                error: (err) => {
                    console.error('API Error', err);

                    this.isSaving = false;

                    if (err.status === 400) {
                        this.error = typeof err.error === 'string' ? err.error : 'Validation error';
                    } else {
                        this.error = 'Failed to create team';
                    }

                    this.cdr.detectChanges();
                }
            });
    }
}