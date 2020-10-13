import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders, HttpResponse} from '@angular/common/http';
import {ConfigGlobalProvider} from './config.global.provider';
import {map} from 'rxjs/operators';

export enum RestApi {
    FACEBOOK = 'auth/rrss/fb',
    GOOGLEPLUS = 'auth/rrss/google',
    EMAIL_VALID = 'auth/isValidEmail/{0}',
    USERS = 'users/{0}', // uid
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

@Injectable()
export class RestProvider {

    constructor(
        private oHttpClient: HttpClient,
        private oConfigGlobalProvider: ConfigGlobalProvider,
    ) {
    }

    /**
     * obtiene las cabeceras
     */
    private getHeaders(): any {
        return new HttpHeaders()
            .set('Content-type', 'application/json');
    }

    /**
     * llama a un evento mientras carga a informacion
     */
    private callEvent<T>(event: HttpEvent<T>): HttpEvent<T> | { status: string, message: number, type: string } {
        switch (event.type) {
            case HttpEventType.UploadProgress:
                const progress = Math.round(100 * event.loaded / event.total);
                return {status: 'progress', message: progress, type: 'event'};

            case HttpEventType.Response:
                return event;
            default:
                return {status: 'progress', message: 100, type: 'event'};
        }
    }

    /**
     * exito predeterminado
     */
    private callSuccess<T>(response: HttpResponse<T> | { status: string, message: number, type: string }, resolve: any, options?: {
        path?: string,
        remote?: boolean,
        cors?: boolean,
        onLoad?: any,
        entity?: any,
    }): void {
        if (response.type === HttpEventType.Response) {
            const body: any = response.body;

            if (this.oConfigGlobalProvider.isNotNull(resolve)) {
                resolve(body);
            }
        } else {
            options.onLoad(response);
        }
    }

    /**
     * error predeterminado
     */
    private callError<T>(error: HttpErrorResponse, reject: any, options?: {
        path?: string,
        remote?: boolean,
        cors?: boolean,
        showError?: boolean,
        showSuccess?: boolean,
        onLoad?: any,
    }): void {
        const err = this.oConfigGlobalProvider.getDefault(error.error, {});
        const _message = this.oConfigGlobalProvider.getDefault(err.message, error.statusText);

        if (this.oConfigGlobalProvider.isNotNull(reject)) {
            reject(error.error);
        }

        if (options.showError) {
            this.oConfigGlobalProvider.showErrorAlert({
                message: _message,
            });
        }
    }

    /**
     * construye las opciones predeterminadas
     */
    private getOptions = (options?: {
        path?: string,
        remote?: boolean,
        cors?: boolean,
        showError?: boolean,
        showSuccess?: boolean,
        onLoad?: any,
        type?: any,
        entity?: any,
    }): any => {
        options = this.oConfigGlobalProvider.getDefault(options, {});
        options.path = this.oConfigGlobalProvider.getDefault(options.path, '');
        options.remote = this.oConfigGlobalProvider.getDefault(options.remote, true);
        options.cors = this.oConfigGlobalProvider.getDefault(options.cors, true);
        options.onLoad = this.oConfigGlobalProvider.getDefault(options.onLoad, (data) => {
        });
        options.showError = this.oConfigGlobalProvider.getDefault(options.showError, true);
        options.showSuccess = this.oConfigGlobalProvider.getDefault(options.showSuccess, true);
        options.type = this.oConfigGlobalProvider.getDefault(options.type, null);
        options.entity = this.oConfigGlobalProvider.getDefault(options.entity, null);

        return options;
    }

    /**
     * realiza la consulta con el metodo GET
     */
    private get<T>(o: any, options?: {
        path?: string,
        remote?: boolean,
        cors?: boolean,
        showError?: boolean,
        showSuccess?: boolean,
        onLoad?: any,
        type?: any,
        entity?: any,
    }): Promise<any> {
        options = this.getOptions(options);

        return new Promise<any>((resolve, reject) => {
            this.oHttpClient.get<T>(options.path, {
                headers: this.getHeaders(),
                reportProgress: true,
                observe: 'events',
                responseType: 'json',
            }).pipe(map((event: HttpEvent<T>) => {
                    return this.callEvent<T>(event);
                }),
            ).subscribe((response: HttpResponse<T>) => {
                this.callSuccess<T>(response, resolve, options);
            }, (error: HttpErrorResponse) => {
                this.callError<T>(error, reject, options);
            });
        });
    }

    /**
     * realiza la consulta con el metodo POST
     */
    private post<T>(o: any, options?: {
        path?: string,
        remote?: boolean,
        cors?: boolean,
        showError?: boolean,
        showSuccess?: boolean,
        onLoad?: any,
        entity?: any,
    }): Promise<any> {
        options = this.getOptions(options);

        return new Promise<any>((resolve, reject) => {
            this.oHttpClient.post<T>(options.path, o, {
                headers: this.getHeaders(),
                reportProgress: true,
                observe: 'events',
                responseType: 'json',
            }).pipe(map((event: HttpEvent<T>) => {
                    return this.callEvent<T>(event);
                }),
            ).subscribe((response: HttpResponse<T>) => {
                    this.callSuccess<T>(response, resolve, options);
                }, (error: HttpErrorResponse) => {
                    this.callError<T>(error, reject, options);
                },
            );
        });
    }

    /**
     * realiza la consulta con el metodo PUT
     */
    private put<T>(o: any, options?: {
        path?: string,
        remote?: boolean,
        cors?: boolean,
        showError?: boolean,
        showSuccess?: boolean,
        onLoad?: any,
        entity?: any,
    }): Promise<any> {
        options = this.getOptions(options);

        return new Promise<any>((resolve, reject) => {
            this.oHttpClient.put<T>(options.path, o, {
                headers: this.getHeaders(),
                observe: 'events',
                responseType: 'json',
            }).pipe(map((event: HttpEvent<T>) => {
                    return this.callEvent<T>(event);
                }),
            ).subscribe((response: HttpResponse<T>) => {
                    this.callSuccess<T>(response, resolve, options);
                }, (error: HttpErrorResponse) => {
                    this.callError<T>(error, reject, options);
                },
            );
        });
    }

    /**
     * realiza la consulta con el metodo DELETE
     */
    private delete<T>(o: any, options?: {
        path?: string,
        remote?: boolean,
        cors?: boolean,
        showError?: boolean,
        showSuccess?: boolean,
        onLoad?: any,
        entity?: any,
    }): Promise<any> {
        options = this.getOptions(options);

        return new Promise<any>((resolve, reject) => {
            this.oHttpClient.delete<T>(options.path, {
                headers: this.getHeaders(),
                reportProgress: true,
                observe: 'events',
                responseType: 'json',
            }).pipe(map((event: HttpEvent<T>) => {
                    return this.callEvent(event);
                }),
            ).subscribe((response: HttpResponse<T>) => {
                    this.callSuccess<T>(response, resolve, options);
                }, (error: HttpErrorResponse) => {
                    this.callError<T>(error, reject, options);
                },
            );
        });
    }

}
