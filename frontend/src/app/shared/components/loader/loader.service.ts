import { computed, Injectable, Signal, signal } from '@angular/core';
import { defer, finalize, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  #pendingRequests = signal(0);
  #watchedSources = signal<Signal<boolean>[]>([]);

  readonly isLoading = computed(
    () =>
      this.#pendingRequests() > 0 ||
      this.#watchedSources().some((isLoading) => isLoading()),
  );

  track<T>(source: Observable<T>): Observable<T> {
    return defer(() => {
      this.#pendingRequests.update((count) => count + 1);
      return source.pipe(
        finalize(() => this.#pendingRequests.update((count) => count - 1)),
      );
    });
  }

  watch(isLoading: Signal<boolean>): () => void {
    this.#watchedSources.update((sources) => [...sources, isLoading]);
    return () =>
      this.#watchedSources.update((sources) =>
        sources.filter((source) => source !== isLoading),
      );
  }
}
