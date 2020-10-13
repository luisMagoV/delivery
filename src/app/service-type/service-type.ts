import {AfterViewInit, Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {GlobalConfigProvider} from '../../providers/global-config';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfigGlobalProvider} from 'src/providers/config.global.provider';
import RestService from 'src/providers/rest-service';
import {PreordenPage} from '../preorden/preorden';
import {ModalController} from '@ionic/angular';

// import {} from 'googlemaps';

@Component({
    selector: 'page-service-type',
    styleUrls: ['service-type.scss'],
    templateUrl: 'service-type.html',
})
export class ServiceTypePage implements OnInit, AfterViewInit {
    service: any;
    serv: any;
    items: any[];
    // attributes service
    name: string;
    quanty: number;
    type: string;
    mesure: string;
    description: string;
    height: number;
    width: number;
    weight: number;
    // options service
    options: any[];
    optionsMed: any[];
    // query place
    query = '';
    autocompleteItems: any[];
    place: any;
    marker;
    marker2;
    origin: any;
    selectedSlide: any;
    sustituir = false;
    stores;
    @ViewChild('slides', {static: false}) slides: any;

    kcolor = '#10D58E';
    ucolor = 'transparent';
    mapElement: HTMLElement;
    map: any;
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsService = new google.maps.DirectionsService();
    sliders = [
        {
            width: 25,
            height: 37,
            weight: 1,
            img: 'assets/img/package_envelop.png',
        },
        {
            width: 28,
            height: 14,
            weight: 10,
            img: 'assets/img/package_m.png',
        },
        {
            width: 28,
            height: 28,
            weight: 13,
            img: 'assets/img/package_l.png',
        },
        {
            width: 57,
            height: 30,
            weight: 18,
            img: 'assets/img/package_xl.png',
        },
    ];

    constructor(
        public oConfigGlobalProvider: ConfigGlobalProvider,
        private zone: NgZone,
        public appConfig: GlobalConfigProvider,
        private route: ActivatedRoute,
        private rest: RestService,
        private router: Router,
        private modalCtrl: ModalController,
    ) {
        const data: any = JSON.parse(this.route.snapshot.queryParamMap.get('data'));
        this.service = data.service || {name: 'Encomiendas'};
        this.items = [];
        this.serv = new google.maps.places.AutocompleteService();
        this.clear();
    }

    ngOnInit() {
        this.mapElement = document.getElementById('map');
        this.items = [];
        if (this.service.name === 'Encomiendas') {
            this.selectedSlide = this.sliders[0];
        }
    }

    ngAfterViewInit() {
        this.loadMinTime('mandados');
    }

    initMap() {
        this.map = null;
        this.map = new google.maps.Map(this.mapElement, {
            zoom: 11,
            fullscreenControl: false,
            scaleControl: false,
            mapTypeControl: false,
            zoomControl: false,
            rotateControl: false,
            streetViewControl: false,
            center: {lat: this.appConfig.lat, lng: this.appConfig.lng},
        });
        this.directionsDisplay.setMap(this.map);
        this.marker = new google.maps.Marker({
            map: this.map,
            animation: google.maps.Animation.DROP,
            icon: {url: 'assets/img/marker.png'},
            position: this.map.getCenter(),
            draggable: false,
        });
        this.marker.setMap(this.map);
    }

    calculateAndDisplayRoute(_destiny) {
        this.initMap();
        this.marker2 = new google.maps.Marker({
            map: this.map,
            animation: google.maps.Animation.DROP,
            icon: {url: 'assets/img/marker.png'},
            position: _destiny,
            draggable: false,
        });
        this.marker2.setMap(this.map);
    }

