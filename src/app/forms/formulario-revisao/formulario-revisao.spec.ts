import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioRevisao } from './formulario-revisao.component';

describe('FormularioRevisao', () => {
  let component: FormularioRevisao;
  let fixture: ComponentFixture<FormularioRevisao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioRevisao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioRevisao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
