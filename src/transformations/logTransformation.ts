export class LogTransformation {
    private base: number;

    constructor(base: number = Math.E) {
        this.base = base;
    }

    transform(value: number): number {
        if (value <= 0) {
            throw new Error('Log transformation is not defined for negative values');
        }
        return Math.log(value) / Math.log(this.base);
    }

    inverse(value: number): number {
        return Math.pow(this.base, value);
    }
}
