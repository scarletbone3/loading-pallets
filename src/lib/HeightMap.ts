import type { Pallet } from '../types/Pallet';

export interface IPlace {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface IHeightMap {
  isFull(): boolean;
  insertAtLowestPlace(pallet: Pallet): Pallet | null;
  alignLowestPlace(): void;
}

export class HeightMap implements IHeightMap {
  private height: number;
  private width: number;
  private places: IPlace[];
  private lowestPlaceIndex: number;

  constructor(height: number, width: number) {
    this.height = height;
    this.width = width;
    this.places = [
      {
        height: 0,
        width: width,
        x: 0,
        y: 0,
      },
    ];
    this.lowestPlaceIndex = 0;
  }

  public isFull(): boolean {
    let isFull = true;
    this.places.forEach(place => {
      if (place.height < this.height) {
        isFull = false;
      }
    });
    return isFull;
  }

  private updateLowestPlaceIndex(): void {
    let lowestPlaceIndex: number = 0;

    this.places.forEach((place, index) => {
      if (place.height < this.places[lowestPlaceIndex].height) {
        lowestPlaceIndex = index;
      }
    });

    this.lowestPlaceIndex = lowestPlaceIndex;
  }

  public insertAtLowestPlace(pallet: Pallet): Pallet | null {
    const lowestPlace: IPlace = this.places[this.lowestPlaceIndex];
    if (pallet.width > lowestPlace.width || pallet.height > this.height - lowestPlace.height) {
      return null;
    }
    if (lowestPlace.y <= this.width - lowestPlace.y + lowestPlace.width) {
      const leftPlace: IPlace = {
        ...lowestPlace,
        height: lowestPlace.height + pallet.height,
        width: pallet.width,
        x: lowestPlace.x + pallet.height,
      };
      const rightPlace: IPlace = {
        ...lowestPlace,
        width: lowestPlace.width - pallet.width,
        y: lowestPlace.y + pallet.width,
      }

      const placesInsert: IPlace[] = [leftPlace, rightPlace].filter(place => place.width > 0);
      this.places.splice(this.lowestPlaceIndex, 1, ...placesInsert);
      this.updateLowestPlaceIndex();

      return {
        ...pallet,
        x: leftPlace.x,
        y: leftPlace.y,
      }
    } else {
      const leftPlace: IPlace = {
        ...lowestPlace,
        width: lowestPlace.width - pallet.width,
      };
      const rightPlace: IPlace = {
        height: lowestPlace.height + pallet.height,
        width: pallet.width,
        x: lowestPlace.x + pallet.height,
        y: lowestPlace.y + lowestPlace.width - pallet.width,
      }

      const placesInsert: IPlace[] = [leftPlace, rightPlace].filter(place => place.width > 0);
      this.places.splice(this.lowestPlaceIndex, 1, ...placesInsert);
      this.updateLowestPlaceIndex();

      return {
        ...pallet,
        x: rightPlace.x,
        y: rightPlace.y,
      }
    }
  }

  public alignLowestPlace(): void {
    const lowestPlace: IPlace = this.places[this.lowestPlaceIndex];
    const leftPlace: IPlace = this.places[this.lowestPlaceIndex - 1];
    const rightPlace: IPlace = this.places[this.lowestPlaceIndex + 1];

    const heights: number[] = [leftPlace, rightPlace]
      .filter(place => place)
      .map(place => place.height);

    const minHeight: number = Math.min(...heights);
    lowestPlace.height = minHeight;
    lowestPlace.x += minHeight;

    this.updateLowestPlaceIndex();
  }
}
