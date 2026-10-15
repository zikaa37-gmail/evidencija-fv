import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
}
