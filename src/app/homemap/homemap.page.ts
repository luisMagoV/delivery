import {Component, OnInit} from '@angular/core';
import {ConfigGlobalProvider} from '../../providers/config.global.provider';
import {GlobalConfigProvider} from '../../providers/global-config';
import RestService, {RestApi} from '../../providers/rest-service';
import {ModalController} from '@ionic/angular';
import {Geolocation, GeolocationOptions, Geoposition} from '@ionic-native/geolocation/ngx';
import {AddressType} from '../addresses/address';
import {AutoCompletePage} from '../auto-complete/auto-complete';
import {ServicesPage} from '../services/services';

import {} from 'googlemaps';
// import {} from 'googlemaps';

@Component({
    selector: 'app-homemap',
    templateUrl: 'homemap.page.html',
    styleUrls: ['homemap.page.scss'],
})
export class HomemapPage implements OnInit {
    public data;
    options: GeolocationOptions;
    currentPos: Geoposition;
    places: Array<any>;
    map: any;
    loading: any;
    address;
    placeSelected = false;
    lat;
    lng;
    place: any;
    directions: AddressType[];
    mapElement: HTMLElement;
    service = new google.maps.places.AutocompleteService();
    latupt;
    lngupt;
    marker;

    constructor(
        public oConfigGlobalProvider: ConfigGlobalProvider,
        public appConfig: GlobalConfigProvider,
        private rest: RestService,
        private modalCtrl: ModalController,
        private geolocation: Geolocation,
    ) {
        this.latupt = 0;
        this.appConfig.showLoading('Obteniendo ubicación...');
    }

    ngOnInit1() {
        this.appConfig.showLoading('Obteniendo ubicación...');
        this.mapElement = document.getElementById('map-container');
        this.directions = this.appConfig.user.directions;
        this.oConfigGlobalProvider.timeout(250).then(() => {
            this.getUserPosition();
            this.directions = this.appConfig.user.directions;
        });
    }

    ngOnInit() {
        // valid if exist addresses loaded
        if (!this.appConfig.user.directions) {
            if (this.appConfig.user.email) {
                this.rest.route(RestApi.PROFILE, this.appConfig.user.email).withAuth().get().then(res => {
                    this.directions = res.json().user.directions;
                    this.ngOnInit1();
                }).catch(ex => {
                    // console.error(ex);
                });
            }
        } else {
            this.ngOnInit1();
        }
    }

    clearScreen() {
        this.placeSelected = false;
        this.address = '';
        // selected current position
        this.options = {
            enableHighAccuracy: false,
        };
        this.geolocation.getCurrentPosition(this.options).then((pos: Geoposition) => {
            this.currentPos = pos;
            this.appConfig.setStorage('currentPos', pos);
            this.addMap(pos.coords.latitude, pos.coords.longitude);
        }, (err: PositionError) => {
            this.appConfig.hideLoading();
        });
    }

    addMap(lat, long) {
        const latLng = new google.maps.LatLng(parseFloat(lat), parseFloat(long));
        const mapOptions = {
            center: latLng,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            fullscreenControl: false,
            scaleControl: false,
            mapTypeControl: false,
            zoomControl: false,
            rotateControl: false,
            streetViewControl: false,
        };
        this.map = new google.maps.Map(this.mapElement, mapOptions);
        this.addMarker();
    }

    addMarker() {
        this.marker = new google.maps.Marker({
            map: this.map,
            animation: google.maps.Animation.DROP,
            icon: {url: 'assets/img/marker.png'},
            position: this.map.getCenter(),
            draggable: true,
        });
        const infoWindow = new google.maps.InfoWindow({
            content: '<p>' + this.marker.title + '</p>',
        });

        google.maps.event.addListener(this.marker, 'click', () => {
            infoWindow.open(this.map, this.marker);
        });

    }

    getUserPosition() {
        this.options = {
            enableHighAccuracy: false,
        };
        this.geolocation.getCurrentPosition(this.options).then((pos: Geoposition) => {
            this.currentPos = pos;
            this.appConfig.setStorage('currentPos', pos);
            this.addMap(pos.coords.latitude, pos.coords.longitude);
            this.appConfig.hideLoading();
        }, (err: PositionError) => {
            this.appConfig.hideLoading();
        });
    }

