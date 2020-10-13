import {Component, Input} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import RestService, {RestApi} from '../../providers/rest-service';
import {GlobalConfigProvider} from '../../providers/global-config';

/**
 * Generated class for the ProductDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-product-detail',
    styleUrls: ['product-detail.scss'],
    templateUrl: 'product-detail.html',
})
export class ProductDetailPage {

    options = {
        speed: 4000,
    };
    @Input() public product: any;
    @Input() public add = false;

    constructor(
        public appConfig: GlobalConfigProvider,
        public modalController: ModalController,
        private translateService: TranslateService,
        private rest: RestService,

    ) {
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
    }

    dismiss() {
        this.modalController.dismiss(this.add ? {add: true} : {add: false});
    }

    addToCart () {
        this.add = true;
        this.dismiss();
    }

    changeFavorite() {
        this.product.favorite = !this.product.favorite;
        if (this.appConfig.user) {
            this.rest.routes('favorite-products', 'v3').withAuth().post({
                body: {
                    user: this.appConfig.user.uuid,
                    product: this.product.uuid,
                },
            }).then(res => {
            }).catch(ex => {
            });
        }
    }

    addAdditional(_additional) {
       /* if (_additional) {
            this.product.itbms = this.product.itbms + _additional.itbms;
            this.product.price = this.product.price + _additional.price;
        }*/
    }
}
