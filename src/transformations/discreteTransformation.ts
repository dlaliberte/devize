export class DiscreteTransformation {
    private transformationMap: Map<any, any>;

    constructor(transformationMap: Map<any, any>) {
        this.transformationMap = transformationMap;
    }

    transform(input: any): any {
        if (!this.transformationMap.has(input)) {
            throw new Error(`No transformation defined for input: ${input}`);
        }
        return this.transformationMap.get(input);
    }
}