    showServices() {
        this.appConfig.lat = this.marker.position.lat();
        this.appConfig.lng = this.marker.position.lng();
        this.appConfig.getStorage('selectedPlace').then(res => {
            if (res) {
                res.lat =  this.marker.position.lat();
                res.lon =  this.marker.position.lng();
                this.appConfig.setStorage('selectedOrigin', res);
            }
        });

        this.modalCtrl.create({
            component: ServicesPage,
        }).then((m) => {
            m.present();
            m.onDidDismiss().then((data) => {
                // console.log(data);
            });
        });
    }

    showAddressModal() {
        this.modalCtrl.create({
            component: AutoCompletePage,
        }).then((m) => {
            m.present();
            m.onDidDismiss().then((data: any) => {
                data = data.data;
                const geocoder = new google.maps.Geocoder();

                if (data) {
                    if (data.place_id) {
                        geocoder.geocode({placeId: data.place_id}, (results, status) => {
                            if (status === 'OK') {
                                if (results[0]) {
                                    const obj = {
                                        lat: results[0].geometry.location.lat(),
                                        lon: results[0].geometry.location.lng(),
                                        place: {
                                            description: data.description,
                                            name: data.description,
                                        },
                                        place_id: data,
                                    };
                                    this.appConfig.setStorage('selectedPlace', obj);
                                    const latLng = new google.maps
                                        .LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
                                    const mapOptions = {
                                        center: latLng,
                                        zoom: 17,
                                        mapTypeId: google.maps.MapTypeId.ROADMAP,
                                        fullscreenControl: false,
                                        scaleControl: false,
                                        mapTypeControl: false,
                                        zoomControl: false,
                                        rotateControl: false,
                                        streetViewControl: false,
                                    };
                                    this.map = new google.maps.Map(this.mapElement, mapOptions);
                                    this.marker = new google.maps.Marker({
                                        map: this.map,
                                        animation: google.maps.Animation.DROP,
                                        icon: {url: '../../assets/img/marker.png'},
                                        position: results[0].geometry.location,
                                        draggable: true,
                                    });

                                    const infoWindow = new google.maps.InfoWindow({
                                        content: '<p>' + data.description + '</p>',
                                    });

                                    google.maps.event.addListener(this.marker, 'click', () => {
                                        infoWindow.open(this.map, this.marker);
                                    });

                                    this.showServices();

                                } else {
                                    window.alert('No results found');
                                }
                            } else {
                                window.alert('Geocoder failed due to: ' + status);
                            }
                        });
                        this.placeSelected = true;
                        this.address = data.description;
                    } else if (data.current === true) {
                        this.getUserPosition();
                        geocoder.geocode({
                            location: {
                                lat: this.currentPos.coords.latitude,
                                lng: this.currentPos.coords.longitude,
                            },
                        }, (results, status) => {
                            if (status === 'OK') {
                                if (results[0]) {
                                    const obj = {
                                        lat: this.currentPos.coords.latitude,
                                        lon: this.currentPos.coords.longitude,
                                        place: {
                                            description: results[0].formatted_address,
                                            name: results[0].formatted_address,
                                        },
                                        place_id: results[0],
                                    };
                                    this.appConfig.setStorage('selectedPlace', obj);
                                    this.placeSelected = true;
                                    this.showServices();
                                }
                            }
                        });
                    }
                }
            });
        });
    }

    getIcon(index: number): string {
        const address = this.directions[index];
        switch (address.direction_type) {
            case 'Home':
                return 'home';
            case 'Work':
                return 'briefcase';
            default:
                if (address.favorite) return 'star';
                return 'pin';
        }
    }

    selectAddress(index: number) {
        const address = this.directions[index];
        if (address) {
            this.addMap(address.latitude, address.longitude);
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                location: {
                    lat: parseFloat(address.latitude.toString()),
                    lng: parseFloat(address.longitude.toString()),
                },
            }, (results, status) => {
                if (status === 'OK') {
                    if (results[0]) {
                        const obj = {
                            lat: address.latitude,
                            lon: address.longitude,
                            place: {
                                description: address.name,
                                name: address.name,
                            },
                            place_id: results[0],
                        };
                        this.appConfig.setStorage('selectedPlace', obj);
                        this.placeSelected = false;
                        this.showServices();
                    }
                }
            });
        }
    }

}
