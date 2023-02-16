export interface Pallet {
  height: number;
  width: number;
  padding?: number;
  x?: number;
  y?: number;
  allowRotation: boolean;
  [other: string]: any;
}