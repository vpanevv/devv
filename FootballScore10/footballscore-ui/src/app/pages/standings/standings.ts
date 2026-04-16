import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { StandingsService, StandingDto } from '../../api/standings.service';
import { TeamsService } from '../../api/team.service';
import { MatchesService } from '../../api/matches.service';
import { ToastService } from '../../ui/toast/toast.service';

type Result = 'W' | 'D' | 'L';

interface PredictionOutput {
    homeName: string;
    awayName: string;
    homeWin: number;
    draw: number;
    awayWin: number;
    verdict: string;
    score: string;
}

@Component({
    selector: 'app-standings',
    standalone: true,
    imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
    templateUrl: './standings.html',
    styleUrls: ['./standings.scss'],
})
export class StandingComponent implements OnInit {
    items: StandingDto[] = [];
    isLoading = true;
    error: string | null = null;

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

    matchForm: FormGroup;
    isCreatingMatch = false;
    matchError: string | null = null;
    matchSuccess: string | null = null;

    predictHomeId: number | null = null;
    predictAwayId: number | null = null;
    predictThinking = false;
    prediction: PredictionOutput | null = null;

    insightIndex = 0;
    private insightTimer?: ReturnType<typeof setInterval>;

    constructor(
        private standingsService: StandingsService,
        private teams: TeamsService,
        private matches: MatchesService,
        private fb: FormBuilder,
        private cdr: ChangeDetectorRef,
        private toast: ToastService
    ) {
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
            datePlayed: [todayStr, Validators.required],
        });
    }

    ngOnInit(): void {
        this.load();
        this.insightTimer = setInterval(() => {
            const n = this.insights.length || 1;
            this.insightIndex = (this.insightIndex + 1) % n;
            this.cdr.detectChanges();
        }, 4200);
    }

    ngOnDestroy(): void {
        if (this.insightTimer) clearInterval(this.insightTimer);
    }

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

    // -----------------------------------------------------------------------
    // Presentational helpers: crests, initials, form, zones
    // -----------------------------------------------------------------------
    initials(name: string): string {
        const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) return '?';
        if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    private static readonly TEAM_PALETTE: Record<string, [string, string]> = {
        'arsenal': ['#ef0107', '#fff200'],
        'chelsea': ['#034694', '#6aa6ff'],
        'liverpool': ['#c8102e', '#f6eb61'],
        'manchester city': ['#6cabdd', '#f6eb61'],
        'man city': ['#6cabdd', '#f6eb61'],
        'manchester united': ['#da291c', '#fbe122'],
        'man united': ['#da291c', '#fbe122'],
        'tottenham': ['#132257', '#ffffff'],
        'spurs': ['#132257', '#ffffff'],
        'newcastle': ['#241f20', '#ffffff'],
        'aston villa': ['#670e36', '#95bfe5'],
        'brighton': ['#0057b8', '#ffcd00'],
        'west ham': ['#7a263a', '#1bb1e7'],
        'everton': ['#003399', '#ffffff'],
        'leicester': ['#003090', '#fdbe11'],
        'barcelona': ['#a50044', '#edbb00'],
        'real madrid': ['#febe10', '#00529f'],
        'atletico madrid': ['#cb3524', '#ffffff'],
        'bayern munich': ['#dc052d', '#ffffff'],
        'psg': ['#004170', '#da291c'],
    };

    private hashInt(seed: string | number): number {
        const s = String(seed);
        let h = 0;
        for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
        return Math.abs(h);
    }

    crestColors(team: { name: string; teamId: number }): [string, string] {
        const key = (team.name ?? '').trim().toLowerCase();
        if (StandingComponent.TEAM_PALETTE[key]) return StandingComponent.TEAM_PALETTE[key];
        const palettes: [string, string][] = [
            ['#ff2882', '#a020f0'],
            ['#00ff87', '#05f0ff'],
            ['#ffb13b', '#ff2882'],
            ['#05f0ff', '#37003c'],
            ['#a020f0', '#00ff87'],
            ['#ef0107', '#ffcd00'],
            ['#034694', '#05f0ff'],
        ];
        return palettes[this.hashInt(team.teamId) % palettes.length];
    }

    formFor(team: StandingDto): Result[] {
        const base = this.hashInt(team.teamId + ':' + team.points + ':' + team.played);
        const pool: Result[] = ['W', 'W', 'W', 'D', 'L'];
        if (team.points >= 15) pool.push('W', 'W');
        if (team.points <= 3) pool.push('L', 'L', 'D');
        const out: Result[] = [];
        for (let i = 0; i < 5; i++) {
            out.push(pool[(base + i * 31) % pool.length]);
        }
        return out;
    }

    zoneFor(position: number, total: number): '' | 'zone-top' | 'zone-cl' | 'zone-el' | 'zone-rel' {
        if (position === 1) return 'zone-top';
        if (position <= 4) return 'zone-cl';
        if (position <= 6) return 'zone-el';
        if (total >= 10 && position > total - 3) return 'zone-rel';
        return '';
    }

    positionDelta(team: StandingDto): number {
        const h = this.hashInt(team.teamId + ':delta');
        return (h % 5) - 2;
    }

    // -----------------------------------------------------------------------
    // Gameweek summary stats (computed from standings)
    // -----------------------------------------------------------------------
    get totalMatches(): number {
        return Math.floor(this.items.reduce((s, t) => s + (t.played ?? 0), 0) / 2);
    }

    get topScorer(): StandingDto | null {
        return [...this.items].sort((a, b) => b.points - a.points)[0] ?? null;
    }

    get tightestGap(): number {
        const sorted = [...this.items].sort((a, b) => b.points - a.points);
        if (sorted.length < 2) return 0;
        return sorted[0].points - sorted[1].points;
    }

    // -----------------------------------------------------------------------
    // AI Insights (derived from current standings)
    // -----------------------------------------------------------------------
    get insights(): string[] {
        if (!this.items.length) {
            return ['Warming up the model… standings incoming.'];
        }
        const leader = this.topScorer;
        const sorted = [...this.items].sort((a, b) => b.points - a.points);
        const tail = sorted[sorted.length - 1];
        const gap = this.tightestGap;

        const tips: string[] = [];
        if (leader) {
            tips.push(`${leader.name} lead the table with ${leader.points} pts — xG model gives them a 68% title probability.`);
        }
        if (gap <= 1 && sorted.length >= 2) {
            tips.push(`Title race is on a knife edge: only ${gap} pt between ${sorted[0].name} and ${sorted[1].name}.`);
        } else if (sorted.length >= 2) {
            tips.push(`${sorted[0].name} lead ${sorted[1].name} by ${gap} pts — comfortable cushion, for now.`);
        }
        if (tail) {
            tips.push(`${tail.name} need a statement win this week — relegation model flags them at 42% risk.`);
        }
        tips.push('Captain picks: premium forwards from the top 3 sides are outperforming mids by 18% this window.');
        tips.push('Wildcard window closes in 6 days — AI suggests a mid-price defensive pivot.');
        return tips;
    }

    get currentInsight(): string {
        const list = this.insights;
        if (!list.length) return '';
        return list[this.insightIndex % list.length];
    }

    // -----------------------------------------------------------------------
    // AI Match Predictor (mock)
    // -----------------------------------------------------------------------
    swapPredictorTeams(): void {
        const h = this.predictHomeId;
        this.predictHomeId = this.predictAwayId;
        this.predictAwayId = h;
    }

    runPrediction(): void {
        if (!this.predictHomeId || !this.predictAwayId || this.predictHomeId === this.predictAwayId) {
            this.toast.error('Pick two different teams to run the prediction.');
            return;
        }
        this.predictThinking = true;
        this.prediction = null;
        this.cdr.detectChanges();

        const home = this.items.find(x => x.teamId === this.predictHomeId)!;
        const away = this.items.find(x => x.teamId === this.predictAwayId)!;

        const strengthH = (home.points + 1) * 1.12 + home.goalDifference * 0.35;
        const strengthA = (away.points + 1) + away.goalDifference * 0.35;
        const total = strengthH + strengthA;
        let homeWin = Math.max(8, Math.min(82, Math.round((strengthH / total) * 85)));
        let awayWin = Math.max(8, Math.min(82, Math.round((strengthA / total) * 85)));
        const draw = Math.max(8, 100 - homeWin - awayWin);
        const leftover = 100 - (homeWin + awayWin + draw);
        homeWin += leftover;

        const gh = Math.round(1.1 + strengthH / (strengthA + 2));
        const ga = Math.round(0.8 + strengthA / (strengthH + 2));
        const verdict = homeWin > awayWin + 10
            ? `Model leans ${home.name}. Home pressure + form edge.`
            : awayWin > homeWin + 10
                ? `Model leans ${away.name}. Away side has the xG advantage.`
                : `Tight one — xG differential under 0.3 — draw is live.`;

        setTimeout(() => {
            this.prediction = {
                homeName: home.name,
                awayName: away.name,
                homeWin,
                draw,
                awayWin,
                verdict,
                score: `${gh}–${ga}`,
            };
            this.predictThinking = false;
            this.cdr.detectChanges();
        }, 1400);
    }

    // -----------------------------------------------------------------------
    // Team management
    // -----------------------------------------------------------------------
    private teamNameById(id: number): string {
        return this.items.find(x => x.teamId === id)?.name ?? 'Unknown';
    }

    closeMatchSuccess(): void {
        this.matchSuccessOpen = false;
        this.lastMatch = null;
    }

    openDelete(teamId: number, teamName: string): void {
        if (this.isDeleting) return;
        this.error = null;
        this.pendingDelete = { id: teamId, name: teamName };
        this.confirmOpen = true;
    }

    closeDelete(): void {
        this.confirmOpen = false;
        this.pendingDelete = null;
        this.cdr.detectChanges();
    }

    confirmDelete(): void {
        if (!this.pendingDelete || this.isDeleting) return;
        this.isDeleting = true;
        const id = this.pendingDelete.id;

        this.teams.deleteTeam(id).subscribe({
            next: () => {
                this.closeDelete();
                this.load();
                this.isDeleting = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(err);
                this.error =
                    (err?.status === 400 && typeof err.error === 'string')
                        ? err.error
                        : 'Failed to delete team';
                this.closeDelete();
                this.isDeleting = false;
                this.cdr.detectChanges();
            }
        });
    }

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
        this.matches.createMatch(payload)
            .pipe(finalize(() => {
                this.isCreatingMatch = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: (matchId: number) => {
                    this.matchSuccess = `Match created (#${matchId}). Standings updated.`;
                    this.lastMatch = {
                        homeTeam: this.teamNameById(payload.homeTeamId),
                        awayTeam: this.teamNameById(payload.awayTeamId),
                        homeGoals: payload.homeGoals,
                        awayGoals: payload.awayGoals,
                        datePlayed: String(v.datePlayed),
                    };
                    this.matchSuccessOpen = true;
                    this.toast.success('Match created and standings updated.');
                    this.load();
                },
                error: (err) => {
                    console.error('Create match error', err);
                    if (err?.status === 400 && typeof err.error === 'string') {
                        this.matchError = err.error;
                        return;
                    }
                    this.toast.error(typeof err?.error === 'string' ? err.error : 'Failed to create match');
                    this.matchError = 'Failed to create match';
                },
            });
    }

    gdClass(gd: number): string {
        if (gd > 0) return 'gd-pos';
        if (gd < 0) return 'gd-neg';
        return 'gd-zero';
    }

    gdLabel(gd: number): string {
        return gd > 0 ? `+${gd}` : `${gd}`;
    }
}
