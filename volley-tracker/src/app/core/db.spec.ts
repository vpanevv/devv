import { TestBed } from '@angular/core/testing';

import { Db } from './db';

describe('Db', () => {
  let service: Db;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Db);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});


// Ролята на dbService:
// Това ще е единственото място, което говори със SQLite:
// 	•	open database
// 	•	migrations (таблици)
// 	•	queries
// 	•	transactions

// Всички други services ще го ползват:
// 	•	CoachService
// 	•	GroupsService
// 	•	PlayersService
// 	•	TrainingsService
// 	•	AttendanceService
