import {Component, NgZone, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import { GlobalConfigProvider } from 'src/providers/global-config';
import {PreordenPage} from '../preorden/preorden';

@Component({
    selector: 'app-messaging',
    templateUrl: './messaging.page.html',
    styleUrls: ['./messaging.page.scss'],
})
export class MessagingPage implements OnInit {

    autocompleteItems;
    autocomplete;
    autocompleteItems2;
    autocomplete2;
    placePickup;
    placeDelivery;
    package: string;
    pickup: string;
    instructions: string;
    service = new google.maps.places.AutocompleteService();
    items: any[];
    serviceTry: { };

    constructor(private zone: NgZone,
        public appConfig: GlobalConfigProvider,
        public modalController: ModalController) {
        this.autocompleteItems = [];
        this.autocomplete = {
            query: '',
        };
        this.autocompleteItems2 = [];
        this.autocomplete2 = {
            query: '',
        };
        this.items = [];
    }

    ngOnInit() {
        const e: HTMLElement = document.querySelector('input.searchbar-input');
    }

    chooseItem(item: any) {
        this.autocomplete.query = item.description;
        this.autocompleteItems = [];
        const globalItem = item;
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({placeId: item.place_id}, (results, status) => {
            const location = results[0].geometry.location;
            this.placePickup = {lat: location.lat(), lon: location.lng()};
            const destiny = new google.maps.LatLng(location.lat(), location.lng());
        });
    }

    chooseItem2(item: any) {
        this.autocomplete2.query = item.description;
        this.autocompleteItems2 = [];
        const globalItem2 = item;
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({placeId: item.place_id}, (results, status) => {
            const location = results[0].geometry.location;
            this.placeDelivery = {lat: location.lat(), lon: location.lng()};
            const destiny = new google.maps.LatLng(location.lat(), location.lng());
        });
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

    updateSearch2() {
        if (this.autocomplete2.query === '') {
            this.autocompleteItems2 = [];
            return;
        }
        const me = this;
        this.service.getPlacePredictions({
            input: this.autocomplete2.query,
            componentRestrictions: {country: 'PA'},
        }, (predictions, status) => {
            me.autocompleteItems2 = [];
            me.zone.run(() => {
                if (predictions) {
                    predictions.forEach((prediction) => {
                        me.autocompleteItems2.push(prediction);
                    });
                }
            });
        });
    }

    back() {
        this.appConfig.back();
    }

    createOrder () {
        this.serviceTry = {name: 'Mandados', uuid: '8ecbb96d-0002-4187-8e00-243443c479cf'};
        const pickup = {
            priority: 'min',
            origin: {
                lat: this.placePickup.lat,
                lon: this.placePickup.lon,
                place: {
                    description: this.autocomplete.query,
                    name: this.autocomplete.query,
                },
            },
            destination: {
                lat: this.placeDelivery.lat,
                lon: this.placeDelivery.lon,
                place: {
                    description: this.autocomplete2.query,
                    name: this.autocomplete2.query,
                },
            },
        };
        this.items.push({
            name: this.package,
            description: this.pickup,
            query: this.instructions,
        });
        this.appConfig.setStorage('selectedOrigin', pickup.origin);
        this.appConfig.setStorage('selectedPlace', pickup.destination);
        this.modalController.create({
            component: PreordenPage,
            cssClass: 'full-modal',
            componentProps: {
                items: this.items,
                service: this.serviceTry,
                generateOther: false,
                serviceType: 'mandados',
            },
        }).then((m) => {
            m.present();
            m.onDidDismiss().then(data => {
                // console.log(data);
            });
        });
    }

}
