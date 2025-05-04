export declare class LinearTransformation {
    private slope;
    private intercept;
    constructor(slope: number, intercept: number);
    transform(input: number): number;
}
