// Утилиты
export class DateUtils {
    static formatUTCDate(date: Date): string {
        const pad = (num: number) => num.toString().padStart(2, '0');

        const year = date.getUTCFullYear();
        const month = pad(date.getUTCMonth() + 1);
        const day = pad(date.getUTCDate());
        const hours = pad(date.getUTCHours());
        const minutes = pad(date.getUTCMinutes());
        const seconds = pad(date.getUTCSeconds());

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    static getStartTime(): string {
        const date = new Date();
        date.setSeconds(-10);
        return this.formatUTCDate(date);
    }
}
