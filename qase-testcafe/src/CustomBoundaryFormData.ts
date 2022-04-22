import FormData from 'form-data';
import crypto from 'crypto';


export let customBoundary = '----------------------------';
crypto.randomBytes(24).forEach((value) => {
    customBoundary += Math.floor(value * 10).toString(16);
});

export class CustomBoundaryFormData extends FormData {
    public constructor() {
        super();
    }
    public getBoundary(): string {
        return customBoundary;
    }
}
