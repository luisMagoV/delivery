import {Injectable} from '@angular/core';
import {Headers, Http, Request, RequestMethod, RequestOptions, Response, URLSearchParams} from '@angular/http';
import {DeviceInfo, Device} from '@capacitor/core';
import {GlobalConfigProvider} from './global-config';
import {environment} from '../environments/environment';
// import { LoadingController, Loading, LoadingOptions } from 'ionic-angular';

// Routes
export enum RestApi {
    APPLE = 'auth/rrss/apple',
    FACEBOOK = 'auth/rrss/fb',
    GOOGLEPLUS = 'auth/rrss/google',
    EMAIL_VALID = 'auth/isValidEmail/{0}',
    USER = 'users', // uid
    USERS = 'users/{0}', // uid
    USERS_RESET = 'users/{0}/reset', // uid
    USERS_CHANGE = 'users/changepassword', // uid
    PROFILE = 'users/{0}/profile', // correo
    PUT_PROFILE = 'users/update',
    PUT_AVATAR = 'users/avatar',
    DEL_CARDS = 'cards/{0}', // id carf
    CARDS = 'cards',
    CARDS_VAL = 'cards/{0}/validate',
    ADDRESS = 'directions',
    DEL_ADDRESS = 'directions/{0}', // id direction
    ORDERS = 'orders', // id direction
    ORDERS_STATUS = 'orders/{0}', // id direction
    PROMO = 'promo',
    FAQ = 'faq',
    SUPPORT = 'users/sendemail',
    CHAT = 'orders/{0}/chat',
    CHAT_SEND = 'message/orders/{0}',
    FCM_TOKEN = 'fcm/token',
    RATING = 'rating',
    GET_RATING = 'rating/average/{0}',
    CLAIMS = 'claims',
    CLAIMSTYPE = 'claimtype',
    DEBTS = 'users/pay_debts',
    REQUEST_SERVICE = 'services/requested',
    VALID_CODE_EMAIL = '',
}

export enum TypeContent {
    JSON = 'application/json',
    FORM = 'multipart/form-data',
    URL_ENCODE = 'application/x-www-form-urlencoded',
}

export interface RestSchema {
    url?: string | string[];
    body?: any;
    search?: any;
    headers?: {};
    auth?: boolean;
    type?: TypeContent;
}

export class RestModel {
    url: string;
    body: any;
    search: URLSearchParams;
    headers: Headers;
    type: TypeContent;
    attempts: number;

    constructor(data: RestSchema, urlBase: string) {
        if (data) {
            this.url = this.buildUrl(urlBase, data.url);
            this.search = this.toParams(data.search);
            this.type = data.type ? data.type : TypeContent.JSON;
            this.headers = this.buildHeaders(data.headers, data.type);
            this.body = data.body;

            if (data.body) {
                switch (this.type) {
                    case TypeContent.FORM:
                        this.body = this.getFormdata(this.body);
                        break;
                    case TypeContent.URL_ENCODE:
                        this.body = this.toParams(this.body).toString();
                        break;
                    default:
                        this.body = JSON.stringify(this.body);
                }
            }
        } else {
            this.url = urlBase;
        }
    }

    buildUrl(base: string, params: string | string[]): string {
        if (params) {
            if (Array.isArray(params)) {
                return base + '/' + (<string[]>params).join('/');
            } else {
                return base + '/' + params;
            }
        }
        return base;
    }

    toParams(params: any): URLSearchParams {
        let search: URLSearchParams;
        if (params) {
            search = new URLSearchParams();
            for (const field in params) {
                if (params.hasOwnProperty(field)) {
                    search.set(field, params[field]);
                }
            }
        }
        return search;
    }

    getFormdata(value: any) {
        const form = new FormData();
        for (const key in value) {
            if (value.hasOwnProperty(key)) {
                this.parseData(form, key, value[key]);
            }
        }
        return form;
    }

    parseData(form: FormData, k: any, value: any, isArray = false) {
        if (value && Array.isArray(value)) {
            value.forEach((e: any, i: any) => {
                this.parseData(form, k + '[' + i + ']', e);
            });
        } else if (value && typeof value === 'object' && !(value instanceof File)) {
            for (const key in value) {
                if (value.hasOwnProperty(key)) {
                    this.parseData(form, k + '[' + key + ']', value[key]);
                }
            }
        } else {
            form.append(k, value);
        }
    }

