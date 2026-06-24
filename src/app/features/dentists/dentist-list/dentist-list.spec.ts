import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DentistList } from './dentist-list';

describe('DentistList', () => {
  let component: DentistList;
  let fixture: ComponentFixture<DentistList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DentistList],
    }).compileComponents();

    fixture = TestBed.createComponent(DentistList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
