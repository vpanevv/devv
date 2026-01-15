import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { StandingsService, StandingDto } from '../../api/standings.service';
import { TeamsService } from '../../api/team.service';
import { MatchesService } from '../../api/matches.service'; // <-- ако е с друго име, смени
import { ToastService } from '../../ui/toast/toast.service';

@Component({
    selector: 'app-standings',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule],
    templateUrl: './standings.html',
    styleUrls: ['./standings.scss'],
})
export class StandingComponent implements OnInit {
    // standings
    items: StandingDto[] = [];
    isLoading = true;
    error: string | null = null;

    // delete confirm
    confirmOpen = false;
    pendingDelete: { id: number; name: string } | null = null;
    isDeleting = false;

    matchSuccessOpen = false;

    lastMatch: {
        homeTeam: string;
        awayTeam: string;
        homeGoals: number;
        awayGoals: number;
        datePlayed: string;
    } | null = null;

    private teamNameById(id: number): string {
        return this.items.find(x => x.teamId === id)?.name ?? 'Unknown';
    }

    closeMatchSuccess(): void {
        this.matchSuccessOpen = false;
        this.lastMatch = null;
    }

    // match create
    matchForm: FormGroup;
    isCreatingMatch = false;
    matchError: string | null = null;
    matchSuccess: string | null = null;

    constructor(
        private standingsService: StandingsService,
        private teams: TeamsService,
        private matches: MatchesService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef,
        private toast: ToastService
    ) {
        // default date: today (YYYY-MM-DD) – удобно за <input type="date">
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        this.matchForm = this.fb.group({
            homeTeamId: [null, Validators.required],
            awayTeamId: [null, Validators.required],
            homeGoals: [0, [Validators.required, Validators.min(0)]],
            awayGoals: [0, [Validators.required, Validators.min(0)]],
            datePlayed: [todayStr, Validators.required], // string "YYYY-MM-DD"
        });
    }

    ngOnInit(): void {
        this.load();
    }

    // -----------------------------
    // Standings
    // -----------------------------
    load(): void {
        this.isLoading = true;
        this.error = null;

        this.standingsService.getStandings().subscribe({
            next: (data) => {
                this.items = data ?? [];
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(err);
                this.error = 'Failed to load standings';
                this.isLoading = false;
                this.cdr.detectChanges();
            },
        });
    }

    // -----------------------------
    // Delete team
    // -----------------------------
    openDelete(teamId: number, teamName: string): void {
        this.error = null;
        this.pendingDelete = { id: teamId, name: teamName };
        this.confirmOpen = true;
    }

    closeDelete(): void {
        if (this.isDeleting) return;
        this.confirmOpen = false;
        this.pendingDelete = null;
    }

    confirmDelete(): void {
        if (!this.pendingDelete || this.isDeleting) return;

        this.isDeleting = true;
        const id = this.pendingDelete.id;

        this.teams
            .deleteTeam(id)
            .pipe(
                finalize(() => {
                    this.isDeleting = false;
                    this.cdr.detectChanges();
                })
            )
            .subscribe({
                next: () => {
                    this.closeDelete();
                    this.load();
                },
                error: (err) => {
                    console.error(err);
                    // backend може да върне string message
                    this.error =
                        err?.status === 400 && typeof err.error === 'string'
                            ? err.error
                            : 'Failed to delete team';
                    this.toast.error(typeof err?.error === 'string' ? err.error : 'Failed to delete team');
                    this.closeDelete();
                },
            });
    }

    // -----------------------------
    // Create match
    // -----------------------------
    swapTeams(): void {
        const h = this.matchForm.get('homeTeamId')?.value;
        const a = this.matchForm.get('awayTeamId')?.value;
        this.matchForm.patchValue({ homeTeamId: a, awayTeamId: h });
    }

    createMatch(): void {
        this.matchError = null;
        this.matchSuccess = null;

        if (this.matchForm.invalid) {
            this.matchForm.markAllAsTouched();
            this.matchError = 'Please fill all fields correctly.';
            return;
        }

        const v = this.matchForm.value;

        const payload = {
            homeTeamId: Number(v.homeTeamId),
            awayTeamId: Number(v.awayTeamId),
            homeGoals: Number(v.homeGoals),
            awayGoals: Number(v.awayGoals),
            // v.datePlayed e "YYYY-MM-DD" -> правим ISO string
            datePlayed: new Date(String(v.datePlayed)).toISOString(),
        };

        if (!payload.homeTeamId || !payload.awayTeamId) {
            this.matchError = 'Please select both teams.';
            return;
        }

        if (payload.homeTeamId === payload.awayTeamId) {
            this.matchError = 'Home and Away team must be different.';
            return;
        }

        if (payload.homeGoals < 0 || payload.awayGoals < 0) {
            this.matchError = 'Goals cannot be negative.';
            return;
        }

        this.isCreatingMatch = true;

        this.matches
            .createMatch(payload)
            .pipe(
                finalize(() => {
                    this.isCreatingMatch = false;
                    this.cdr.detectChanges();
                })
            )
            .subscribe({
                next: (matchId: number) => {
                    this.matchSuccess = `Match created (#${matchId}). Standings updated.`;
                    const v = this.matchForm.value as any;
                    this.lastMatch = {
                        homeTeam: this.teamNameById(Number(v.homeTeamId)),
                        awayTeam: this.teamNameById(Number(v.awayTeamId)),
                        homeGoals: Number(v.homeGoals),
                        awayGoals: Number(v.awayGoals),
                        datePlayed: String(v.datePlayed),
                    }
                    this.matchSuccessOpen = true;
                    // след мач: рефреш таблицата
                    this.toast.success('Match created and standing updated.');
                    this.load();
                },
                error: (err) => {
                    console.error('Create match error', err);
                    // ако бекенд върне string (ArgumentException) като plain text
                    if (err?.status === 400 && typeof err.error === 'string') {
                        this.matchError = err.error;
                        return;
                    }
                    this.toast.error(typeof err?.error === 'string' ? err.error : 'Failed to create match');
                    this.matchError = 'Failed to create match';
                },
            });
    }

    // -----------------------------
    // Helpers
    // -----------------------------
    gdClass(gd: number): string {
        if (gd > 0) return 'positive-gd';
        if (gd < 0) return 'negative-gd';
        return 'zero';
    }

    gdLabel(gd: number): string {
        return gd > 0 ? `+${gd}` : `${gd}`;
    }
}