    buildHeaders(items, type) {
        const headers: Headers = new Headers();
        if (items) {
            for (const key in items) {
                if (items.hasOwnProperty(key)) {
                    headers.append(key, items[key]);
                }
            }
        }
        switch (type) {
            case TypeContent.FORM:
                break;
            case TypeContent.URL_ENCODE:
                headers.set('Content-Type', this.type.toString());
                break;
            default:
                headers.set('Content-Type', this.type.toString());
        }
        return headers;
    }
}

@Injectable()
export default class RestService {

    protected static token: any;
    protected urlBase: string;
    private url: string;
    private req: RequestOptions;
    private deviceInfo: DeviceInfo;

    constructor(
        public http: Http,
        private appConfig: GlobalConfigProvider,
    ) {
        this.req = new RequestOptions();
        this.setBase(appConfig.apiBaseUrl);
        Device.getInfo().then((deviceInfo: DeviceInfo) => this.deviceInfo = deviceInfo);
    }

    setBase(url: string) {
        this.urlBase = url;
    }

    base(url: string) {
        this.urlBase = url;
        return this;
    }

    route(route: RestApi | string, ...param: string[]) {
        this.url = this.urlBase + route;
        if (param) {
            let c = 0;
            for (const p of param) {
                this.url = this.url.replace('{' + c + '}', p);
                c++;
            }
        }
        return this;
    }

    routeClean(route: RestApi | string, ...param: string[]) {
        this.url = environment.uri + '/v2/' + route;
        if (param) {
            let c = 0;
            for (const p of param) {
                this.url = this.url.replace('{' + c + '}', p);
                c++;
            }
        }
        return this;
    }

    routes(route: string, version?: string) {
        this.url = environment.uri + '/' + (version || 'v2') + '/' + route;

        return this;
    }

    clearToken() {
        this.setToken(null);
    }

    getToken() {
        return RestService.token;
    }

    setToken(token: string) {
        RestService.token = token;

        this.addHeader('Authorization', 'JWT ' + RestService.token);
    }

    addDeviceId() {
        return this.addHeader('deviceid', (environment.debug) ? environment?.deviceId : this.deviceInfo?.uuid);
    }

    addHeader(key: string, value: string) {
        if (!this.req.headers) {
            this.req.headers = new Headers();
        }

        this.req.headers.set(key, value);

        return this;
    }

    login(info?: RestSchema, attempts: number = 0) {
        this.url = this.urlBase + 'auth';
        return this.post(info, attempts);
    }

    post(info?: RestSchema, attempts: number = 0) {
        this.setMethod(info, RequestMethod.Post);
        return this.response(attempts);
    }

    get(info?: RestSchema, attempts: number = 0) {
        this.setMethod(info, RequestMethod.Get);
        return this.response(attempts);
    }

    put(info?: RestSchema, attempts: number = 0) {
        this.setMethod(info, RequestMethod.Put);
        return this.response(attempts);
    }

    delete(info?: RestSchema, attempts: number = 0) {
        this.setMethod(info, RequestMethod.Delete);
        return this.response(attempts);
    }

    withAuth() {
        this.setToken(this.appConfig.token || environment.jwt);

        return this;
    }

    private setMethod(info: RestSchema = null, _method: RequestMethod, handler?: (data: any) => void) {
        const data = new RestModel(info, this.url);

        if (this.req.headers && data.headers) {
            for (const name of data.headers.keys()) {
                this.req.headers.set(name, data.headers.get(name));
            }
        }

        this.req = new RequestOptions({
            method: _method,
            search: data.search,
            body: data.body,
            headers: this.req.headers ? this.req.headers : data.headers,
            url: data.url,
        });

    }

    private response(attempts: number = 0): Promise<Response> {
        const promise = new Promise<Response>((resolve, reject) => {
            this.sendPromise(new Request(this.req), attempts, resolve, reject);
        });
        this.clear();
        return promise;
    }

    private sendPromise(req: Request, attempts: number, resolve, reject): void {
        this.http.request(req).subscribe(data => {
            resolve(data);
        }, error => {
            if (0 < attempts) {
                this.sendPromise(req, attempts--, resolve, reject);
            } else if (-1 === attempts) { // infinito
                this.sendPromise(req, -1, resolve, reject);
            } else {
                reject(error);
                // console.log(error);
                // alert(error);
            }
        }, /*, () => {
            resolve(null);
        }*/);
    }

    private clear() {
        this.req = new RequestOptions();
    }

}
