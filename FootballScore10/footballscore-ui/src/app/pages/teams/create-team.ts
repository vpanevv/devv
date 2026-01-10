import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamsService } from '../../api/team.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
        private router: Router
    ) {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]]
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

        this.teamsService.createTeam({ name }).subscribe({
            next: (createdTeam) => {
                console.log('Team created', createdTeam);
                this.isSaving = false;
                this.router.navigateByUrl('/standings');
            },
            error: (err) => {
                console.error('API Error', err);
                this.isSaving = false;
                this.error = 'Failed to create team';

            }
        });
    }
}