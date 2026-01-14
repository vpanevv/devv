import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface CreateMatchRequest {
    homeTeamId: number;
    awayTeamId: number;
    homeGoals: number;
    awayGoals: number;
    datePlayed: string; // ISO string
}

@Injectable({ providedIn: 'root' })
export class MatchesService {
    constructor(private http: HttpClient) { }

    createMatch(body: CreateMatchRequest): Observable<number> {
        return this.http.post<number>('/api/matches', body);
    }
}

