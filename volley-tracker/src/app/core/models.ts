export type Theme = 'dark' | 'light';

export interface Group {
    id: string;
    name: string;
    createdAt: string; // ISO date string
}

export interface Player {
    id: string;
    groupId: string;
    name: string;
    createdAt: string; // ISO date string
}

export type AttendaceStatus = 'present' | 'absent' | 'excused';

export type AttendanceByGroup = Record<string, Record<string, Record<string, AttendaceStatus>>>;

export interface AppStateV1 {
    coachName: string | null;
    groups: Group[];
    players: Player[];
    attendance: AttendanceByGroup;
}