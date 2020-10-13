import {Component, ViewChild} from '@angular/core';
import {FormGroup, FormGroupDirective} from '@angular/forms';
import {ConfigGlobalProvider} from '../../../providers/config.global.provider';
import {GlobalConfigProvider} from '../../../providers/global-config';
import RestService, {RestApi} from '../../../providers/rest-service';
import {LoginProvider} from '../../../providers/login.provider';

@Component({
    selector: 'app-recovery',
    templateUrl: 'recovery.page.html',
    styleUrls: ['recovery.page.scss'],
})
export class RecoveryPage {

    model: { token: string, email: string, password: string, repassword: string } = {
        token: '',
        email: '',
        password: '',
        repassword: '',
    };
    textSubmit = 'Recuperar Contraseña';
    type = 'password';
    showPass = false;
    sendToken = false;
    public form: FormGroup;
    @ViewChild(FormGroupDirective, {static: false}) public formDirective: FormGroupDirective;

    constructor(
        public oConfigGlobalProvider: ConfigGlobalProvider,
        public appConfig: GlobalConfigProvider,
        private oLoginProvider: LoginProvider,
        private rest: RestService,
    ) {
    }

    showPassword() {
        this.showPass = !this.showPass;
        this.type = (this.showPass) ? 'text' : 'password';
    }

    formLogin() {
        this.appConfig.showFormRegister = false;
        this.appConfig.showFormRecovery = false;
    }

    onSubmit() {
        if (!this.sendToken) {
            this.appConfig.showLoading();
            this.rest.route(RestApi.USERS_RESET, this.model.email).addDeviceId().put().then((res: any) => {
                this.sendToken = true;
                this.textSubmit = 'Cambiar Contraseña';
                this.appConfig.hideLoading();
            }).catch(ex => {
                this.appConfig.hideLoading();
                this.oConfigGlobalProvider.showErrorAlert({
                    message: ex,
                    title: 'ERROR RECOVERY PASSWORD',
                });
            });
        } else {
            if (this.model.password === this.model.repassword) {
                this.appConfig.showLoading();
                this.rest.route(RestApi.USERS_CHANGE).addDeviceId().withAuth().put({
                    body: {
                        resetToken: this.model.token,
                        password: this.model.password,
                    },
                }).then((res: any) => {
                    res = res.json();
                    this.appConfig.token = res.token;

                    this.formLogin();
                    this.appConfig.hideLoading();
                    // this.oLoginProvider.loginCustom({email: this.model.email, password: this.model.password});
                }).catch(ex => {
                    this.appConfig.hideLoading();
                    this.oConfigGlobalProvider.showErrorAlert({
                        message: ex,
                        title: 'ERROR CHANGE USER',
                    });
                });
            }
        }
    }

}
