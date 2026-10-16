import { Routes } from '@angular/router';

import { ReportsService } from './reports.service';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    providers: [ReportsService],
    children: [
      {
        path: '',
        loadComponent: () => import('./reports.component').then((m) => m.ReportsComponent),
        title: 'menu.reports',
      },
      {
        path: 'summary',
        loadComponent: () =>
          import('./class-summary/class-summary.component').then((m) => m.ClassSummaryComponent),
        title: 'reports.summary',
      },
    ],
  },
];
