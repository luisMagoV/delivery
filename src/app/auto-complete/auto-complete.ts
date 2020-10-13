import {Component, NgZone, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';

declare var google;

/**
 * Generated class for the AutoCompletePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
    selector: 'page-auto-complete',
    styleUrls: ['auto-complete.scss'],
    templateUrl: 'auto-complete.html',
})
export class AutoCompletePage implements OnInit {

    autocompleteItems;
    autocomplete;
    service = new google.maps.places.AutocompleteService();

    constructor(
        private zone: NgZone,
        public modalController: ModalController,
    ) {
        this.autocompleteItems = [];
        this.autocomplete = {
            query: '',
        };
    }

    async dismiss(data?: any) {
        this.modalController.getTop().then(() => {
            this.modalController.dismiss(data);
        });
    }

    chooseItem(item: any) {
        this.modalController.dismiss(item);
    }

    currentPosition() {
        this.modalController.dismiss({
            current: true,
        });
    }

    ngOnInit() {
        const e: HTMLElement = document.querySelector('input.searchbar-input');
    }

    updateSearch() {
        if (this.autocomplete.query === '') {
            this.autocompleteItems = [];
            return;
        }
        const me = this;
        this.service.getPlacePredictions({
            input: this.autocomplete.query,
            componentRestrictions: {country: 'PA'},
        }, (predictions, status) => {
            me.autocompleteItems = [];
            me.zone.run(() => {
                if (predictions) {
                    predictions.forEach((prediction) => {
                        me.autocompleteItems.push(prediction);
                    });
                }
            });
        });
    }

    async closeModal(data?: any) {
        this.modalController.getTop().then(() => {
            this.modalController.dismiss(data);
        });
    }
}
