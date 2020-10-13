import {IonicModule} from '@ionic/angular';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {HomemapPage} from './homemap.page';

import {HomemapRoutingModule} from './homemap-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HomemapRoutingModule,
  ],
  declarations: [HomemapPage],
})
export class HomemapModule {}
