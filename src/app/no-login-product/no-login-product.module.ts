import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NoLoginProductPageRoutingModule } from './no-login-product-routing.module';

import { NoLoginProductPage } from './no-login-product.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NoLoginProductPageRoutingModule,
  ],
  declarations: [NoLoginProductPage],
})
export class NoLoginProductPageModule {}
