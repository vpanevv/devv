// .spec.ts are test files
// Used by Angular test runner (Jasmine/Karma) to check if the class works as expected
// This class tests only the creation of the DbService class

import { TestBed } from '@angular/core/testing'; // angular weapon to run tests

import { DbService as Db } from './db'; // Db === DbService

describe('Db', () => { // this creates a test suite for DbService
  let service: Db; // variable to hold the service instance

  // this executes before each test in the suite
  beforeEach(() => {
    TestBed.configureTestingModule({}); // implement test angular container
    service = TestBed.inject(Db); // get instance of DbService from the container
  });

  it('should be created', () => { // actual test case
    expect(service).toBeTruthy(); // check if the service instance is created successfully "I expect that service is truthy"
  });
});



// Този файл:

// ✅ Стартира Angular test environment
// ✅ Създава DbService
// ✅ Проверява дали може да бъде инстанциран
// ✅ Гарантира че DI работи правилно



