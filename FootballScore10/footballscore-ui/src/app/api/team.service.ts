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

export interface UpdateTeamRequest {
    name: string;
}

@Injectable({ providedIn: 'root' })
export class TeamsService {
    constructor(private http: HttpClient) { }

    createTeam(body: CreateTeamRequest): Observable<TeamDto> {
        return this.http.post<TeamDto>('/api/teams', body);
    }

    getById(id: number): Observable<TeamDto> {
        return this.http.get<TeamDto>(`/api/teams/${id}`);
    }

    updateTeam(id: number, body: UpdateTeamRequest): Observable<TeamDto> {
        return this.http.put<TeamDto>(`/api/teams/${id}`, body);
    }

    deleteTeam(id: number): Observable<void> {
        return this.http.delete<void>(`/api/teams/${id}`);
    }
}