import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioJogo } from './formulario-jogo.component';

describe('FormularioJogo', () => {
  let component: FormularioJogo;
  let fixture: ComponentFixture<FormularioJogo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioJogo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioJogo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
