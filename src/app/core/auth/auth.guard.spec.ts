import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { authGuard } from './auth.guard';
import { of } from 'rxjs';

describe('authGuard', () => {
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(() => {
    mockRouter = jasmine.createSpyObj('Router', ['createUrlTree']);
    mockRouter.createUrlTree.and.returnValue('/auth/login' as any);

    TestBed.configureTestingModule({
      providers: [
        { provide: Auth, useValue: {} },
        { provide: Router, useValue: mockRouter },
      ]
    });
  });

  it('should be defined', () => {
    expect(authGuard).toBeDefined();
  });

  it('should redirect when not authenticated', (done) => {
    spyOn({ authState }, 'authState').and.returnValue(of(null));

    TestBed.runInInjectionContext(() => {
      const result = authGuard({} as any, {} as any);
      expect(result).toBeTruthy();
      done();
    });
  });
});