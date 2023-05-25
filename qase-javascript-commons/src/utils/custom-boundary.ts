import crypto from 'crypto';
import { ReadableOptions } from 'stream';

import FormData from 'form-data';

// `form-data` compatible `ReadableOptions` type
type ReadableOptionsType = {
    [K in keyof ReadableOptions]?: undefined extends ReadableOptions[K] ? never : ReadableOptions[K];
}

// `form-data` doesn't export `Options` interface
export interface OptionsInterface extends ReadableOptionsType {
    writable?: boolean;
    readable?: boolean;
    dataSize?: number;
    maxDataSize?: number;
    pauseStreams?: boolean;
}

// `FormData` with cryptographically strong random boundary
export class CustomBoundaryFormData extends FormData {
    constructor(options?: OptionsInterface) {
        super(options);

        try {
            const bytes = crypto.randomBytes(12);

            this.setBoundary(bytes.toString('hex').padStart(50, '-'));
        } catch (e) {/* ignore crypto failures, the FormData will fall back to the `Math.random` */}
    }
}
