import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabNetworkPage } from './tab-network.page';

describe('TabNetworkPage', () => {
  let component: TabNetworkPage;
  let fixture: ComponentFixture<TabNetworkPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabNetworkPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabNetworkPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
