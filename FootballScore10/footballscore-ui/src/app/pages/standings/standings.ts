import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StandingsService, StandingDto } from '../../api/standings.service';
import { TeamsService } from '../../api/team.service';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-standings',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './standings.html',
    styleUrls: ['./standings.scss'],
})
export class StandingComponent implements OnInit {
    items: StandingDto[] = [];
    isLoading = true;
    error: string | null = null;
    confirmOpen = false;
    pendingDelete: { id: number, name: string } | null = null;
    isDeleting = false;

    constructor(
        private standingsService: StandingsService,
        private teams: TeamsService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.load();
    }

    load(): void {
        this.isLoading = true;
        this.error = null;

        this.standingsService.getStandings().subscribe({
            next: (data) => {
                this.items = data ?? [];
                this.isLoading = false;
                this.cdr.detectChanges(); // ако ти трябва, остави го
            },
            error: (err) => {
                console.error(err);
                this.error = 'Failed to load standings';
                this.isLoading = false;
                this.cdr.detectChanges(); // ако ти трябва, остави го
            },
        });
    }

    openDelete(teamId: number, teamName: string): void {
        this.error = null;
        this.pendingDelete = { id: teamId, name: teamName };
        this.confirmOpen = true;
    }

    closeDelete(): void {
        this.confirmOpen = false;
        this.pendingDelete = null;
    }

    confirmDelete(): void {
        if (!this.pendingDelete || this.isDeleting) return;

        this.isDeleting = true;
        const id = this.pendingDelete.id;

        this.teams.deleteTeam(id)
            .pipe(finalize(() => {
                this.isDeleting = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: () => {
                    this.closeDelete();
                    this.load();
                },
                error: (err) => {
                    console.error(err);

                    // ако бекендът връща string message (както при вас)
                    this.error = (err?.status === 400 && typeof err.error === 'string')
                        ? err.error
                        : 'Failed to delete team';

                    this.closeDelete();
                }
            });
    }

    gdClass(gd: number): string {
        if (gd > 0) return 'positive-gd';
        if (gd < 0) return 'negative-gd';
        return 'zero';
    }

    gdLabel(gd: number): string {
        return gd > 0 ? `+${gd}` : `${gd}`;
    }
}