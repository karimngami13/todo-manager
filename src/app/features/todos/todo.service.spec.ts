import { TestBed } from '@angular/core/testing';
import { TodoService } from './todo.service';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from '../../core/auth/auth.service';
import { Timestamp } from '@angular/fire/firestore';

describe('TodoService', () => {
  let service: TodoService;
  let mockFirestore: any;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    mockFirestore = {
      collection: jasmine.createSpy(),
    };

    mockAuthService = jasmine.createSpyObj('AuthService', ['uid']);
    mockAuthService.uid.and.returnValue('test-uid-123');

    TestBed.configureTestingModule({
      providers: [
        TodoService,
        { provide: Firestore, useValue: mockFirestore },
        { provide: AuthService, useValue: mockAuthService },
      ]
    });

    service = TestBed.inject(TodoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct uid from AuthService', () => {
    expect(mockAuthService.uid()).toBe('test-uid-123');
  });

  it('should have getTodos method', () => {
    expect(service.getTodos).toBeDefined();
    expect(typeof service.getTodos).toBe('function');
  });

  it('should have createTodo method', () => {
    expect(service.createTodo).toBeDefined();
    expect(typeof service.createTodo).toBe('function');
  });

  it('should have updateTodo method', () => {
    expect(service.updateTodo).toBeDefined();
    expect(typeof service.updateTodo).toBe('function');
  });

  it('should have deleteTodo method', () => {
    expect(service.deleteTodo).toBeDefined();
    expect(typeof service.deleteTodo).toBe('function');
  });
});