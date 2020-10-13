import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {ConfigGlobalProvider} from 'src/providers/config.global.provider';
import {GlobalConfigProvider} from 'src/providers/global-config';
import RestService from 'src/providers/rest-service';
import {environment} from '../../environments/environment';

@Component({
    selector: 'app-no-login-product',
    templateUrl: './no-login-product.page.html',
    styleUrls: ['./no-login-product.page.scss'],
})
export class NoLoginProductPage implements OnInit, AfterViewInit {

    products;
    product = '';
    totalPrice: any;
    category = '';
    store = '';

    constructor(
        public oConfigGlobalProvider: ConfigGlobalProvider,
        public appConfig: GlobalConfigProvider,
        private rest: RestService,
        public modalController: ModalController,
    ) {
    }

    dismiss(data?: any) {
        // using the injected ModalController this page
        // can "dismiss" itself and optionally pass back data
        this.modalController.dismiss({
            dismissed: true,
        });
    }

    ngAfterViewInit() {
        this.loadProducts(environment.configStore.store);
    }

    async back(data?: any) {
        this.modalController.getTop().then(() => {
            this.modalController.dismiss(data);
        });
    }

    loadProducts(storeUuid) {
        this.totalPrice = 0;
        this.appConfig.showLoading();
        this.rest.routeClean('products/' + storeUuid).get().then((products: any) => {
            this.products = products.json().products;

            this.products.forEach((product) => {
                product.quantity = 0;

                return product;
            });
            this.appConfig.hideLoading();
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({
                message: ex,
                title: 'ERROR LOAD PRODUCTS',
            });
        });
    }

    formRegister() {
        this.appConfig.showFormRegister = true;
        this.appConfig.showFormRecovery = false;
        this.back();
    }

    less(val, index) {
        if (this.products[index].quantity > 0) this.products[index].quantity -= 1;
        this.totalPrice = 0;
        this.products.forEach((product) => {
            if (product.quantity > 0) {
                this.totalPrice += product.price * product.quantity;
            }

            return product;
        });
    }

    more(val, index) {
        if (this.products[index].quantity < 100) this.products[index].quantity += 1;
        this.totalPrice = 0;
        this.products.forEach((product) => {
            if (product.quantity > 0) {
                this.totalPrice += product.price * product.quantity;
            }

            return product;
        });
    }

    showDetail(product) {
    }

    ngOnInit() {
    }

}
