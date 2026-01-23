export type AttendanceStatus = 'present' | 'absent' | 'excused';

export interface Coach {
    id: string;
    name: string;
    createdAt: string; // ISO date string
}

export interface Group {
    id: string;
    coachId: string;
    name: string;
    createdAt: string; // ISO date string
}

export interface Player {
    id: string;
    coachId: string;
    groupId: string;
    name: string;
    createdAt: string; // ISO date string
}

export interface Training {
    id: string;
    coachId: string;
    groupId: string;
    date: string; // YYYY-MM-DD
    createdAt: string; // ISO date string
}

export interface Attendance {
    id: string;
    coachId: string;
    groupId: string;
    trainingId: string;
    playerId: string;
    status: AttendanceStatus;
    createdAt: string; // ISO date string
}