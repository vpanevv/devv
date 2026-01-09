import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StandingsService, StandingDto } from '../../api/standings.service';

@Component({
    selector: 'app-standings',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './standings.html',
    styleUrls: ['./standings.scss']
})
export class StandingComponent implements OnInit {
    items: StandingDto[] = [];
    isLoading = true;
    error: string | null = null;

    constructor(private standingsService: StandingsService) { }

    ngOnInit(): void {
        console.log('ngOnInit fired');
        this.standingsService.getStandings().subscribe({
            next: (data) => {
                console.log('API OK', data);
                this.items = data ?? [];
                this.isLoading = false;
            },
            error: (err) => {
                console.error('API Error', err);
                this.error = 'Failed to load standings';
                this.isLoading = false;
            }
        })
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