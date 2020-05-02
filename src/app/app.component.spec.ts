import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { AGENTS } from './consts';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ElementRef } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AppComponent', () => {

  class MockElementRef extends ElementRef {}
  class HttpClientRef extends HttpClient {}

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: ElementRef, useClass: MockElementRef },
        // { provide: HttpClient, useClass: HttpClientRef }
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should return Morocco and 3 on getIsolatedCountry`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const agentsList = AGENTS;
    expect(app.getIsolatedCountry(agentsList).name).toEqual('Morocco');
    expect(app.getIsolatedCountry(agentsList).isolatedAgentsSet.size).toEqual(3);
  });

  it(`should throw error on empty array`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect( () => { app.getIsolatedCountry([]); } ).toThrow(new Error('empty agents array!'));

  });
});
