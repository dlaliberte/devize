// Define a generic scale interface

export interface Scale {
  domain: any[];
  range: any[];
  scale: (value: any) => any;
  invert?: (value: number) => any;
  ticks?: (count?: number) => any[];
  bandwidth?: () => number;
}
