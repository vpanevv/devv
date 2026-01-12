import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TeamsService } from '../../api/team.service';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-edit-team',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
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
            this.cdr.detectChanges();
            return;
        }

        this.load();
    }

    private load(): void {
        this.isLoading = true;

        this.teams.getById(this.teamId).subscribe({
            next: (t) => {
                this.form.patchValue({ name: t.name ?? '' });
                this.isLoading = false;

                // ако ти трябва ръчно:
                queueMicrotask(() => this.cdr.detectChanges());
            },
            error: (err) => {
                console.error(err);
                this.error = 'Failed to load team';
                this.isLoading = false;

                queueMicrotask(() => this.cdr.detectChanges());
            },
        });
    }

    submit(): void {
        this.error = null;

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const name = (this.form.value.name ?? '').trim();
        if (!name) {
            this.error = 'Team name is required';
            return;
        }

        this.isSaving = true;
        this.teams.updateTeam(this.teamId, { id: this.teamId, name }).subscribe({
            next: () => {
                this.isSaving = false;
                this.router.navigateByUrl('/standings');
            },
            error: (err) => {
                console.error(err);
                this.isSaving = false;
                this.error = 'Failed to update team';
            },
        });
    }
}