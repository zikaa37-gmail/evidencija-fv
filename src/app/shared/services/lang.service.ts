import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LangService {

  currLang$ = new BehaviorSubject<string>('sr');

  constructor(private translate: TranslateService) {
    const lang = localStorage.getItem('language')
    if (lang) {
      this.changeLang(lang);
    } else {
      this.changeLang('sr');
    }
  }

  changeLang(lang: string) {
    this.translate.use(lang);
    this.currLang$.next(lang);
    localStorage.setItem('language', lang)
  }
}
