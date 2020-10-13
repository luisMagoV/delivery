import {AfterViewInit, Component, Input, ViewChild} from '@angular/core';
import {IonInfiniteScroll, ModalController} from '@ionic/angular';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Storage} from '@ionic/storage';
import {GlobalConfigProvider} from '../../../providers/global-config';
import RestService from '../../../providers/rest-service';
import {ConfigGlobalProvider} from '../../../providers/config.global.provider';
import {ProductDetailPage} from '../../product-detail/product-detail';
import {PreordenPage} from '../../preorden/preorden';

/**
 * Generated class for the PayDebtPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-checkout',
    styleUrls: ['checkout.scss'],
    templateUrl: 'checkout.html',
})
export class CheckoutPage implements AfterViewInit {

    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
    @Input() public items: any = [];
    @Input() public serviceType = '';
    @Input() public service: any;
    @Input() public generateOther: any;
    searchBar = this.appConfig.configStore.searchBar;
    categoriesBar = this.appConfig.configStore.searchBar;
    search = '';
    category = '';
    products: any[] = [];
    cartStores: any[] = [];
    stores;
    categories = [];
    store: any = [];
    product = '';
    directions = [];
    loadingProducts = false;
    bannersCheckout: any[] = [];

    slidesOptionsBannners = {
        initialSlide: 0,
        slidesPerView: 1,
        autoplay: true,
    };

    constructor(
        public oConfigGlobalProvider: ConfigGlobalProvider,
        public appConfig: GlobalConfigProvider,
        private rest: RestService,
        private modalController: ModalController,
        private route: ActivatedRoute,
        private router: Router,
        private translateService: TranslateService,
        private oStorage: Storage,
    ) {
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
    }

    ngAfterViewInit() {
        this.loadCheckoutBanners();
    }

    loadCheckoutBanners() {
        this.rest.routes('banners/list/', 'v3').withAuth().get().then(res => {
            res.json().result.forEach((typeBanner) => {
                if (typeBanner.type === 'checkout') {
                    this.bannersCheckout.push(typeBanner);
                }
            });
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({
                message: ex,
                title: 'ERROR LOAD CHECKOUT BANNERS',
            });
        });
    }

    loadAddress(dontEmit?: boolean) {
        if (this.appConfig?.user?.directions) {
            this.appConfig?.user?.directions.forEach((direction: any) => {
                if (direction.favorite) {
                    this.appConfig.addressSelected = direction;
                    this.appConfig.hasFavorite = true;
                    if (!dontEmit) {
                        this.appConfig.setFavorite.emit(true);
                    }
                }
            });
        }
    }

    showAddressSelector() {
        this.loadAddress();
        this.appConfig.hasFavorite = false;
    }

    showDetail(_product) {
        this.modalController.create({
            component: ProductDetailPage,
            componentProps: {
                product: _product,
            },
        }).then((m) => {
            m.present();
            m.onDidDismiss().then(data => {
                this.dismiss(data);
            });
        });
    }

    moreless(product: any, add: boolean) {
        this.items?.forEach((store: any) => {
            store?.products?.forEach((_product: any, index ) => {
                if (product.uuid === _product.uuid) {
                    if (add) {
                        _product.quantity += product.quantity < 100 ? 1 : 0;
                    } else {
                        _product.quantity -= product.quantity > 0 ? 1 : 0;
                        if ( _product.quantity === 0 ) {
                            store?.products?.splice(index, 1);
                        }
                    }
                }

                return _product;
            });

            return store;
        });

        this.oStorage.set('cart-stores', this.items);

        this.calculatePrice();
    }

    emptyCartStore() {
        this.items.forEach((store: any) => {
            store.products.forEach((product: any) => {
                product.quantity = 0;

                return product;
            });

            return store;
        });

        this.oStorage.set('cart-stores', this.items);

        this.calculatePrice();
    }

    calculatePrice() {
        this.appConfig.totalPrice = 0;
        this.items?.forEach((store: any) => {
            store.products.forEach((product: any) => {
                this.appConfig.totalPrice += (product.price * product.quantity);

                return product;
            });
        });
    }

    selectProducts() {
        if (this.items.length > 0) {
            this.modalController.create({
                component: PreordenPage,
                cssClass: 'full-modal',
                componentProps: {
                    items: this.items,
                    service: {
                        name: 'Compra en tienda',
                        code: 'type_store',
                    },
                    serviceType: 'tiendas',
                },
            }).then((m) => {
                m.present();
                m.onDidDismiss().then(data => {
                    if (data.data) {
                        this.dismiss(data);
                    }
                });
            });
        }
    }

    async dismiss(data?: any) {
        this.modalController.getTop().then(() => {
            this.modalController.dismiss(data);
        });
    }

}
