import {EventEmitter, Injectable, Output} from '@angular/core';
import {AlertController, LoadingController} from '@ionic/angular';
import {environment} from '../environments/environment';
import {Location} from '@angular/common';
import {DeviceInfo} from '@capacitor/core';

@Injectable()
export class ConfigGlobalProvider {

    @Output() login: EventEmitter<any> = new EventEmitter();
    public apiBaseUrl: string = environment.uri + '/v1/';
    public environment = environment;
    public user: any = null;
    public debug = environment.debug;
    private message = 'Cargando...';
    private loading: HTMLIonLoadingElement;
    private alert: HTMLIonAlertElement;
    private errorServer: any = {
        error_phone_used: 'El Número de teléfono ya esta en uso',
        error_email_used: 'El Correo Electrónico ya esta en uso',
        error_unregistered_user: 'El Usuario no se encuentra registrado',
        E_PHONE_NOT_FOUND: 'Crendeciales Inválidas',
        E_WRONG_PASSWORD: 'Crendeciales Inválidas',
        debtor_user: 'Estimado cliente, usted cuenta con un saldo negativo. No podemos procesar su pago.',
    };
    private errorForm: any = {
        required: 'Debe ingresar información en el campo',
        min: 'Debe ingresar un valor mayor de: ${min.min}',
        max: 'Debe ingresar un valor menor de: ${max.max}',
        minlength: 'Debe ingresar más de ${minlength.requiredLength} carácteres',
        maxlength: 'Debe ingresar más de ${maxlength.requiredLength} carácteres',
        email: 'Debe ingresar una dirección de correo válida',
        pattern: 'El valor introducido no coincide con el patrón indicado',
    };
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

    constructor(
        private oAlertController: AlertController,
        private oLoadingController: LoadingController,
        private oLocation: Location,
    ) {
        this.setLoading();
    }

    private setLoading() {
        this.oLoadingController.create({
            message: this.message,
        }).then((load) => {
            load.onDidDismiss().then(() => {
                this.setLoading();
            });
            this.loading = load;
        });
    }

    back() {
        this.oLocation.back();
    }

    showAlert(title: string, messageText: string, options?: { buttons: any[], subTitle?: string }) {
        options = this.getDefault(options, {});
        options.subTitle = this.getDefault(options.subTitle, '');
        options.buttons = this.getDefault(options.buttons, ['OK']);

        this.oAlertController.create({
            header: title,
            subHeader: options.subTitle,
            message: messageText,
            buttons: options.buttons,
        }).then((alert) => {
            this.alert = alert;
            this.alert.present();
        });
    }

    showErrorAlert(options?: { title?: string, subTitle?: string, message?: any, buttons?: any[] }) {
        this.dismissLoading();
        options = this.getDefault(options, {});
        options.title = this.getDefault(options.title, 'Error Generado');
        options.subTitle = this.getDefault(options.subTitle, '');
        options.message = this.getDefault((this.parse(options.message) || options.message), 'Upps. Algo salió mal');
        options.buttons = this.getDefault(options.buttons, ['OK']);

        if (!environment.debug) {
            options.title = 'Error Generado';
            options.message = (this.errorServer[options.message?.code]) ? this.errorServer[options.message?.code] : 'Upps. Algo salió mal';
        } else {
            // console.log(options.message);
            if (typeof options.message !== 'string') {
                options.message = this.findError(options.message);
            }

            if (typeof options.message !== 'string') {
                options.message = JSON.stringify(options.message);
            }
        }

        this.showAlert(options.title, options.message, {subTitle: options.subTitle, buttons: options.buttons});
    }

    presentLoading(message?: string): void {
        this.message = 'Cargando...';
        if (this.loading !== undefined) {
            this.loading.present();
        }
    }

    dismissLoading() {
        if (this.loading !== undefined) {
            this.loading.dismiss();
        }
    }

    public timeout(time: number): Promise<any> {
        return new Promise<any>((resolve) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    }

    public getDefault(o: any, d?: any): any {
        return (this.isNotNull(o)) ? o : this.isNotNull(d) ? d : null;
    }

    public isNotNull(o: any): any {
        return (o !== null && o !== undefined);
    }

    getErrorMessage(o) {
        const expresion = /\$\{([a-zA-Z0-9\.]+)\}/gm;

        for (const key in this.errorForm) {
            if (this.errorForm.hasOwnProperty(key) && o.hasError(key) && o.errors[key] !== undefined) {
                let value = this.errorForm[key];

                if (value.indexOf('${') > -1) {
                    let v = '';
                    const strings = value.match(expresion)[0];
                    const count = strings.replace(/\$|\{|\}/gm, '').split('.', 4);

                    if (count.length > 0) {
                        if (count.length === 1) {
                            v = o.errors[count[0]];
                        } else if (count.length === 2) {
                            v = o.errors[count[0]][count[1]];
                        } else if (count.length === 3) {
                            v = o.errors[count[0]][count[1]][count[2]];
                        } else {
                            v = o.errors[count[0]][count[1]][count[2]][count[3]];
                        }
                    }

                    value = value.replace(/\$\{.+\}/, v);
                }

                return value;
            }
        }
    }

    private findError(message: any): string {
        let code;
        [
            message?.response?.error?.data?.error?.raw?.error,
            message?.response?.error?.data?.erorr?.raw?.error,
            message?.response?.error?.data?.error,
            message?.response?.error?.data?.code,
            message?.response?.error,
            message?.response?.code,
            message?.error?.data?.error?.raw?.error,
            message?.error?.data?.error,
            message?.error?.data?.code,
            message?.error,
            message?.status,
            message?.code,
            message?.msg,
        ].forEach((msg) => {
            if (typeof msg !== 'string') {
                return msg;
            }

            const o = this.errorServer[msg];
            if (o) {
                code = o;
            }

            return msg;
        });

        if (!code) {
            if (typeof message?.msg === 'string') {
                code = message?.msg;
            } else if (typeof message?.error === 'string') {
                code = message?.error;
            } else {
                code = 'Upps. Algo salió mal';
            }
        }

        return code;
    }

    parse(o: any) {
        try {
            return o?.json();
        } catch (ex) {
        }

        try {
            return JSON.stringify(o);
        } catch (ex) {
        }

        try {
            return JSON.parse(o);
        } catch (ex) {
        }

        return null;
    }

}
