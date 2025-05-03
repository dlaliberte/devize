export class LinearTransformation {
    private slope: number;
    private intercept: number;

    constructor(slope: number, intercept: number) {
        this.slope = slope;
        this.intercept = intercept;
    }

    public transform(input: number): number {
        return this.slope * input + this.intercept;
    }
}