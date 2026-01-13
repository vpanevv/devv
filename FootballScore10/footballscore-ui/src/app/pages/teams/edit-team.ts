import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamsService } from '../../api/team.service';
import { finalize } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-edit-team',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './edit-team.html',
    styleUrls: ['./edit-team.scss'],
})
export class EditTeamComponent implements OnInit {
    isLoading = true;
    isSaving = false;
    error: string | null = null;
    teamId!: number;

    form: FormGroup;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private teams: TeamsService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef
    ) {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        });
    }

    ngOnInit(): void {

        const idParam = this.route.snapshot.paramMap.get('id');
        this.teamId = Number(idParam);

        if (!this.teamId || Number.isNaN(this.teamId)) {
            this.error = 'Invalid team id';
            this.isLoading = false;
            return;
        }

        this.load();
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

        this.teams.updateTeam(this.teamId, { name })
            .pipe(finalize(() => {
                this.isSaving = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: () => {
                    this.error = null;
                    this.router.navigateByUrl('/standings')
                },
                error: (err) => {
                    console.error('API Error', err);

                    // при 400 често err.error е string от бекенда
                    if (err.status === 400) {
                        this.error = typeof err.error === 'string' ? err.error : 'Validation error';
                        return;
                    }

                    // ако е 500 и пак праща string message
                    this.error = typeof err.error === 'string' ? err.error : 'Failed to update team';
                }
            });
    }

    private load(): void {

        this.error = null;
        this.isLoading = true;
        this.cdr.detectChanges();

        this.teams.getById(this.teamId)
            .pipe(finalize(() => {
                this.isLoading = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: (t) => this.form.patchValue({ name: t.name ?? '' }),
                error: (err) => {
                    console.error(err);
                    this.error = 'Failed to load team';
                },
            });
    }

    cancel(): void {
        this.router.navigateByUrl('/standings');
    }


}