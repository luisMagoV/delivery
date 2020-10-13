import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {GlobalConfigProvider} from '../../providers/global-config';
import {ActivatedRoute, Router} from '@angular/router';
import RestService from 'src/providers/rest-service';
import {ConfigGlobalProvider} from 'src/providers/config.global.provider';
import {PreordenPage} from '../preorden/preorden';
import {ModalController} from '@ionic/angular';

/**
 * Generated class for the SupermarketPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-supermarket',
    styleUrls: ['supermarket.scss'],
    templateUrl: 'supermarket.html',
})
export class SupermarketPage implements AfterViewInit {
    service: any = [];
    productItems: any[] = [];
    product;
    quanty = 1;
    brand = '';
    obs = '';
    category;
    unitType = 'Unidades';
    @ViewChild('inputP') myInput;
    kcolor = 'light';
    ucolor = 'primary';
    stores;
    super;

    constructor(
        public oConfigGlobalProvider: ConfigGlobalProvider,
        public appConfig: GlobalConfigProvider,
        private modalCtrl: ModalController,
        private route: ActivatedRoute,
        private rest: RestService,
        private router: Router,
    ) {
        const data: any = JSON.parse(this.route.snapshot.queryParamMap.get('data'));
        this.service = data.service;
    }

    ngAfterViewInit() {
        this.loadMinTime('mercado');
        this.super = '';
    }

    selectK() {
        this.kcolor = 'primary';
        this.ucolor = 'light';
        this.unitType = 'Kilos';
    }

    selectU() {
        this.kcolor = 'light';
        this.ucolor = 'primary';
        this.unitType = 'Unidades';
    }

    delProduct(index) {
        for (let i = 0; i < this.productItems.length; i++) {
            if (i === index) {
                this.productItems.splice(i, 1);
                break;
            }
        }
    }

    ionViewDidLeave() {
        this.productItems = [];
        this.super = '';
    }

    loadMinTime(storeType) {
        // this.appConfig.showLoading();
        this.rest.route('services/get/byname?name=' + storeType)
            .get().then((type: any) => {
            this.stores = type.json().min_time;
            this.appConfig.hideLoading();
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({
                message: ex,
                title: 'ERROR LOAD STORE TYPE',
            });
        });
    }

    uptProduct(index, product) {
        this.product = product.name;
        this.quanty = product.quanty;
        this.brand = product.brand;
        this.obs = product.obs;
        this.category = product.category;
        if (product.unitType === 'Unidades')
            this.selectU();
        else
            this.selectK();
        for (let i = 0; i < this.productItems.length; i++) {
            if (i === index) {
                this.productItems.splice(i, 1);
                break;
            }
        }
    }

    addMarket(product, _quanty, _category, _brand, _obs, _super) {
        if (this.product) {
            const p = {
                name: product,
                quanty: _quanty,
                unitType: this.unitType,
                brand: _brand,
                obs: _obs,
                category: _category,
                super: _super,
            };
            this.productItems.push(p);
            this.product = '';
            this.quanty = 1;
            this.brand = '';
            this.obs = '';
            this.category = '';
            this.selectU();
        }
    }

    processOrder() {
        if (this.productItems.length > 4) {
            this.modalCtrl.create({
                component: PreordenPage,
                cssClass: 'full-modal',
                componentProps: {
                    items: this.productItems,
                    service: this.service,
                    serviceType: 'mercado',
                },
            }).then((m) => {
                m.present();
                m.onDidDismiss().then(data => {
                    // console.log(data);
                });
            });
        } else {
            this.appConfig.showAlert('Atención', 'Pedidos mínimos de 5 productos');
        }
    }

    openUrl() {
        this.router.navigate(['/tabs/comission']);
    }
}
