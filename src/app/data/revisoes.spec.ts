import { TestBed } from '@angular/core/testing';

import { Revisoes } from './revisoes.service';

describe('Revisoes', () => {
  let service: Revisoes;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Revisoes);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
