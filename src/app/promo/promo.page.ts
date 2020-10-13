import {AfterViewInit, Component, OnInit} from '@angular/core';
import {NavController} from '@ionic/angular';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {GlobalConfigProvider} from '../../providers/global-config';
import RestService, {RestApi} from '../../providers/rest-service';
import {ConfigGlobalProvider} from '../../providers/config.global.provider';

@Component({
    selector: 'app-tab3',
    templateUrl: 'promo.page.html',
    styleUrls: ['promo.page.scss'],
})
export class PromoPage implements OnInit, AfterViewInit {

    bannersPromotions: any[] = [];
    bannersStorePromotions: any[] = [];
    favoriteCategories = [];
    favoriteStores = [];
    loadingStores = false;
    stores = [];

    slidesOptionsBannners = {
        initialSlide: 0,
        slidesPerView: 1,
        autoplay: true,
    };

    slidesOptionsFavoritesStores = {
        initialSlide: 0,
        slidesPerView: 3,
        autoplay: false,
    };

    constructor(
        private navCtrl: NavController,
        private rest: RestService,
        private route: ActivatedRoute,
        private router: Router,
        private translateService: TranslateService,
        public appConfig: GlobalConfigProvider,
        public oConfigGlobalProvider: ConfigGlobalProvider,
    ) {
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
        this.oConfigGlobalProvider.login.subscribe(m => this.ngAfterViewInit());
        this.appConfig.setFavorite.subscribe(m => this.ngAfterViewInit(true));
        window.screen.orientation.lock('portrait');
    }

    back() {
        this.appConfig.back();
    }

    ngOnInit() {

    }

    ngAfterViewInit(dontEmit?: boolean) {
        this.loadBanners();
        this.loadFavoriteCategory();
        this.loadStores();
    }

    loadBanners() {
        this.rest.routes('banners/list', 'v3').withAuth().get().then(res => {
            res.json().result.forEach((typeBanner) => {
                if ( typeBanner.type === 'Promotions') {
                    this.bannersPromotions.push(typeBanner);
                }
                if ( typeBanner.type === 'storePromotions') {
                    this.bannersStorePromotions.push(typeBanner);
                }
            });
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({
                message: ex,
                title: 'ERROR LOAD BANNERS',
            });
        });
    }

    loadFavoriteCategory() {
        this.rest.routes('category-favorite/', 'v3').withAuth().get().then(res => {
            this.favoriteCategories = res.json().categories;
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({
                message: ex,
                title: 'ERROR LOAD FAVORITE CATEGORIES',
            });
        });
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

    selectStoreBanner(_banner) {
        if (_banner.link === 'null') {
            this.selectStoreId(_banner.store);
        } else {
            this.router.navigate([_banner.link]);
        }
    }

    selectStoreId(_storeId) {
        this.stores.forEach(_store => {
            if (_store.uuid === _storeId) {
                this.router.navigate(['/tabs/pedido-steps/products'], {
                    queryParams: {
                        data: JSON.stringify({
                            store: _store,
                        }),
                    },
                });
            }
        });
    }

    selectCategory(_category) {
        this.router.navigate(['/tabs/pedido-steps/promo-store'], {
            queryParams: {
                data: JSON.stringify({
                    category: _category,
                }),
            },
        });
    }
}
