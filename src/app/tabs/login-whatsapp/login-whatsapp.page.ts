import {Component, ViewChild} from '@angular/core';
import {FormGroup, FormGroupDirective} from '@angular/forms';
import {GlobalConfigProvider} from '../../../providers/global-config';
import {LoginProvider} from '../../../providers/login.provider';
import {ModalController} from '@ionic/angular';

@Component({
    selector: 'app-login-whatsapp',
    templateUrl: 'login-whatsapp.page.html',
    styleUrls: ['login-whatsapp.page.scss'],
})
export class LoginWhatsappPage {

    email: false;
    model: { email: string, phone: string, extphone: string, password: string } = {email: '', phone: '', extphone: '+57', password: ''};
    type = 'password';
    showPass = false;
    public form: FormGroup;
    @ViewChild(FormGroupDirective, {static: false}) public formDirective: FormGroupDirective;

    constructor(
        public appConfig: GlobalConfigProvider,
        private oLoginProvider: LoginProvider,
        private modalController: ModalController,
    ) {
    }

    async back(data?: any) {
        this.modalController.getTop().then(() => {
            this.modalController.dismiss(data);
        });
    }

    showPassword() {
        this.showPass = !this.showPass;
        this.type = (this.showPass) ? 'text' : 'password';
    }

    onSubmit() {
        this.oLoginProvider.loginCustom(this.model);
    }

    formRegister() {
        this.appConfig.showFormRegister = true;
        this.appConfig.showFormRecovery = false;
    }

    formRecovery() {
        this.appConfig.showFormRegister = false;
        this.appConfig.showFormRecovery = true;
    }

}
