import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomemapPage} from './homemap.page';

const routes: Routes = [
  {
    path: '',
    component: HomemapPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomemapRoutingModule {}