    updatePlace() {
        if (this.query.trim().length < 1) {
            this.autocompleteItems = [];
            return;
        }
        this.place = null;
        const me = this;
        this.serv.getPlacePredictions({
            input: this.query,
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

    loadMinTime(storeType) {
        // this.appConfig.showLoading();
        this.rest.route('services/get/byname?name=' + storeType + '&store=null')
            .get().then((type: any) => {
            this.stores = type.json().min_time;
            this.appConfig.hideLoading();
        }).catch(ex => {
            this.oConfigGlobalProvider.showErrorAlert({
                message: ex,
                title: 'ERROR LOAD STORE TYPE',
            });
        });
    }

    dismissPlace() {
        this.autocompleteItems = [];
        this.place = null;
    }

    chooseItem(item: any) {
        this.query = item.description;
        this.autocompleteItems = [];
        const globalItem = item;
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({placeId: item.place_id}, (results, status) => {
            const location = results[0].geometry.location;
            this.place = {lat: location.lat(), lon: location.lng()};
            const destiny = new google.maps.LatLng(location.lat(), location.lng());
            if (this.appConfig.lat === 0 || this.appConfig.lng === 0) {
                this.appConfig.lat = location.lat();
                this.appConfig.lng = location.lng();
            }
            this.calculateAndDisplayRoute(destiny);
            // create value in global data
            this.appConfig.placeToService = {lat: location.lat(), lon: location.lng(), place: globalItem};
            this.appConfig.setStorage('originService', {lat: location.lat(), lon: location.lng(), place: globalItem});
            this.appConfig.setStorage('selectedOrigin', {lat: location.lat(), lon: location.lng(), place: globalItem});
        });
    }

    selectOption(index: number) {
        this.options = this.options.map((v, i) => {
            if (i !== index) {
                v.color = this.ucolor;
            } else {
                v.color = this.kcolor;
                this.type = v.title;
                if (v.handler) v.handler();
            }
            return v;
        });
    }

    selectOptionMed(index: number) {
        this.optionsMed = this.optionsMed.map((v, i) => {
            if (i !== index) {
                v.color = this.ucolor;
            } else {
                v.color = this.kcolor;
                this.mesure = v.title;
                if (v.handler) v.handler();
            }
            return v;
        });
    }

    addItem() {
        switch (this.service.name) {
            case 'Antojos':
                if (this.name) {
                    this.items.push({
                        name: this.name,
                        quanty: this.quanty,
                        place: this.place,
                        query: this.query,
                    });
                    this.clear();
                }
                break;
            case 'Mandados':
                if (this.name) {
                    this.items.push({
                        name: this.name,
                        description: this.description,
                        quanty: this.quanty,
                        place: this.place,
                        query: this.query,
                    });
                    this.clear();
                }
                break;
            case 'Encomiendas':
                if (this.description && this.weight && this.height && this.width && this.name && this.mesure) {
                    this.items.push({
                        name: this.name,
                        height: this.height,
                        width: this.width,
                        weight: this.weight,
                        quanty: this.quanty,
                        description: this.description,
                        type: this.type,
                        query: this.query,
                        place: this.place,
                        mesure: this.mesure,
                    });
                    this.clear();
                }
                break;
        }
    }

    clear() {
        this.name = '';
        this.query = '';
        this.description = '';
        this.type = null;
        this.weight = null;
        this.height = null;
        this.width = null;
        this.place = null;
        this.autocompleteItems = [];

        switch (this.service.name) {
            case 'Antojos':
                this.quanty = 1;

                break;
            case 'Mandados':
                /*this.options = [
                    { title: '30 min', handler: () => { this.quanty = 30; } },
                    { title: '1 hr', handler: () => { this.quanty = 60; } },
                    { title: '2 hrs', handler: () => { this.quanty = 120; } },
                    { title: 'Libre', handler: () => { this.quanty = 0; } }
                ];*/
                // this.type = 'Minutos';
                break;
            case 'Encomiendas':
                this.options = [
                    {
                        title: 'Sobre', color: this.ucolor, handler: () => {
                            this.type = 'Sobre';
                        },
                    },
                    {
                        title: 'Paquete', color: this.ucolor, handler: () => {
                            this.type = 'Paquete';
                        },
                    },
                ];
                this.optionsMed = [
                    {
                        title: 'Centimetros', color: this.ucolor, handler: () => {
                            this.mesure = 'cm';
                        },
                    },
                    {
                        title: 'Metros', color: this.ucolor, handler: () => {
                            this.mesure = 'm';
                        },
                    },
                ];
                this.weight = 1;
                this.quanty = 1;
                this.height = 1;
                this.width = 1;
                this.selectOption(this.options.length - 1);
                this.selectOptionMed(this.optionsMed.length - 1);
                break;
        }
    }

    delProduct(index) {
        this.items = this.items.filter((v, i) => i !== index);
    }

    uptProduct(index, product) {
        this.clear();
        for (const key in product) {
            if (product.hasOwnProperty(key)) {
                this[key] = product[key];
            }
        }

        if (product.type) {
            this.options.forEach((v, i) => {
                if (product.type === v.title) {
                    this.selectOption(i);
                }
            });
        }
        if (product.mesure) {
            this.optionsMed.forEach((v, i) => {
                if (product.mesure.charAt(0) === v.title.charAt(0)) {
                    this.selectOptionMed(i);
                }
            });
        }
        this.delProduct(index);
    }

    more(val) {
        if (this[val] < 100) this[val] += 1;
    }

    less(val) {
        if (this[val] > 1) this[val] -= 1;
    }

    processOrder() {
        if (this.service.name === 'Mandados' || this.service.name === 'Encomiendas') {
            const encomiendas = {
                query: this.query,
                name: this.name,
                quantity: this.quanty,
                description: this.description,
                type: this.type,
                place: this.place,
                mesure: this.mesure,
                generateOther: this.sustituir,
                width: this.selectedSlide?.width,
                height: this.selectedSlide?.height,
                weight: this.selectedSlide?.weight,
            };
            const others = {
                name: this.name,
                description: this.description,
                quanty: this.quanty,
                place: this.place,
                query: this.query,
            };

            if (this.name) {
                if (this.items.length > 0) {
                    this.items = [];
                    this.items.push((this.service.name === 'Encomiendas') ? encomiendas : others);
                } else {
                    this.items.push((this.service.name === 'Encomiendas') ? encomiendas : others);
                }
            }
        }
        if (this.items.length > 0) {
            this.modalCtrl.create({
                component: PreordenPage,
                cssClass: 'full-modal',
                componentProps: {
                    items: this.items,
                    service: this.service,
                    generateOther: this.sustituir,
                    serviceType: 'mandados',
                },
            }).then((m) => {
                m.present();
                m.onDidDismiss().then(data => {
                    // console.log(data);
                });
            });
        } else {
            this.appConfig.showAlert('Atención', 'Debes agregar un elemento para continuar');
        }
    }

    openUrl() {
        this.router.navigate(['/tabs/comission']);
    }

    slideChanged() {
        this.slides.getActiveIndex().then((value) => {
            this.selectedSlide = this.sliders[value];
        });
    }

}
