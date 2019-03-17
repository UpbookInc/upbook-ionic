import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactUpdatePage } from './contact-update.page';

describe('ContactUpdatePage', () => {
  let component: ContactUpdatePage;
  let fixture: ComponentFixture<ContactUpdatePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactUpdatePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactUpdatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
