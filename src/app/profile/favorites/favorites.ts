import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {OverlayEventDetail} from '@ionic/core';
import {GlobalConfigProvider} from '../../../providers/global-config';
import {ConfigGlobalProvider} from '../../../providers/config.global.provider';
import RestService, {RestApi} from '../../../providers/rest-service';
import {ModalController} from '@ionic/angular';
import {ProductDetailPage} from '../../product-detail/product-detail';


/**
 * Generated class for the SelectPayPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-favorites',
    styleUrls: ['favorites.scss'],
    templateUrl: 'favorites.html',
})
export class FavoritesPage implements OnInit {

    loadingAllFeatured = false;
    loadingProductsFavorites = false;
    productsFavorite: any[] = [];
    storesFavorite: any[] = [];

    constructor(
        public oConfigGlobalProvider: ConfigGlobalProvider,
        public appConfig: GlobalConfigProvider,
        private translateService: TranslateService,
        private rest: RestService,
        private modalController: ModalController,
        private router: Router,
    ) {
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
    }

    ngOnInit() {
        this.loadStuff();
    }

    showDetail(_product) {
        this.modalController.create({
            component: ProductDetailPage,
            componentProps: {
                product: _product,
            },
        }).then((m) => {
            m.present();
            m.onDidDismiss().then((res: OverlayEventDetail ) => {
                if (res.data.add) {
                    this.storesFavorite.forEach(category => {
                        category.stores.forEach(store => {
                            if (_product.store === store.uuid) {
                                this.selectStore(store);
                            }
                        });
                    });
                }
            });
        });
    }

    selectStore(_store) {
        this.router.navigate(['/tabs/pedido-steps/products'], {
            queryParams: {
                data: JSON.stringify({
                    store: _store,
                }),
            },
        });
    }

    loadStuff() {
        if (!this.loadingAllFeatured) {
            this.loadingAllFeatured = true;
            this.rest.routes('favorite-user', 'v3').withAuth().post({
                body: {
                    user: this.appConfig.user.uuid,
                },
            }).then(res => {
                this.productsFavorite = res.json().products;
                this.storesFavorite = res.json().stores;
            }).catch(ex => {
                this.oConfigGlobalProvider.showErrorAlert({
                    message: ex,
                    title: 'ERROR LOAD STUFF',
                });
            });
        }
        /*if (!this.loadingAllFeatured) {
            this.loadingAllFeatured = true;
            this.rest.routes('all-featured/', 'v3').withAuth().get().then(res => {
                this.productsFavorite = res.json().productsFavorite;
                this.storesFavorite = res.json().storesFavorite;
            }).catch(ex => {
                this.oConfigGlobalProvider.showErrorAlert({
                    message: ex,
                    title: 'ERROR LOAD STUFF',
                });
            });
        }*/
    }

    back () {
        this.appConfig.back();
    }

}
