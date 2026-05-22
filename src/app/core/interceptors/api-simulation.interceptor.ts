import { HttpInterceptorFn } from '@angular/common/http';
import { delay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export const apiSimulationInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(delay(environment.apiDelayMs));
};
