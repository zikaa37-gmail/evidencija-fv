import { computed, inject, Injectable } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { LoaderService } from '../../shared/components/loader/loader.service';
import { CurrentSchoolYear } from './school-year.model';

@Injectable({ providedIn: 'root' })
export class SchoolYearService {
  #apiUrl = environment.apiUrl;
  #http = inject(HttpClient);
  #auth = inject(AuthService);
  #loader = inject(LoaderService);

  #currentResource = httpResource<CurrentSchoolYear>(() =>
    this.#auth.isAuthenticated() ? `${this.#apiUrl}/school-years/current` : undefined,
  );

  readonly current = computed(() =>
    this.#currentResource.hasValue() ? (this.#currentResource.value() ?? null) : null,
  );

  readonly showPreparationNotice = computed(
    () => this.#auth.isAdmin() && !!this.current()?.in_preparation,
  );

  rollover(firstGradeSections: number): Observable<CurrentSchoolYear> {
    return this.#loader
      .track(
        this.#http.post<CurrentSchoolYear>(`${this.#apiUrl}/school-years/rollover`, {
          first_grade_sections: firstGradeSections,
        }),
      )
      .pipe(tap((schoolYear) => this.#currentResource.value.set(schoolYear)));
  }
}
