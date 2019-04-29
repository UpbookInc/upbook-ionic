import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiAttrPage } from './multi-attr.page';

describe('MultiAttrPage', () => {
  let component: MultiAttrPage;
  let fixture: ComponentFixture<MultiAttrPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiAttrPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiAttrPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
