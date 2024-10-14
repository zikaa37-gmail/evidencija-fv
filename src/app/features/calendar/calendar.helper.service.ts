import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CalendarHelperService {

  getMonth(monthIndex: number): string {
    const months: { id: number, name: string }[] = [
      { id: 0, name: "JANUARY" },
      { id: 1, name: "FEBRUARY" },
      { id: 2, name: "MARCH" },
      { id: 3, name: "APRIL" },
      { id: 4, name: "MAY" },
      { id: 5, name: "JUNE" },
      { id: 6, name: "JULY" },
      { id: 7, name: "AUGUST" },
      { id: 8, name: "SEPTEMBER" },
      { id: 9, name: "OCTOBER" },
      { id: 10, name: "NOVEMBER" },
      { id: 11, name: "DECEMBER" }
    ];

    return months.find(month => month.id === monthIndex)!.name;
  }

  getDay(dayIndex: number): string {
    const months: { id: number, name: string }[] = [
      { id: 1, name: "MONDAY" },
      { id: 2, name: "TUESDAY" },
      { id: 3, name: "WEDNESDAY" },
      { id: 4, name: "THURSDAY" },
      { id: 5, name: "FRIDAY" },
      { id: 6, name: "SATURDAY" },
      { id: 7, name: "SUNDAY" }
    ];

    return months.find(month => month.id === dayIndex)!.name;
  }

  getDays(): string[] {
    return ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  }

  getSections(): any[] {
    return [
      { grade: '5', departments: ['1', '2'] },
      { grade: '6', departments: ['1', '2', '3', '4'] },
      { grade: '7', departments: ['1', '2', '3'] },
      { grade: '8', departments: ['1', '2', '3', '4'] }
    ];
  }
}
