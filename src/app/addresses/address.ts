import {Component, NgZone, OnInit} from '@angular/core';
import {AlertController, ModalController, ToastController} from '@ionic/angular';
import {Geolocation, GeolocationOptions, Geoposition} from '@ionic-native/geolocation/ngx';
import {GlobalConfigProvider} from '../../providers/global-config';
import RestService, {RestApi} from '../../providers/rest-service';

declare var google;

export interface AddressType {
  longitude?: number;
  latitude?: number;
  name?: string;
  direction_type?: string;
  favorite?: boolean;
}

@Component({
  selector: 'page-address',
  styleUrls: ['address.scss'],
  templateUrl: 'address.html',
})
export class AddressPage implements OnInit {
  autocompleteItems: any[];
  serv: any;
  data: AddressType;
  query = '';
  map: any;
  GoogleAutocomplete: any;
  autocomplete: any;
  options: GeolocationOptions;
  currentPos: Geoposition;
  geocoder: any;
  markers: any[];
  showButton: any;
  lat: any;
  lon: any;

  constructor(
    private appConfig: GlobalConfigProvider,
    private rest: RestService,
    private zone: NgZone,
    private geolocation: Geolocation,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    public modalController: ModalController,
  ) {
    this.data = {};
    this.serv = new google.maps.places.AutocompleteService();
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    this.autocomplete = {input: ''};
    this.autocompleteItems = [];
    this.geocoder = new google.maps.Geocoder();
    this.markers = [];
    this.showButton = false;
  }

  updateSearchResults() {
    if (this.autocomplete.input === '') {
      this.autocompleteItems = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions({
        input: this.autocomplete.input,
        componentRestrictions: {country: 'PA'},
      },
      (predictions, status) => {
        this.showButton = false;
        this.autocompleteItems = [];
        this.zone.run(() => {
          predictions.forEach((prediction) => {
            this.autocompleteItems.push(prediction);
          });
        });
      });
  }

  updateSearch() {
    if (!this.query) {
      this.autocompleteItems = [];
      return;
    }
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

  getUserPosition() {
    this.options = {
      enableHighAccuracy: false,
    };
    this.geolocation.getCurrentPosition(this.options).then((pos: Geoposition) => {
      this.currentPos = pos;
    }, (err: PositionError) => {
      // console.log(err);
    });
  }

  ngOnInit() {
    this.appConfig.showLoading();
    this.options = {
      enableHighAccuracy: false,
    };
    const self = this;

    this.geolocation.getCurrentPosition(this.options).then((pos: Geoposition) => {
      this.currentPos = pos;
      this.map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: pos.coords.latitude, lng: pos.coords.longitude},
        zoom: 15,
        zoomControl: true,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
      });
      this.map.addListener('click', function (e) {
        self.placeMarkerAndPanTo(e.latLng, this.map);
      });
      this.markers.forEach((m: any) => {
        m.setMap(null);
      });
      this.markers = [];

      const marker = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        icon: {url: 'assets/img/marker.png'},
        position: this.map.getCenter(),
        draggable: true,
      });
      this.markers.push(marker);

      this.map.addListener(marker, 'dragend', () => {
        self.data.latitude = marker.getPosition().lat();
        self.data.longitude = marker.getPosition().lng();
      });

      this.data.latitude = pos.coords.latitude;
      this.data.longitude = pos.coords.longitude;

