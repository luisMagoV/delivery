import {Component} from '@angular/core';
import {GlobalConfigProvider} from '../../providers/global-config';
import {ConfigGlobalProvider} from '../../providers/config.global.provider';

@Component({
    selector: 'app-pedido-steps',
    templateUrl: 'pedido-steps.page.html',
    styleUrls: ['pedido-steps.page.scss'],
})
export class PedidoStepsPage {// Test

    directions = [];

    constructor(
        public oConfigGlobalProvider: ConfigGlobalProvider,
        public appConfig: GlobalConfigProvider,
    ) {
        this.oConfigGlobalProvider.login.subscribe(m => this.loadAddress());
    }

    loadAddress() {
        this.appConfig.hasFavorite = false;
        this.directions = this.appConfig?.user?.directions;

        if (this.directions && !this.appConfig.hasFavorite) {
            this.directions.forEach((direction: any) => {
                if (direction.favorite) {
                    this.appConfig.addressSelected = direction;
                    this.appConfig.hasFavorite = true;
                    this.appConfig.setFavorite.emit(true);
                }
            });
        }
    }

}
