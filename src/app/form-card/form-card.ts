import {Component, OnInit} from '@angular/core';
import {AlertController, ModalController} from '@ionic/angular';
import {Headers, Http, RequestOptions} from '@angular/http';
import {GlobalConfigProvider} from '../../providers/global-config';
import {Location} from '@angular/common';

/**
 * Generated class for the FormCardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-form-card',
    styleUrls: ['form-card.scss'],
    templateUrl: 'form-card.html',
})
export class FormCardPage implements OnInit {
    month;
    cardnumber: string;
    cardholder;
    cardholderLastname: any;
    year;
    cvv;
    stripeToken;
    typecard;
    type: any;

    years: string[];
    oldNumber = '';
    yesInput = false;
    nonumber = false;
    onespace = false;
    inputCardNumber: any;

    constructor(
        private alertCtrl: AlertController,
        public appConfig: GlobalConfigProvider,
        public http: Http,
        private location: Location,
        public modalController: ModalController,
    ) {
        this.month = '';
        this.cardnumber = '';
        this.cardholder = '';
        this.cardholderLastname = '';
        this.year = '';
        this.cvv = '';
        this.typecard = '24435c20-0dc1-42fa-8a90-4123a61d77e7';
        this.years = [];

        const y = new Date().getFullYear();
        const total = y + 7;
        for (let v = y; v < total; v++) {
            this.years.push(v.toString());
        }
    }

    ngOnInit() {
        this.inputCardNumber = document.getElementById('cardnumber').children[0];
    }

    back(data?: any) {
        this.modalController.dismiss(data).catch(m => this.appConfig.back());
    }

    updateText(value: string) {
        this.yesInput = !this.yesInput;
        if (!this.yesInput) {
            if (this.nonumber) {
                this.cardnumber = this.oldNumber;
                this.nonumber = false;
            }
            if (this.onespace) {
                const pos = this.cardnumber.length - 1;
                this.cardnumber = this.cardnumber.substring(0, pos) + ' ' + this.cardnumber.charAt(pos);
                this.onespace = false;
                this.oldNumber = this.cardnumber;
                setTimeout(() => {
                    this.setCaretPosition(this.inputCardNumber, this.cardnumber.length);
                }, 100);
            }
            return;
        }
        if (value && value.length === 1) {
            if (this.cardnumber.length > 0) {
                if (!(/\d+/).test(value)) {
                    this.nonumber = true;
                    return;
                }
                if ((this.cardnumber.length % 5) === 0) {
                    this.onespace = true;
                }
                this.oldNumber = this.cardnumber;
            }
        } else {
            this.oldNumber = this.cardnumber;
        }
    }

    getCardNumber(): string {
        return this.oldNumber.replace(/ /g, '');
    }

    setCaretPosition(elem, caretPos) {
        if (elem != null) {
            if (elem.createTextRange) {
                const range = elem.createTextRange();
                range.move('character', caretPos);
                range.select();
            } else {
                if (elem.selectionStart) {
                    elem.focus();
                    elem.setSelectionRange(caretPos, caretPos);
                } else
                    elem.focus();
            }
        }
    }

    saveCard() {
        if (this.cvv === '' || this.month === '' || this.cardnumber === '' || this.cardholder === '' || this.year === '') {
            this.alertCtrl.create({
                header: 'Error Generado',
                subHeader: 'Ingresa todos los datos',
                buttons: ['Cerrar'],
            }).then(a => a.present());
        } else {
            const typeCard = this.appConfig.getCardType(this.getCardNumber());
            if (typeCard === 'visa') {
                this.type = '24435c20-0dc1-42fa-8a90-4123a61d77e7';
            } else if (typeCard === 'mastercard') {
                this.type = '9d7493ab-c632-45c3-82bf-65c29934f535';
            }

            this.detectCardType(this.getCardNumber());
            this.appConfig.showLoading();
            const _headers: Headers = new Headers({
                'Content-Type': 'application/json',
                Authorization: 'JWT ' + this.appConfig.token,
            });
            const options: RequestOptions = new RequestOptions({headers: _headers});

            const body = JSON.stringify({
                type: this.type,
                cc_number: this.getCardNumber(),
                cc_expiration: this.year + '-' + this.month,
                firstname: this.cardholder,
                lastname: this.cardholderLastname,
                ccv2: this.cvv,
            });
            this.http.post(this.appConfig.apiBaseUrl + 'cards', body, options).toPromise().then(response => {
                const bodyResponse = JSON.parse(response.text());
                if (bodyResponse.status === 'ok') {
                    this.appConfig.hideLoading();
                    this.modalController.dismiss(bodyResponse.card);
                } else {
                    // console.log('LOG: GENERATE ERROR TO CREATE CARD');
                }
            }).catch((error: any) => {
                const bodyResponse = JSON.parse(error.text());
                let msg = '';
                // ERROS HERE
                // console.log(bodyResponse);
                if (bodyResponse.error.data.response.status === 'DENIED')
                    msg = 'Su tarjeta no puede ser procesada';
                else if (bodyResponse.error.data.error.code === 400)
                    msg = 'El número de tarjeta es inválido';
                else
                    msg = 'Verifique los datos';
                this.appConfig.hideLoading();
                this.alertCtrl.create({
                    header: 'Error Generado',
                    subHeader: msg,
                    buttons: ['Cerrar'],
                }).then(a => a.present());

            });
        }
    }

    detectCardType(_number) {
        switch (this.appConfig.getCardType(_number)) {
            case 'visa':
                this.typecard = '9d7493ab-c632-45c3-82bf-65c29934f535';
                break;
            case 'mastercard':
                this.typecard = '24435c20-0dc1-42fa-8a90-4123a61d77e7';
                break;
        }
    }

}