      this.appConfig.hideLoading();
    }, (err: PositionError) => {
      this.appConfig.hideLoading();
    });

  }

  placeMarkerAndPanTo(coord, map) {
    this.markers.forEach((m: any) => {
        m.setMap(null);
    });
    this.markers = [];
    const marker = new google.maps.Marker({
      position: coord,
      animation: google.maps.Animation.DROP,
      icon: {url: '../../assets/img/marker.png'},
      map: this.map,
      draggable: true,
    });
    this.markers.push(marker);
    this.map.setCenter(coord);
    this.data.latitude = coord.lat();
    this.data.longitude = coord.lng();
    const self = this;
    google.maps.event.addListener(marker, 'dragend', () => {
      self.data.latitude = marker.getPosition().lat();
      self.data.longitude = marker.getPosition().lng();
    });
    this.showButton = true;
  }

  selectSearchResult(item) {
    this.autocompleteItems = [];

    this.geocoder.geocode({placeId: item.place_id}, (results, status) => {
      if (status === 'OK' && results[0]) {
        this.data.latitude = results[0].geometry.location.lat();
        this.data.longitude = results[0].geometry.location.lng();
        this.autocomplete.input = item.description;
        this.data.name = item.description;
        const marker = new google.maps.Marker({
          position: results[0].geometry.location,
          map: this.map,
          draggable: true,
          animation: google.maps.Animation.DROP,
          icon: {url: 'assets/img/marker.png'},
        });
        const self = this;
        google.maps.event.addListener(marker, 'dragend', () => {
          self.data.latitude = marker.getPosition().lat();
          self.data.longitude = marker.getPosition().lng();
        });

        this.markers.forEach((m: any) => {
          m.setMap(null);
        });

        this.markers.push(marker);
        this.map.setCenter(results[0].geometry.location);
        this.toastCtrl.create({
          message: 'Puede ajustar la posición exacta en el mapa para una mejor ubicación.',
          duration: 3000,
          color: 'primary',
          position: 'bottom',
          buttons: ['Ok'],
        }).then((t) => t.present());
        this.showButton = true;
      }
    });
  }

  saveData() {
    if (this.data.name == null || this.data.name.length === 0) {
      const geocoder = new google.maps.Geocoder;
      geocoder.geocode({
        location: {lat: this.data.latitude, lng: this.data.longitude},
      }, (results, status) => {
        this.query = results[0].formatted_address;
        this.data.name = this.query;
        this.alertCtrl.create({
          header: 'Nombre de la dirección',
          inputs: [
            {
              name: 'name',
              placeholder: 'Nombre de la dirección',
              value: this.data.name,
            },
          ],
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel',
              handler: data => {
                // console.log('Cancel clicked');
              },
            },
            {
              text: 'Guardar',
              handler: data => {
                this.data.name = data.name;
                this.data.direction_type = 'Home';
                this.data.favorite = true;
                this.sendData('Home');
              },
            },
          ],
        }).then((a) => a.present());
      });
    } else {
      // open dialog to set name and continue
      const alert = this.alertCtrl.create({
        header: 'Nombre de la dirección',
        inputs: [
          {
            name: 'name',
            placeholder: 'Nombre de la dirección',
            value: this.data.name,
          },
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: data => {
              // console.log('Cancel clicked');
            },
          },
          {
            text: 'Guardar',
            handler: data => {
              this.data.name = data.name;
              this.data.direction_type = 'Home';
              this.data.favorite = true;
              this.sendData('Home');
            },
          },
        ],
      }).then((a) => a.present());
    }
  }

  select(type) {
    if (type === 'current') {
      this.appConfig.showLoading();
      this.geolocation.getCurrentPosition({enableHighAccuracy: false})
        .then((pos: Geoposition) => {
          this.data.direction_type = 'Other';
          this.data.latitude = pos.coords.latitude;
          this.data.longitude = pos.coords.longitude;

          const geocoder = new google.maps.Geocoder;
          geocoder.geocode({
            location: {lat: pos.coords.latitude, lng: pos.coords.longitude},
          }, (results, status) => {
            if (status === 'OK') {
              if (results[0]) {
                this.query = results[0].formatted_address;
                this.data.name = this.query;
                this.appConfig.hideLoading();
                this.sendData(type);
              }
            }
          });
          this.data.favorite = false;
        }, (err: PositionError) => {
          // console.log('LOG: error: ' + err.message);
        });
      return;
    }
    if (!this.query) {
      this.appConfig.showAlert('Información', 'Escribe un nombre para la dirección');
      return;
    }
    if ((!this.data.latitude || !this.data.longitude) && this.data.direction_type !== 'current') {
      this.appConfig.showAlert('Información', 'Elije una ubicación');
      return;
    }
    this.data.name = this.query;
    switch (type) {
      case 'home':
        this.data.direction_type = 'Home';
        this.data.favorite = false;
        break;
      case 'work':
        this.data.direction_type = 'Work';
        this.data.favorite = false;
        break;
      case 'favorite':
        this.data.direction_type = 'Other';
        this.data.favorite = true;
        break;
    }
    this.sendData(type);
  }

  sendData(type) {
    this.appConfig.showLoading();
    this.rest.route(RestApi.ADDRESS).withAuth().post({body: this.data}).then(res => {
      this.appConfig.hideLoading();
      this.modalController.dismiss(res.json().direction);
    }).catch(ex => {
      if (ex.json().error.status === 400) {
        this.toastCtrl.create({
          message: 'Ingrese nombre y seleccione dirección',
          duration: 3000,
          position: 'middle',
        }).then((t) => t.present());
      } else {
        this.appConfig.showErrorAlert([
          {text: 'cerrar'},
          {text: 'intentar de nuevo', handler: () => this.select(type)},
        ]);
      }
      this.appConfig.hideLoading();

    });
  }

  selectItem(item: any) {
    this.query = item.description;
    this.data.name = item.description;
    this.autocompleteItems = [];
    const geocoder = new google.maps.Geocoder;
    geocoder.geocode({placeId: item.place_id}, (results, status) => {
      this.data.latitude = results[0].geometry.location.lat();
      this.data.longitude = results[0].geometry.location.lng();
    });
  }

  async dismiss(data?: any) {
    this.modalController.getTop().then(() => {
      this.modalController.dismiss(data);
    });
  }
}
