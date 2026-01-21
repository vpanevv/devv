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

export type AttendanceStatus = 'present' | 'absent' | 'excused';

export type AttendanceByGroup =
    Record<string, Record<string, Record<string, AttendanceStatus>>>;

// NOTE: вече НЕ пазим coachName тук (coach-овете са отделно)
export interface AppStateV1 {
    groups: Group[];
    players: Player[];
    attendance: AttendanceByGroup;
}