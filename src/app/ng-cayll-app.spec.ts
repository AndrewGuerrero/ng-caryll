import { TestBed, async } from '@angular/core/testing';
import { NgCaryllApp } from './ng-caryll-app';
describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        NgCaryllApp
      ],
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(NgCaryllApp);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it(`should have as title 'ngc'`, async(() => {
    const fixture = TestBed.createComponent(NgCaryllApp);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('ngc');
  }));
  it('should render title in a h1 tag', async(() => {
    const fixture = TestBed.createComponent(NgCaryllApp);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to ngc!');
  }));
});
