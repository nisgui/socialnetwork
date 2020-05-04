import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AtualizarmembroComponent } from './atualizarmembro.component';

describe('AtualizarmembroComponent', () => {
  let component: AtualizarmembroComponent;
  let fixture: ComponentFixture<AtualizarmembroComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AtualizarmembroComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AtualizarmembroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
