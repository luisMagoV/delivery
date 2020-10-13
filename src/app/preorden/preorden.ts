import {Component, Input, OnInit} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Geolocation, Geoposition} from '@ionic-native/geolocation/ngx';
import {ModalController} from '@ionic/angular';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {GlobalConfigProvider} from '../../providers/global-config';
import RestService, {RestApi} from '../../providers/rest-service';
import {SelectPayPage} from '../select-pay/select-pay';
import {ConfigGlobalProvider} from '../../providers/config.global.provider';
import {PayMethodPage} from '../pay-method/pay-method';

/**
 * Generated class for the PreordenPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-preorden',
    styleUrls: ['preorden.scss'],
    templateUrl: 'preorden.html',
})
export class PreordenPage implements OnInit {

    @Input() public items: any = [];
    @Input() public serviceType = '';
    @Input() public service: any;
    @Input() public generateOther: any;
    promocode: any;
    color = 'transparent';
    mincolor = 'transparent';
    medcolor = 'transparent';
    maxcolor = 'transparent';
    freecolor = 'transparent';
    scolor = '#10D58E';
    typeOrder;
    origin;
    destination;
    info;
    order: any;
    originOrder;
    timeOrder;
    costOrder = 0;
    timeslected = false;
    orderNumber;
    cardSelected;
    paymentType = 'cash';
    isCash = false;
    store;
    code: string;
    promo = '';
    originPlace: any;
    priceComplete = 0;
    itbmsComplete = 0;
    delivery: number;
    kmExtra: number;
    hasService: any;
    priceCompleteWithItbms = 0;
    coupon = '';
    super;
    observaciones;
    loadingCoupons = false;

    constructor(
        public http: Http,
        public oConfigGlobalProvider: ConfigGlobalProvider,
        public appConfig: GlobalConfigProvider,
        private translateService: TranslateService,
        private geolocation: Geolocation,
        private rest: RestService,
        private modalController: ModalController,
        private route: ActivatedRoute,
        private router: Router,
    ) {
        this.translateService.setDefaultLang(this.appConfig.defaultLang);
        this.appConfig.currentLang.subscribe(lang => {
            this.translateService.use(lang);
        });
    }

    back(data?: any) {
        this?.appConfig?.removeStorage('selectedOrigin');
        this?.appConfig?.removeStorage('originService');
        this?.appConfig?.removeStorage('selectedPlace');
        this?.modalController?.dismiss(data);
    }

    ngOnInit() {
        this.appConfig.changeUrl.subscribe(this.back);
        this.loadAll();
    }

    loadAll() {
        this.cardSelected = this.appConfig.cardS;
        this.appConfig.isCash = false;
        this.isCash = false;
        this.typeOrder = '';
        this.timeOrder = '';
        this.costOrder = 0;
        this.orderNumber = '';
        this.originPlace = '';
        this.selectCash();
        this.loadMinTime(this.serviceType);
        this.appConfig.getStorage('selectedPlace').then(res => {
            const addressSelected = {
                lat: this.appConfig.addressSelected.latitude,
                lon: this.appConfig.addressSelected.longitude,
                place: {
                    description: this.appConfig.addressSelected.name,
                },
            };
            this.destination = res || addressSelected;
            this.geolocation.getCurrentPosition({enableHighAccuracy: false}).then((pos: Geoposition) => {
                this.origin = {lat: pos.coords.latitude, lon: pos.coords.longitude, place: res};
            }).catch(ex => {
                // console.log(ex);
            });
        });
        this.appConfig.getStorage('selectedOrigin').then(res => {
            this.originPlace = res;
            if (!this.service.code) {
                this.updateTime('min');
            }
        }).catch((e) => {
            // console.log(e);
        });
        this.appConfig.getStorage('promo').then(res => {
            this.promo = res;
        });
    }

    loadCoupons() {
        if (!this.loadingCoupons) {
            this.loadingCoupons = true;
            this.appConfig.showLoading();
            if (this.appConfig.user) {
                this.rest.routes('coupons/', 'v3').withAuth().get().then(res => {
                    // console.log(res.json());
                    // this.productsFavorite = res.json();

                    // this.categories = res.json().categories;
                    this.appConfig.hideLoading();
                    this.loadingCoupons = false;
                }).catch(ex => {
                    this.loadingCoupons = false;
                    this.oConfigGlobalProvider.showErrorAlert({
                        message: ex,
                        title: 'ERROR LOAD COUPONS',
                    });
                });
            }
        }
    }

    calculate() {
        this.itbmsComplete = 0;
        this.priceComplete = 0;
        this.priceCompleteWithItbms = 0;
        if (this.serviceType === 'tiendas') {
            this.items.forEach((store: any) => {
                store.products.forEach((product: any) => {
                    if (product?.quantity > 0) {
                        this.itbmsComplete += product.itbms * product.quantity;
                        this.priceComplete += product.price * product.quantity;
                    }

                    return product;
                });

                return store;
            });
        } else {
            this.items.forEach((product: any) => {
                this.itbmsComplete += product.itbms * product.quantity;
                this.priceComplete += product.price * product.quantity;
            });
        }
        // this.priceComplete += this.itbmsComplete;
        if (this.hasService) {
            if (this.priceComplete >= this.hasService.umbral) {
                this.delivery = this.hasService.umbral_price;
            }

        }
        this.priceCompleteWithItbms = this.priceComplete + this.delivery + this.itbmsComplete;
    }

    loadMinTime(storeType) {
        if (storeType) {
            this.oConfigGlobalProvider.presentLoading();
            // validar si es versión multiStore
            const store = (!this.appConfig.configStore.multiStore) ? this.items[0].uuid : null;
            this.rest.route('services/get/byname?name=' + storeType + '&store=' + store).get().then((type: any) => {
                this.delivery = parseFloat(type.json().price_service);
                if (type.json().service) {
                    this.hasService = type.json().service;
                }
                this.calculate();
                this.appConfig.hideLoading();
            }).catch(ex => {
                this.oConfigGlobalProvider.showErrorAlert({
                    message: 'error',
                    title: 'ERROR LOAD STORE TYPE',
                });
            });
        }
    }

    updateTime(type) {
        this.appConfig.showLoading();
        this.typeOrder = type;
        // delete query
        const _items = this.items.map(v => {
            v.query = undefined;
            return v;
        });
        this.info = (this.service.name === 'Encomiendas') ? {items: _items} : {list: _items};

        const _headers: Headers = new Headers({
            'Content-Type': 'application/json',
            Authorization: 'JWT ' + this.appConfig.token,
            serviceid: this.hasService.uuid,
        });
        const options: RequestOptions = new RequestOptions({headers: _headers});
        let body: any = {
            priority: this.typeOrder,
            origin: this.originPlace,
            destination: this.destination,
            additional_info: this.info,
            supply_order: this.generateOther,
            payType: 'cash',
        };
        if (this.promo !== '') {
            body.promo_code = this.promo;
        }

         this.http.post(this.appConfig.apiBaseUrl + 'orders', JSON.stringify(body), options).toPromise().then(
             response => {

                 const bodyResponse = JSON.parse(response.text());
                 if (bodyResponse.status === 'ok') {
                     this.order = bodyResponse.order;
                     this.costOrder = parseFloat(this.order.cost); // + this.delivery;
                     this.delivery = parseFloat(this.order.cost);
                     this.kmExtra = parseFloat(this.order.distance);
                     this.timeOrder = this.order.time + ' min';
                     this.orderNumber = this.order.uuid;
                     this.timeslected = true;
                     this.appConfig.setStorage('promo', '');
                     this.appConfig.hideLoading();
                 } else {
                     // console.log('LOG: GENERATE ERROR TO CREATE ORDER');
                 }
             }).catch((error: any) => {
             this.appConfig.hideLoading();
             body = JSON.parse(error._body);
             if (body?.error?.data?.code === 'error_promo_not_found') {
                 this.appConfig.showAlert('Error promo', 'El código de promoción ' + this.promo + ' no existe o ya fue procesada');
                 this.promo = '';
                 this.appConfig.setStorage('promo', '');
             } else if (body?.error?.data?.code === 'error_promo_invalid') {
                 this.appConfig.showAlert('Error promo', 'Promoción no valida en este tipo de servicio');
             } else {
                 this.appConfig.showAlert('Error promo', 'Ha ocurrido un error.');
             }
         });
        switch (type) {
            case 'min':
                this.mincolor = '#10D58E';
                this.medcolor = 'transparent';
                this.maxcolor = 'transparent';
                this.freecolor = 'transparent';
                break;
            case 'med':
                this.mincolor = 'transparent';
                this.medcolor = '#10D58E';
                this.maxcolor = 'transparent';
                this.freecolor = 'transparent';
                break;
            case 'max':
                this.mincolor = 'transparent';
                this.medcolor = 'transparent';
                this.maxcolor = '#10D58E';
                this.freecolor = 'transparent';
                break;
            case 'free':
                this.mincolor = 'transparent';
                this.medcolor = 'transparent';
                this.maxcolor = 'transparent';
                this.freecolor = '#10D58E';
                break;
            default:
                this.mincolor = 'transparent';
                this.medcolor = 'transparent';
                this.maxcolor = 'transparent';
                this.freecolor = 'transparent';
                break;
        }
    }

    async radioChecked(paymentType) {
        this.paymentType = paymentType;
    }

    send() {
        if (this.code === undefined || this.code.length < 3) {
            this.appConfig.showAlert('Información', 'Ingrese un código válido');
            return false;
        }
        this.appConfig.showLoading();
        const _code = this.code.toUpperCase();
        this.rest.route(RestApi.PROMO).withAuth().get({search: {code: _code}}).then(res => {
            const body = res.json();
            if (body.length > 0) {
                this.promo = body[0].code;
                this.appConfig.hideLoading();
                this.appConfig.setStorage('promo', _code);
                if (this.typeOrder !== '')
                    this.updateTime(this.typeOrder);
            } else {
                this.code = '';
                this.appConfig.showAlert('Información', 'Promoción no existe o es inválida');
                this.appConfig.hideLoading();
                return false;
            }
        }).catch(ex => {
            this.code = '';
            this.appConfig.hideLoading();
            this.appConfig.setStorage('promo', '');
            this.appConfig.showErrorAlert();
        });
    }

    deletePromo() {
        // remove promo value and reload orden
        this.promo = '';
        this.appConfig.setStorage('promo', '');
        if (this.typeOrder !== '')
            this.updateTime(this.typeOrder);
    }

    openPayPage() {
        this.modalController.create({
            component: PayMethodPage,
            componentProps: {
                items: this.items,
                orderNumber: this.orderNumber,
                serviceType: this.serviceType,
                service: this.service,
            },
        }).then((m) => {
            m.present();
            m.onDidDismiss().then((data) => {
                if (data.data) {
                    // this.back({});
                    this.dismiss(data);
                }
            });
        });
    }

    async dismiss(data?: any) {
        this.modalController.getTop().then(() => {
            this.modalController.dismiss(data);
        });
    }

    approvedOrder() {
        if (!this.cardSelected && (this.isCash === null || this.isCash === false)) {
            this.appConfig.showAlert('Método de pago', 'Por favor seleccione un método de pago para continuar con la orden');
            return;
        }

        if (this.service.name === 'Compra en tienda') {
            this.appConfig.showLoading();
            const stores = [];
            const products = [];
            let version = 'v1';
            const _body: any = {
                version: 'v2',
            };

            if (!this.appConfig.configStore.multiStore) {
                _body.store = this.items[0].uuid;
                _body.products = this.items[0].products;
            } else {
                version = 'v3';
                this.items.forEach((store: any) => {
                    stores.push(store.uuid);
                    store.products.forEach((product: any) => {
                        product.photo = product.images[0]?.url || '../../assets/img/no-product-image.png';
                        products.push(product);

                        return product;
                    });

                    return store;
                });
                _body.version = version;
                _body.store = stores;
                _body.products = products;
            }

            if (this.cardSelected.card_token) {
                _body.card = this.cardSelected.card_token;
            } else {
                _body.payType = 'cash';
            }

            _body.payType = this.paymentType;
            this.rest.routes('orders', version).addDeviceId().withAuth().post({
                body: _body,
            }).then((orders: any) => {
                const bodyResponse = orders.json();

                if (bodyResponse.status === 'ok') {
                    this.appConfig.removeStorage('cart-stores');
                    this.order = bodyResponse.order;
                    this.orderNumber = this.order.uuid;
                    this.timeslected = true;
                    this.appConfig.hideLoading();
                    this.back();
                    this.router.navigate(['/tabs/status-order'], {
                        replaceUrl: true,
                        queryParams: {
                            data: JSON.stringify({
                                order: bodyResponse.order,
                                type: 2,
                            }),
                        },
                    });
                    /* * /
                    // go to new page to notificate that order its procesing
                    this.router.navigate(['/tabs/final-order'], {
                        replaceUrl: true,
                        queryParams: {
                            data: JSON.stringify({
                                order: bodyResponse.order,
                            }),
                        },
                    });
                    /* */
                } else {
                    this.appConfig.hideLoading();
                }
            }).catch(ex => {
                const bodyError = ex.json();

                this.appConfig.hideLoading();
                if (bodyError.code === 'debtor_user') {
                    this.oConfigGlobalProvider.showErrorAlert({
                        message: 'Estimado cliente, usted cuenta con un saldo negativo. No podemos procesar su pago.',
                        title: 'Saldo Pendiente',
                        buttons: ['Cerrar', {
                            text: 'Realizar Pago', handler: () => {
                                this.openPayPage();
                            },
                        }],
                    });
                    return;
                }

                this.oConfigGlobalProvider.showErrorAlert({
                    message: ex,
                    title: 'ERROR LOAD STORE TYPE',
                    buttons: [
                        {text: 'Cerrar'},
                        {text: 'Intentar de nuevo', handler: () => this.approvedOrder()},
                    ],
                });
            });
        } else {
            if (this.orderNumber !== '') {
                this.rest.routes('orders/' + this.orderNumber + '/status', 'v1').addDeviceId().withAuth().put({
                    body: {
                        status: 'approved',
                        payType: this.paymentType,
                        card: this.cardSelected.card_token,
                    },
                }).then((orders: any) => {
                    const bodyResponse = orders.json();

                    if (bodyResponse.status === 'ok') {
                        // clear data form storage
                        this.appConfig.removeStorage('selectedOrigin');
                        this.appConfig.removeStorage('originService');
                        this.appConfig.removeStorage('selectedPlace');
                        this.appConfig.placeToService = {lon: 0, lat: 0, place: ''};
                        // open page to check status order
                        this.appConfig.setStorage('order', bodyResponse.order);
                        this.appConfig.hideLoading();
                        this.back();
                        this.router.navigate(['/tabs/status-order'], {
                            replaceUrl: true,
                            queryParams: {
                                data: JSON.stringify({
                                    order: bodyResponse.order,
                                    type: 2,
                                }),
                            },
                        });
                    } else {
                        this.appConfig.hideLoading();
                    }
                }).catch(ex => {
                    this.oConfigGlobalProvider.showErrorAlert({
                        message: 'Estimado cliente, ha ocurrido un error al crear la orden.',
                        title: 'Error',
                        buttons: ['Cerrar', {
                            text: 'Reintentar', handler: () => {
                                this.approvedOrder();
                            },
                        }],
                    });
                });
            }
        }
    }

    changeCard() {
        this.modalController.create({
            component: SelectPayPage,
        }).then((m) => {
            m.present();
            m.onDidDismiss().then((data) => {
                if (data.data) {
                    this.cardSelected = data.data;
                }
            });
        });
    }

    selectCash() {
        this.appConfig.cardS = '';
        this.appConfig.setStorage('cardSelected', '');
        this.cardSelected = '';
        this.appConfig.isCash = true;
        this.isCash = true;
        this.paymentType = 'cash';
    }

    cashCoupon() {
        this.rest.routes('coupons/claim/' + this.coupon, 'v3').withAuth().get().then(res => {
            // this.productsFavorite = res.json();

            // this.categories = res.json().categories;
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({
                message: ex,
                title: 'ERROR CASHING COUPON',
            });
        });
        this.coupon = '';
    }

    openUrl() {
        this.router.navigate(['/tabs/comission']);
    }

    closeOrder() {
        this.back({});
        // close order and restart all elements. go to home.
        this.router.navigate(['/tabs']);
    }
}
