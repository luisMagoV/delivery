import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'money'})
export class Money implements PipeTransform {

  transform(value: number): string {
    if (!value) {
      return '0,00';
    }

    return value
      .toFixed(2)
      .replace('.', ',')
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

}
