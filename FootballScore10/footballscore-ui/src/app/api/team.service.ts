import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface TeamDto {
    id: number;
    name: string;
    played: number;
    wins: number;
    draws: number;
    loses: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
}

export interface CreateTeamRequest {
    name: string;
}

@Injectable({ providedIn: 'root' })
export class TeamsService {
    constructor(private http: HttpClient) { }

    createTeam(body: CreateTeamRequest): Observable<TeamDto> {
        return this.http.post<TeamDto>('/api/teams', body);
    }
}