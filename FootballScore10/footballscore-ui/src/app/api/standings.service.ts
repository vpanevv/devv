import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface StandingDto {
    position: number;
    teamId: number;
    name: string,
    played: number,
    wins: number,
    draws: number,
    loses: number,
    goalDifference: number,
    points: number;
}

@Injectable({ providedIn: 'root' })
export class StandingsService {
    constructor(private http: HttpClient) { }

    getStandings(): Observable<StandingDto[]> {
        return this.http.get<StandingDto[]>('/api/standings');
    }
}