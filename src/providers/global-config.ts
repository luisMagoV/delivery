import {EventEmitter, Injectable, Output} from '@angular/core';
import {AlertController} from '@ionic/angular';
import {environment} from '../environments/environment';
import {Location} from '@angular/common';
import {ConfigGlobalProvider} from './config.global.provider';
import {NavigationEnd, Router} from '@angular/router';
import {Storage} from '@ionic/storage';
import {DeviceInfo, Device} from '@capacitor/core';

/*
  Generated class for the GlobalConfigProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class GlobalConfigProvider {

    @Output() login: EventEmitter<any> = new EventEmitter();
    @Output() setFavorite: EventEmitter<any> = new EventEmitter();
    @Output() changeUrl: EventEmitter<any> = new EventEmitter();
    public currentLang: EventEmitter<string> = new EventEmitter();
    public defaultLang = 'es';
    public environment = environment;
    public logIn = environment.login;
    public configStore = environment.configStore;
    public debug = environment.debug;
    public showFormRecovery = false;
    public showFormRegister = false;
    public apiBaseUrl: string = environment.uri + '/v1/';
    public token = '';
    public user: any = null;
    public lat = 0;
    public lng = 0;
    public cardS = '';
    public isCash = false;
    public placeToService: { lon: number; place: any; lat: number } = {lon: 0, lat: 0, place: ''};
    public uid = '';
    public ref: any;
    public refChat: any;
    addressSelected: any = '';
    hasFavorite = false;
    loading: HTMLIonLoadingElement;
    page = 0;
    totalPrice: any;
    device: DeviceInfo = {
        appId: '',
        appName: '',
        appBuild: '',
        appVersion: '',
        isVirtual: false,
        manufacturer: 'Apple Inc.',
        model: 'iPhone',
        operatingSystem: 'ios',
        osVersion: '13.2.3',
        platform: 'ios',
        uuid: 'cf84db1b-7c9d-4270-b963-d4967c738e5e',
    };
    private pageVisit: any[] = [];

    constructor(
        private alertCtrl: AlertController,
        private oLocation: Location,
        private oConfigGlobalProvider: ConfigGlobalProvider,
        private router: Router,
        private oStorage: Storage,
    ) {
    }

    resetConfig() {
        this.pageVisit = [];
        this.logIn = environment.login;
        this.configStore = environment.configStore;
        this.debug = environment.debug;
        this.showFormRecovery = false;
        this.showFormRegister = false;
        this.apiBaseUrl = environment.uri + '/v1/';
        this.token = '';
        this.user = null;
        this.lat = 0;
        this.lng = 0;
        this.cardS = '';
        this.isCash = false;
        this.placeToService = {lon: 0, lat: 0, place: ''};
        this.uid = '';
        this.ref = undefined;
        this.refChat = undefined;
        this.addressSelected = '';
        this.hasFavorite = false;
        this.loading = undefined;
        this.page = 0;
        this.totalPrice = undefined;
    }

    routerNotExist(path: string, callback: any) {
        if (this.pageVisit.indexOf(path) < 0) {
            this.pageVisit.push(path);
            callback();
        }
    }

    routerReload(path: string, callback: any) {
        this.routerNotExist(path, () => {
            this.router.events.subscribe(m => {
                if (m instanceof NavigationEnd) {
                    if (m.url.startsWith(path)) {
                        callback();
                    }
                }
            });
        });
    }

    back() {
        this.changeUrl.emit();
        this.oLocation.back();
    }

    showAlert(title: string, subtitle: string, _buttons: any[] = ['OK']) {
        this.alertCtrl.create({
            header: title,
            subHeader: subtitle,
            buttons: _buttons,
        }).then((alert) => {
            alert.present();
        });
    }

    showErrorAlert(_buttons?: any[], subtitle?: string, title?: string) {
        this.alertCtrl.create({
            header: title !== undefined ? title : 'Error Generado',
            subHeader: subtitle !== undefined ? subtitle : 'Upps. Algo salió mal',
            buttons: _buttons ? _buttons : ['Cerrar'],
        }).then((alert) => {
            alert.present();
        });
    }

    showLoading(message?: string): void {
        this.oConfigGlobalProvider.presentLoading(message);
    }

    hideLoading() {
        return this.oConfigGlobalProvider.dismissLoading();
    }

    setStorage(key, value) {
        this.oStorage.set(key, value);
    }

    getStorage(key) {
        return this.oStorage.get(key);
    }

    removeStorage(key) {
        return this.oStorage.remove(key);
    }

    clearStorage() {
        return this.oStorage.clear();
    }

    /* * /
    getByteLen(normalVal) {
        normalVal = String(normalVal);

        let byteLen = 0;
        for (let i = 0; i < normalVal.length; i++) {
            const c = normalVal.charCodeAt(i);
            byteLen += c < (1 << 7) ? 1 :
                c < (1 << 11) ? 2 :
                    c < (1 << 16) ? 3 :
                        c < (1 << 21) ? 4 :
                            c < (1 << 26) ? 5 :
                                c < (1 << 31) ? 6 : Number.NaN;
        }
        return byteLen;
    }
    /* */

    isEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    toDataUrl(url, callback) {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            const reader = new FileReader();
            reader.onloadend = () => {
                callback(reader.result);
            };
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }

    getCardType(_number) {
        const re = {
            electron: /^(4026|417500|4405|4508|4844|4913|4917)\d+$/,
            maestro: /^(5018|5020|5038|5612|5893|6304|6759|6761|6762|6763|0604|6390)\d+$/,
            dankort: /^(5019)\d+$/,
            interpayment: /^(636)\d+$/,
            unionpay: /^(62|88)\d+$/,
            visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
            mastercard: /^5[1-5][0-9]{14}$/,
            amex: /^3[47][0-9]{13}$/,
            diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
            discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
            jcb: /^(?:2131|1800|35\d{3})\d{11}$/,
        };

        for (const key in re) {
            if (re[key].test(_number)) {
                return key;
            }
        }
    }

    setFirebaseRef(ref: any): void {
        if (this.ref) {
            // this.ref.unsubscribe();
            this.ref.remove();
            this.ref = null;
        }
        this.ref = ref;
    }

    setChatRef(ref: any): void {
        if (this.refChat) {
            // this.refChat.unsubscribe();
            this.refChat.remove();
            this.refChat = null;
        }
        this.refChat = ref;
    }

    removeFirebaseRef(): void {
        if (this.ref) {
            this.ref.unsubscribe();
            this.ref = null;
        }
    }

    getErrorMessage(o) {
        return this.oConfigGlobalProvider.getErrorMessage(o);
    }

    initLang() {
        this.getStorage('lang').then(langApp => {
            Device.getLanguageCode().then(langDeviceTemp => {

                const langDevice = langDeviceTemp.value.substr(0, 2);

                if (langApp === null) {
                    if ( langDevice === 'es' || langDevice === 'en' ) {
                        this.defaultLang = langDevice;
                    } else {
                        this.setStorage('lang', this.defaultLang);
                    }
                } else {
                    this.defaultLang = langApp;
                }
            });
        });
    }

    setLang(val) {
        this.setStorage('lang', val);
        this.defaultLang = val;
        this.currentLang.emit(val);
    }

}
