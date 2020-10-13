import {Component, ViewChild} from '@angular/core';
import {FormGroup, FormGroupDirective} from '@angular/forms';
import {ConfigGlobalProvider} from '../../../providers/config.global.provider';
import {GlobalConfigProvider} from '../../../providers/global-config';
import RestService, {RestApi} from '../../../providers/rest-service';
import {LoginProvider} from '../../../providers/login.provider';

@Component({
    selector: 'app-register',
    templateUrl: 'register.page.html',
    styleUrls: ['register.page.scss'],
})
export class RegisterPage {

    model: { name: string, lastName: string, email: string, password: string, repassword: string, phone: string } = {
        name: '',
        lastName: '',
        email: '',
        password: '',
        repassword: '',
        phone: '',
    };
    type = 'password';
    showPass = false;
    errorPasswords = '';
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
        this.errorPasswords = '';
        if (this.model.password === this.model.repassword) {
            this.appConfig.showLoading();
            this.rest.route(RestApi.USER).addDeviceId().withAuth().post({
                body: this.model,
            }).then((res: any) => {
                res = res.json();
                this.appConfig.token = res.token;

                this.formLogin();
                this.oLoginProvider.loginCustom({phone: this.model.phone, password: this.model.password});
            }).catch(ex => {
                this.appConfig.hideLoading();
                this.oConfigGlobalProvider.showErrorAlert({
                    message: ex,
                    title: 'ERROR REGISTER USER',
                });
            });
        } else {
            this.errorPasswords = 'Las contraseñas no coinciden';
        }
    }

}
