import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {IonInfiniteScroll, ModalController} from '@ionic/angular';
import {TranslateService} from '@ngx-translate/core';
import {GlobalConfigProvider} from '../../../providers/global-config';
import RestService from '../../../providers/rest-service';
import {ConfigGlobalProvider} from '../../../providers/config.global.provider';
import {ProductDetailPage} from '../../product-detail/product-detail';
import {CheckoutPage} from '../checkout/checkout.page';
import {ProductOpinionPage} from '../../product-opinion/product-opinion';

/**
 * Generated class for the PayDebtPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-products',
    styleUrls: ['products.scss'],
    templateUrl: 'products.html',
})
export class ProductsPage implements AfterViewInit {

    @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
    searchBar = this.appConfig.configStore.searchBar;
    categoriesBar = this.appConfig.configStore.searchBar;
    directionName: string;
    search = '';
    category = '';
    products: any[] = [];
    productsFavorites: any[] = [];
    cartStores: any[] = [];
    stores;
    items = [];
    categories = [];
    store: any = [];
    product = '';
    directions = [];
    loadingProducts = false;
    loadingProductsFavorites = false;
    page = 1;
    infoModal = false;

    constructor(
        public oConfigGlobalProvider: ConfigGlobalProvider,
        public appConfig: GlobalConfigProvider,
        private translateService: TranslateService,
        private rest: RestService,
        private modalCtrl: ModalController,
        private route: ActivatedRoute,
    ) {
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
        this.loadData();
        this.loadAddress(true);
        this.appConfig.routerReload('/tabs/pedido', () => {
            this.loadData();
            this.loadAll();
        });
    }

    back() {
        this.appConfig.back();
    }

    loadInfiniteHorizontal(event: any) {
        const left = event.target.clientWidth + event.target.scrollLeft + 150;

        if (!this.loadingProducts && left > event.target.scrollWidth && this.page < 999) {
            this.loadProducts(this.store.uuid);
        }
    }

    loadInfinite(event?: any) {
        if (this.page < 999) {
            this.loadProducts(this.store.uuid, event);
        }
    }

    loadData() {
        if (!this.appConfig.configStore.multiStore) {
            this.appConfig.removeStorage('cart-stores');
        }
        this.addressToDirectionName();
        const data: any = JSON.parse(this.route.snapshot.queryParamMap.get('data'));
        this.appConfig.totalPrice = 0;
        this.store = data.store;
        this.store.products = [];
        this.cartStores = [];
        this.products = [];
        this.page = 1;
        this.appConfig.getStorage('cart-stores').then((cart) => {
            this.cartStores = cart || [];

            this.reloadCart();
        });
    }

    addressToDirectionName() {
        const index = this.appConfig.addressSelected.name.indexOf(',');
        this.directionName = this.appConfig.addressSelected.name.substring(0, index);
    }

    reloadCart() {
        const indexStore = this.cartStores.findIndex((item) => item.id === this.store.id);
        if (indexStore > -1) {
            this.store = this.cartStores[indexStore];
            this.cartStores.splice(indexStore, 1);
        }

        this.store.products.forEach((product: any) => {
            const index = this.products.findIndex((item) => item.id === product.id);
            if (index > -1) {
                this.products[index] = product;
            }

            return product;
        });

        if (this.store.products.length > 0) {
            this.cartStores.push(this.store);
        }

        this.calculatePrice();
    }

    loadAll() {
        this.appConfig.showLoading();
        this.appConfig.totalPrice = 0;
        this.loadProducts(this.store.uuid);
        this.loadProductsFavorites(this.store.uuid);
        this.loadMinTime('tiendas');
        this.calculatePrice();

        if (this.searchBar) {
            this.loadCategories();
        }

        this.appConfig.hideLoading();
    }

    ngAfterViewInit() {
        this.loadAll();
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

    favStore(store) {
        if (this.appConfig.user) {
            this.rest.routes('favorite-stores', 'v3').withAuth().post({
                body: {
                    user: this.appConfig.user.uuid,
                    store: store.uuid,
                },
            }).then(res => {
            }).catch(ex => {
            });
        }
    }

    showAddressSelector() {
        this.loadAddress();
        this.appConfig.hasFavorite = false;
    }

    changeSearch(event: any) {
        this.search = event?.detail?.value || '';
        this.products = [];
        this.page = 1;
        this.infiniteScroll.disabled = this.search.trim().length > 0;
        this.loadProducts(this.store.uuid);
    }

    resetCategory() {
        if (this.category !== '') {
            this.category = '';
            this.products = [];
            this.page = 1;
            this.loadProducts(this.store.uuid);
        }
    }

    selectCategory(_category: any) {
        this.category = _category;
        this.products = [];
        this.page = 1;
        this.loadProducts(this.store.uuid);
    }

    loadCategories() {
        this.appConfig.showLoading();
        this.rest.routeClean('data/products/category/uuid/' + this.store.uuid).withAuth().get().then((categories: any) => {
            this.categories = categories.json();
            this.appConfig.hideLoading();
        }).catch(ex => {
            this.categoriesBar = false;
            this.oConfigGlobalProvider.showErrorAlert({
                message: ex,
                title: 'ERROR LOAD CATEGORIES',
            });
        });
    }

    loadProducts(storeUuid, event?: any) {
        if (!this.loadingProducts) {
            const page = this.page + 1;
            this.loadingProducts = true;
            this.appConfig.showLoading();

            this.rest.routes(
                // 'products/' + storeUuid + '?version=v3&name=' + this.search + '&category=' + this.category + '&page=' + this.page, 'v2'
                'products-category/' + storeUuid + '?version=v3&name=' + this.search + '&category=' + this.category + '&page=' + this.page, 'v3',
            ).withAuth().get().then((products: any) => {
                products = products?.json();
                this.page = 999;

                products?.categoriesProducts?.forEach((category: any) => {
                    let iCat = this.products.findIndex((item) => item.category === category.category);

                    if (iCat < 0) {
                        this.products.push({
                            category: category.category,
                            products: [],
                        });

                        iCat = this.products.findIndex((item) => item.category === category.category);
                    } else {
                        this.products[iCat].page++;
                    }

                    if (category.products.length > 0) {
                        this.page = page;
                    }

                    category.products.forEach((product: any) => {
                        product.quantity = 0;
                        product.itbms = product.itbms || 0;
                        this.products[iCat].products.push(product);

                        return product;
                    });

                    return category;
                });

                if (event) {
                    event.target.complete();
                }

                this.reloadCart();
                this.appConfig.hideLoading();
                this.loadingProducts = false;
            }).catch(ex => {
                this.loadingProducts = false;
                this.oConfigGlobalProvider.showErrorAlert({
                    message: ex,
                    title: 'ERROR LOAD PRODUCTS',
                });
            });
        }
    }

    loadProductsFavorites(storeUuid, event?: any) {
        if (!this.loadingProductsFavorites) {
            this.loadingProductsFavorites = true;
            this.appConfig.showLoading();
            this.rest.routes('products-favorite/' + storeUuid + '/', 'v3')
                .withAuth().get().then((products: any) => {
                products?.json()?.products?.forEach((product: any) => {
                    product.quantity = 0;
                    product.itbms = product.itbms || 0;
                    this.productsFavorites.push(product);

                    return product;
                });
                if (event) {
                    event.target.complete();
                }
                this.reloadCart();
                this.appConfig.hideLoading();
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

    loadMinTime(storeType) {
        // this.appConfig.showLoading();
        this.rest.route('services/get/byname?name=' + storeType + '&store=' + this.store.uuid).get().then((type: any) => {
            this.stores = type.json().min_time;
            this.appConfig.hideLoading();
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({
                message: ex,
                title: 'ERROR LOAD STORE TYPE',
            });
        });
    }

    opinion(product) {
        this.modalCtrl.create({
            component: ProductOpinionPage,
            componentProps: {
                product,
                store: this.store,
            },
        }).then((m) => {
            m.present();
            m.onDidDismiss().then(data => {
                if (data?.data?.add) {
                    //
                }
            });
        });
    }

    info() {
        this.infoModal = !this.infoModal;
    }

    showDetail(product, add?: boolean) {
        this.modalCtrl.create({
            component: ProductDetailPage,
            componentProps: {
                product,
                add,
            },
        }).then((m) => {
            m.present();
            m.onDidDismiss().then(data => {
                if (data?.data?.add) {
                    this.moreless(product, true);
                }
            });
        });
    }

    moreless(product: any, add: boolean) {
        if (add) {
            product.quantity += product.quantity < 100 ? 1 : 0;
        } else {
            product.quantity -= product.quantity > 0 ? 1 : 0;
        }

        const index = this.store.products.findIndex((item) => item.id === product.id);
        if (index > -1) {
            this.store.products.splice(index, 1);
        }

        if (product.quantity > 0) {
            this.store.products.push(product);
        }

        this.reloadCart();
        this.appConfig.setStorage('cart-stores', this.cartStores);

        this.calculatePrice();
    }

    calculatePrice() {
        this.appConfig.totalPrice = 0;
        this.cartStores.forEach((store: any) => {
            store.products.forEach((product: any) => {
                this.appConfig.totalPrice += (product.price * product.quantity);

                return product;
            });
        });
    }

    selectProducts() {
        if (this.cartStores.length > 0) {
            this.modalCtrl.create({
                // component: PreordenPage,
                component: CheckoutPage,
                cssClass: 'full-modal',
                componentProps: {
                    items: this.cartStores,
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
                        this.loadData();
                        this.loadAll();
                    }
                });
            });
        }
    }

}
