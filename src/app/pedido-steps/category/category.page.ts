import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {OverlayEventDetail} from '@ionic/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {GlobalConfigProvider} from '../../../providers/global-config';
import RestService, {RestApi} from '../../../providers/rest-service';
import {ConfigGlobalProvider} from '../../../providers/config.global.provider';
import {PreordenPage} from '../../preorden/preorden';
import {ProductDetailPage} from '../../product-detail/product-detail';

/**
 * Generated class for the PayDebtPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-category',
    styleUrls: ['category.scss'],
    templateUrl: 'category.html',
})
export class CategoryPage implements OnInit, AfterViewInit {

    info: any;
    categories: any[] = [];
    colors = [];
    directions = [];
    directionName: string;
    cartStores: any[] = [];
    loadingCategories = false;
    loadingAllFeatured = false;
    loadingProductsFavorites = false;
    loadingStores = false;
    stores = [];
    banners: any[] = [];
    bannersNews: any[] = [];
    bannersOutstanding: any[] = [];
    bannersLatestPromotions: any[] = [];
    productsFavorite: any[] = [];
    storesFavorite: any[] = [];
    searchData: any = [];
    lastOrder: any = [];
    /*
    status = {
        approved: ['Aprobado', 15],
        taken: ['Orden tomada', 30],
        'in progress': ['Camino a entrega', 40],
        sold: ['Productos comprados', 60],
        returned: ['Camino a entrega', 80],
        completed: ['Completada', 100],
        'canceled by platform': ['Cancelado por plataforma', 0],
        'canceled by client': ['Cancelado por el cliente', 70],
    };
     */
    statusText = {
        approved: 'Aprobado',
        taken: 'Orden tomada',
        'in progress': 'Camino a entrega',
        sold: 'Productos comprados',
        returned: 'Camino a entrega',
        completed: 'Completada',
        'canceled by platform': 'Cancelado por plataforma',
        'canceled by client': 'Cancelado por el cliente',
    };
    statusNumber = {
        created: 10,
        approved: 35,
        taken: 45,
        'in progress': 50,
        sold: 60,
        returned: 70,
        completed: 88,
        'canceled by platform': 0,
        'canceled by client': 70,
    };

    slidesOptions = {
        initialSlide: 0,
        slidesPerView: 1,
        autoplay: true,
    };

    constructor(
        public oConfigGlobalProvider: ConfigGlobalProvider,
        public appConfig: GlobalConfigProvider,
        private translateService: TranslateService,
        private rest: RestService,
        private modalCtrl: ModalController,
        private router: Router,
    ) {
        this.oConfigGlobalProvider.login.subscribe(m => this.ngAfterViewInit());
        this.appConfig.setFavorite.subscribe(m => this.ngAfterViewInit(true));
        this.info = this.appConfig.user;
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
    }

    ngOnInit() {
        this.loadAddress();
        this.addressToDirectionName();
        this.info = this.appConfig.user;
    }

    ngAfterViewInit(dontEmit?: boolean) {
        if (!this.appConfig.configStore.multiStore) {
            this.appConfig.removeStorage('cart-stores');
        }
        this.loadCategories();
        this.loadStuff();
        this.loadLastestPromotionsBanners();
        this.loadProductsFavorites();
        this.loadAddress(dontEmit);
        this.loadStores();
        this.addressToDirectionName();
        this.reloadCart();
        // this.loadOrders();
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

    addressToDirectionName() {
        const index = this.appConfig.addressSelected.name.indexOf(',');
        this.directionName = this.appConfig.addressSelected.name.substring(0, index);
    }

    loadCategories() {
        if (!this.loadingCategories) {
            this.loadingCategories = true;
            this.appConfig.showLoading();
            if (this.appConfig.user) {
                this.rest.routeClean('categories').withAuth().get().then(res => {
                    this.categories = res.json().categories;
                    this.appConfig.hideLoading();
                    this.loadingCategories = false;
                    this.randomColors(this.categories.length);
                }).catch(ex => {
                    this.loadingCategories = false;
                    this.oConfigGlobalProvider.showErrorAlert({
                        message: ex,
                        title: 'ERROR LOAD CATEGORIES',
                    });
                });
            }
        }
    }

    loadProductsFavorites() {
        if (!this.loadingProductsFavorites) {
            this.loadingProductsFavorites = true;
            // this.appConfig.showLoading();
            if (this.appConfig.user) {
                // this.rest.routes('favorite-products/' + this.appConfig.user.id, 'v3').withAuth().get().then(res => {
                this.rest.routes('favorite-stores/', 'v3').withAuth().get().then(res => {
                    // this.productsFavorite = res.json();

                    // this.categories = res.json().categories;
                    // this.appConfig.hideLoading();
                    this.loadingProductsFavorites = false;
                }).catch(ex => {
                    this.loadingProductsFavorites = false;
                    this.oConfigGlobalProvider.showErrorAlert({
                        message: ex,
                        title: 'ERROR LOAD PRODUCTS FAVORITES',
                    });
                });


            }
        }
    }

    loadStuff() {
        if (!this.loadingAllFeatured) {
            this.loadingAllFeatured = true;
            this.rest.routes('all-featured-user/', 'v3').withAuth().post({
                body: {
                    user: this.appConfig.user.uuid,
                },
            }).then(res => {
                res.json().banners.forEach((typeBanner) => {
                    if (typeBanner.type === 'home') {
                        this.banners.push(typeBanner);
                    }
                    if (typeBanner.type === 'news') {
                        this.bannersNews.push(typeBanner);
                    }
                    if (typeBanner.type === 'outstanding') {
                        this.bannersOutstanding.push(typeBanner);
                    }
                });

                this.banners = this.shuffle(this.banners);
                this.bannersNews = this.shuffle(this.bannersNews);
                this.bannersOutstanding = this.shuffle(this.bannersOutstanding);

                this.productsFavorite = res.json().productsFavorite;
                //
                this.storesFavorite = res.json().storesFavorite;
                this.lastOrder = res.json().lastorder;
            }).catch(ex => {
                this.oConfigGlobalProvider.showErrorAlert({
                    message: ex,
                    title: 'ERROR LOAD STUFF',
                });
            });
        }
    }

    loadStores() {
        if (!this.loadingStores) {
            this.loadingStores = true;
            this.appConfig.showLoading();
            this.rest.routes('products&stores/home', 'v3').withAuth().get().then((stores: any) => {
                this.stores = stores.json().stores;
                this.appConfig.hideLoading();
                this.loadingStores = false;
            }).catch(ex => {
                this.loadingStores = false;
                this.oConfigGlobalProvider.showErrorAlert({
                    message: ex,
                    title: 'ERROR LOAD STORES',
                });
            });
        }
    }

    shuffle(array) {
        let ctr = array.length;
        let temp: any[] = [];
        let index: number;

        // While there are elements in the array
        while (ctr > 0) {

            // Pick a random index
            index = Math.floor(Math.random() * ctr);

            // Decrease ctr by 1
            ctr--;

            // And swap the last element with it
            temp = array[ctr];
            array[ctr] = array[index];
            array[index] = temp;
        }
        return array;
    }

    loadLastestPromotionsBanners() {
        this.rest.routes('banners/list/', 'v3').withAuth().get().then(res => {
            res.json().result.forEach((typeBanner) => {
                if (typeBanner.type === 'latestPromotions') {
                    this.bannersLatestPromotions.push(typeBanner);
                }
            });
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({
                message: ex,
                title: 'ERROR LOAD LASTEST PROMOTIONS BANNERS',
            });
        });
    }

    Search(ev: CustomEvent) {
        this.searchData = [];
        const val = ev.detail.value;
        if (val && val.trim() !== '') {
            this.rest.routes('products&stores/home?name=' + val, 'v3').withAuth().get().then(res => {
                this.searchData = res.json();
            }).catch(ex => {
                this.oConfigGlobalProvider.showErrorAlert({
                    message: ex,
                    title: 'ERROR LOAD SEARCH DATA',
                });
            });
        }
    }

    showAddressSelector() {
        this.appConfig.hasFavorite = false;
    }

    selectCategory(_category) {
        if (_category.name === 'mensajeria' || _category.name === 'Mesajería') {
            this.router.navigate(['/messaging']);
        } else {
            this.router.navigate(['/tabs/pedido-steps/promo-store'], {
                queryParams: {
                    data: JSON.stringify({
                        category: _category,
                    }),
                },
            });
        }
    }

    viewOrder(_order) {
        this.router.navigate(['/tabs/status-order'], {
            queryParams: {
                data: JSON.stringify({
                    order: _order,
                    type: 2,
                }),
            },
        });
    }

    navigate(_link) {
        this.router.navigate([_link]);
    }

    reloadCart() {
        this.appConfig.getStorage('cart-stores').then((cart) => {
            this.appConfig.totalPrice = 0;
            this.cartStores = cart || [];
            this.cartStores.forEach((store: any) => {
                store.products.forEach((product: any) => {
                    this.appConfig.totalPrice += (product.price * product.quantity);

                    return product;
                });
            });
        });
    }

    selectProducts() {
        this.modalCtrl.create({
            component: PreordenPage,
            componentProps: {
                items: this.cartStores,
                cssClass: 'full-modal',
                service: {
                    name: 'Compra en tienda',
                    code: 'type_store',
                },
                serviceType: 'tiendas',
            },
        }).then((m) => {
            m.present();
            m.onDidDismiss().then(data => {
                // console.log(data);
            });
        });
    }
    /*
    loadOrders() {
        this.appConfig.showLoading();
        this.rest.route(RestApi.ORDERS).withAuth().get().then(res => {
            this.appConfig.hideLoading();
            this.analyze(res.json().orders);
        }).catch(ex => {
            this.appConfig.hideLoading();
            this.appConfig.showErrorAlert([
                {text: 'cerrar'},
                {text: 'intentar de nuevo', handler: () => this.loadOrders()},
            ]);
        });
    }

    analyze(items: any[]) {
        if (items.length > 0) {
            this.lastOrder = [];
            items.forEach((v, i) => {
                switch (v.status) {
                    case 'approved':
                    case 'taken':
                    case 'in progress':
                    case 'sold':
                    case 'returned':
                        this.lastOrder.push(v);
                        //this.pedidos.push(v);
                        break;
                    case 'completed':
                    case 'canceled by platform':
                    case 'canceled by client':
                        // this.antiguos.push(v);
                        break;
                }
            });
        }
    }
     */

    showDetail(_product) {
        this.modalCtrl.create({
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


    selectStoreId(_storeId) {
        this.stores.forEach(_store => {
            if (_store.uuid === _storeId) {
                this.selectStore(_store);
            }
        });
    }

    randomColors(len: number) {
        for (let i = 0; i < len; i++) {
            this.colors.push(this.getRandomColor());
        }
    }

    getRandomColor() {
        const color = Math.floor(0x1000000 * Math.random()).toString(16);
        return '#' + ('000000' + color).slice(-6);
    }

}
