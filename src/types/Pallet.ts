export interface Pallet {
  height: number;
  width: number;
  x?: number;
  y?: number;
  allowRotation: boolean;
  [other: string]: any;
}