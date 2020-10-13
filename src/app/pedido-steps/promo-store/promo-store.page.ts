import {AfterViewInit, Component, OnInit} from '@angular/core';
import {NavController} from '@ionic/angular';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {GlobalConfigProvider} from '../../../providers/global-config';
import RestService, {RestApi} from '../../../providers/rest-service';
import {ConfigGlobalProvider} from '../../../providers/config.global.provider';

@Component({
    selector: 'page-promo-store',
    templateUrl: 'promo-store.html',
    styleUrls: ['promo-store.scss'],
})
export class PromoStorePage implements OnInit, AfterViewInit {

    category: any = {};
    code: string;
    promo: any;
    directionName: string;
    loadingStoresCat = false;
    storesCat = [];
    loadingStoresSubCat = false;
    storesSubCat = [];
    loadingBannersCategory = false;
    bannersCategory = [];
    loadingBannersSubCategory = false;
    bannersSubCategory = [];

    slidesOptions = {
        initialSlide: 0,
        slidesPerView: 1,
        autoplay: true,
    };

    slidesOptions2 = {
        initialSlide: 0,
        slidesPerView: 2.5,
        autoplay: false,
        slideShadows: false,
    };

    constructor(
        private navCtrl: NavController,
        private rest: RestService,
        public appConfig: GlobalConfigProvider,
        public oConfigGlobalProvider: ConfigGlobalProvider,
        private translateService: TranslateService,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.oConfigGlobalProvider.login.subscribe(m => this.ngAfterViewInit());
        this.appConfig.setFavorite.subscribe(m => this.ngAfterViewInit(true));
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
        this.loadData();
    }

    back() {
        this.appConfig.back();
    }

    ngOnInit() {
        this.loadAddress();
        this.addressToDirectionName();
    }

    ngAfterViewInit(dontEmit?: boolean) {
        this.loadAddress(dontEmit);
        this.addressToDirectionName();
        this.loadData();
        if (this.appConfig.hasFavorite && this.category.uuid) {
            this.loadStoresCat(this.category.uuid);
            this.loadStoresSubCat('672723e0-c2f6-40cf-bdd0-67010cdf86c5');
            this.loadBannersCategory(this.category.uuid);
            this.loadBannersSubCategory(this.category.uuid);
        }
    }

    loadData() {
        const data: any = JSON.parse(this.route.snapshot.queryParamMap.get('data'));
        this.category = data?.category || {};
        this.category.uuid = this.appConfig.configStore.autocategory ? this.appConfig.configStore.category : this.category.uuid;
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

    loadStoresCat(categoryUuid) {
        if (!this.loadingStoresCat) {
            this.loadingStoresCat = true;
            this.appConfig.showLoading();
            this.rest.routeClean('stores').withAuth().post({
                body: {
                    category_uuid: categoryUuid,
                },
            }).then((stores: any) => {
                this.storesCat = stores.json().stores;
                this.appConfig.hideLoading();
                this.loadingStoresCat = false;
            }).catch(ex => {
                this.loadingStoresCat = false;
                this.oConfigGlobalProvider.showErrorAlert({
                    message: ex,
                    title: 'ERROR LOAD STORES CATEGORIES',
                });
            });
        }
    }

    loadStoresSubCat(subcategoryUuid) {
        if (!this.loadingStoresSubCat) {
            this.loadingStoresSubCat = true;
            // this.appConfig.showLoading();
            this.rest.routeClean('stores').withAuth().post({
                body: {
                    subcategory_uuid: subcategoryUuid,
                },
            }).then((stores: any) => {
                this.storesSubCat = stores.json().stores;
                // this.appConfig.hideLoading();
                this.loadingStoresSubCat = false;
            }).catch(ex => {
                this.loadingStoresSubCat = false;
                this.oConfigGlobalProvider.showErrorAlert({
                    message: ex,
                    title: 'ERROR LOAD STORES SUBCATEGORIES',
                });
            });
        }
    }

    loadBannersCategory(categoryUuid) {
        if (!this.loadingBannersCategory) {
            this.loadingBannersCategory = true;
            this.appConfig.showLoading();
            this.rest.routes('banners/list?category=' + categoryUuid + '&active=' + true, 'v3')
                .withAuth().get().then((banners: any) => {
                this.bannersCategory = banners.json().result;
                this.appConfig.hideLoading();
                this.loadingBannersCategory = false;
            }).catch(ex => {
                if ( ex.status !== 400) {// If is different than a bad request
                    this.loadingBannersCategory = false;
                    this.oConfigGlobalProvider.showErrorAlert({
                        message: ex,
                        title: 'ERROR LOAD BANNERS CATEGORY',
                    });
                }
            });
        }
    }

    loadBannersSubCategory(categoryUuid) {
        if (!this.loadingBannersSubCategory) {
            this.loadingBannersSubCategory = true;
            this.appConfig.showLoading();
            this.rest.routes('subcategories/list?category=' + categoryUuid, 'v3')
                .withAuth().get().then((banners: any) => {
                this.bannersSubCategory = banners.json().result;
                this.appConfig.hideLoading();
                this.loadingBannersSubCategory = false;
            }).catch(ex => {
                if ( ex.status !== 400) {// If is different than a bad request
                    this.loadingBannersSubCategory = false;
                    this.oConfigGlobalProvider.showErrorAlert({
                        message: ex,
                        title: 'ERROR LOAD BANNERS SUBCATEGORY',
                    });
                }
            });
        }
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

    addressToDirectionName() {
        const index = this.appConfig.addressSelected.name.indexOf(',');
        this.directionName = this.appConfig.addressSelected.name.substring(0, index);
    }

    showAddressSelector() {
        this.appConfig.hasFavorite = false;
    }

    send() {
        if (this.code === undefined || this.code.length < 3) {
            this.appConfig.showAlert('Información', 'Ingrese un código válido');
            return false;
        }
        this.appConfig.showLoading();
        this.rest.route(RestApi.PROMO).withAuth().get({search: {code: this.code.toUpperCase()}}).then(res => {
            const body = res.json();
            if (body.length > 0) {
                this.promo = body[0];
                this.appConfig.hideLoading();
                this.appConfig.setStorage('promo', this.code.toUpperCase());
                this.code = null;
            } else {
                this.appConfig.showAlert('Información', 'Promoción no existe o es inválida');
                this.appConfig.hideLoading();
                return false;
            }
        }).catch(ex => {
            this.appConfig.hideLoading();
            this.appConfig.setStorage('promo', '');
            this.appConfig.showErrorAlert();
        });
    }

}
