import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NoLoginProductPage } from './no-login-product.page';

const routes: Routes = [
  {
    path: '',
    component: NoLoginProductPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NoLoginProductPageRoutingModule {}
