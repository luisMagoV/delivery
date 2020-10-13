import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {PrizesPage} from './prizes';
import {HistoryPage} from './history/history';
import {LegalPage} from './legal/legal';
import {CongratsPage} from './congrats/congrats';

const routes: Routes = [
  {
    path: '',
    component: PrizesPage,
  },
  {
    path: 'history',
    component: HistoryPage,
  },
  {
    path: 'legal',
    component: LegalPage,
  },
  {
    path: 'congrats',
    component: CongratsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrizesRoutingModule {}
