import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'convert24To12'})
export class Convert24To12 implements PipeTransform {

    transform(value: string, first?: boolean): string {
        let one = '';
        let two = '';

        if (value.indexOf('to')) {
            const v = value.split(' to ');
            one = v[0];
            two = v[1];
        }

        switch (first) {
            case true:
                return this.format24to12(one);
                break;
            case false:
                return this.format24to12(two);
                break;
            default:
                return this.format24to12(one) + ' to ' + this.format24to12(two);
        }
    }

    private format24to12(time: string) {
        let hour: any = (time.split(':'))[0];
        let min: any = (time.split(':'))[1];
        const part = hour > 12 ? 'pm' : 'am';

        min = (min + '').length === 1 ? `0${min}` : min;
        hour = hour > 12 ? hour - 12 : hour;
        hour = (hour + '').length === 1 ? `0${hour}` : hour;

        return `${hour}:${min} ${part}`;
    }

}
