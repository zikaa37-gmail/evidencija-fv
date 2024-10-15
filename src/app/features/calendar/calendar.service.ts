import { Injectable, signal } from '@angular/core';
import { Section } from '../students/students.interface';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  getMonth(monthIndex: number): string {
    const months: { id: number; name: string }[] = [
      { id: 0, name: 'january' },
      { id: 1, name: 'february' },
      { id: 2, name: 'march' },
      { id: 3, name: 'april' },
      { id: 4, name: 'may' },
      { id: 5, name: 'june' },
      { id: 6, name: 'july' },
      { id: 7, name: 'august' },
      { id: 8, name: 'september' },
      { id: 9, name: 'october' },
      { id: 10, name: 'november' },
      { id: 11, name: 'december' },
    ];

    return months.find((month) => month.id === monthIndex)!.name;
  }

  getDay(dayIndex: number): string {
    const months: { id: number; name: string }[] = [
      { id: 1, name: 'monday' },
      { id: 2, name: 'tuesday' },
      { id: 3, name: 'wednesday' },
      { id: 4, name: 'thursday' },
      { id: 5, name: 'friday' },
      { id: 6, name: 'saturday' },
      { id: 7, name: 'sunday' },
    ];

    return months.find((month) => month.id === dayIndex)!.name;
  }

  getDays(): string[] {
    return [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
  }
}

export const sections = signal<Section[]>([
  { grade: '5', department: '1' },
  { grade: '5', department: '2' },
  { grade: '6', department: '1' },
  { grade: '6', department: '2' },
  { grade: '6', department: '3' },
  { grade: '6', department: '4' },
  { grade: '7', department: '1' },
  { grade: '7', department: '2' },
  { grade: '7', department: '3' },
  { grade: '8', department: '1' },
  { grade: '8', department: '2' },
  { grade: '8', department: '3' },
  { grade: '8', department: '4' },
]);
