
import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';

import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {

  afterEach(() => {
    localStorage.clear();
  });

  it('should attach the Bearer token when a JWT exists', () => {

    localStorage.setItem('token', 'test-token');

    const request = new HttpRequest('GET', '/students');
    const captured: HttpRequest<unknown>[] = [];

    const next: HttpHandlerFn = (req) => {
      captured.push(req);
      return of(new HttpResponse({ status: 200 }));
    };

    authInterceptor(request, next).subscribe();

    expect(captured.length).toBe(1);
    expect(captured[0].headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('should pass the request through unchanged when no JWT exists', () => {

    localStorage.removeItem('token');

    const request = new HttpRequest('GET', '/students');
    const captured: HttpRequest<unknown>[] = [];

    const next: HttpHandlerFn = (req) => {
      captured.push(req);
      return of(new HttpResponse({ status: 200 }));
    };

    authInterceptor(request, next).subscribe();

    expect(captured.length).toBe(1);
    expect(captured[0].headers.has('Authorization')).toBe(false);
  });
});


