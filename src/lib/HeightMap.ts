import type { Pallet } from '../types/Pallet';

export interface IPlace {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface Rating {
  palletsInHeight: number;
  palletsInWidth: number;
}

export interface IHeightMap {
  isFull(): boolean;
  alignCenterPlaces(): void;
  alignLowestPlace(): void;
  insertRating(pallet: Pallet): Rating;
  insert(pallet: Pallet): Pallet | null;
}

export class HeightMap implements IHeightMap {
  private height: number;
  private width: number;
  private padding: number;
  
  private places: IPlace[];
  private lowestPlaceIndex: number;

  constructor(height: number, width: number, padding: number = 0) {
    this.height = height;
    this.width = width;
    this.padding = padding;

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

  private centralPlacesIndexes(): number[] {
    const indexes: number[] = [];

    this.places.forEach((place, index) => {
      if (place.y > 0 && place.y + place.width < this.width) {
        indexes.push(index);
      }
    });

    return indexes;
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

  private paddingMultipleCoefficient(place: IPlace): number {
    if (place.y > 0 && place.y + place.width < this.width) {
      return 2;
    }

    return 1;
  }

  public isFull(): boolean {
    return this.places[this.lowestPlaceIndex].height === this.height
  }

  public alignCenterPlaces(): void {
    let centralPlacesIndexes: number[] = this.centralPlacesIndexes();
    
    while (centralPlacesIndexes.length) {
      centralPlacesIndexes.forEach(i => {
        const place: IPlace = this.places[i];
        const offset: number =
          (2 * place.y + place.width - this.width) / Math.abs((2 * place.y + place.width - this.width)) || -1;
        this.places[i + offset].width += place.width;
        this.places[i + offset].y = offset === -1 ? this.places[i + offset].y : place.y;
        this.places.splice(i, 1);
      });
      centralPlacesIndexes = this.centralPlacesIndexes();
    }

    this.updateLowestPlaceIndex();
  }

  public alignLowestPlace(): void {
    const place: IPlace = this.places[this.lowestPlaceIndex];
    const leftPlace: IPlace = this.places[this.lowestPlaceIndex - 1];
    const rightPlace: IPlace = this.places[this.lowestPlaceIndex + 1];

    if (!leftPlace && !rightPlace) {
      this.places[this.lowestPlaceIndex].height = this.height;
    } else if (!rightPlace || (leftPlace && leftPlace.height < rightPlace.height)) {
      this.places[this.lowestPlaceIndex - 1].width += place.width;
      this.places.splice(this.lowestPlaceIndex, 1);
    } else if (!leftPlace || (rightPlace && rightPlace.height < leftPlace.height)) {
      this.places[this.lowestPlaceIndex + 1].width += place.width;
      this.places[this.lowestPlaceIndex + 1].y = place.y;
      this.places.splice(this.lowestPlaceIndex, 1);
    } else {
      this.places[this.lowestPlaceIndex - 1].width += (place.width + rightPlace.width);
      this.places.splice(this.lowestPlaceIndex, 2);
    }

    this.updateLowestPlaceIndex();
  }

  public insertRating(pallet: Pallet): Rating {
    const place: IPlace = this.places[this.lowestPlaceIndex];
    const coefficient: number = this.paddingMultipleCoefficient(place);

    if (
      pallet.width + coefficient * this.padding > place.width ||
      pallet.height + this.padding > this.height - place.height
    ) {
      return {
        palletsInHeight: -1,
        palletsInWidth: -1,
      };
    }

    if (place.y <= this.width - place.y - place.width) {
      const leftPlace: IPlace = {
        ...place,
        height: place.height + pallet.height + this.padding,
        width: pallet.width + coefficient * this.padding,
        x: place.x + pallet.height + this.padding,
      };

      const rightPlace: IPlace = {
        ...place,
        width: place.width - pallet.width - coefficient * this.padding,
        y: place.y + pallet.width + coefficient * this.padding,
      };

      // return rightPlace.width !== 0 ? (this.height - leftPlace.height) / rightPlace.width : (this.height - leftPlace.height);
      return {
        palletsInHeight: Math.floor((this.height - leftPlace.height) / (pallet.height + this.padding)),
        palletsInWidth: Math.floor(rightPlace.width / (pallet.width + this.padding)),
      }
    } else {
      const leftPlace: IPlace = {
        ...place,
        width: place.width - pallet.width - coefficient * this.padding,
      };

      const rightPlace: IPlace = {
        ...place,
        height: place.height + pallet.height + this.padding,
        width: pallet.width + coefficient * this.padding,
        x: place.x + pallet.height + this.padding,
        y: place.y + place.width - pallet.width - this.padding,
      };

      // return leftPlace.width !== 0 ? (this.height - rightPlace.height) / leftPlace.width : (this.height - rightPlace.height);
      return {
        palletsInHeight: Math.floor((this.height - rightPlace.height) / (pallet.height + this.padding)),
        palletsInWidth: Math.floor(leftPlace.width / (pallet.width + this.padding)),
      }
    }
  }

  public insert(pallet: Pallet): Pallet | null {
    const place: IPlace = this.places[this.lowestPlaceIndex];
    const coefficient: number = this.paddingMultipleCoefficient(place);
    let placesInsert: IPlace[] = [];
    let loadedPallet: Pallet;

    if (
      pallet.width + coefficient * this.padding > place.width ||
      pallet.height + this.padding > this.height - place.height
    ) {
      return null;
    }

    if (place.y <= this.width - place.y - place.width) {
      // console.log('===============')
      // console.log('Left')
      // console.log(pallet)
      // console.log(this.places.map(place => ({...place})))
      const leftPlace: IPlace = {
        ...place,
        height: place.height + pallet.height + this.padding,
        width: pallet.width + coefficient * this.padding,
        x: place.x + pallet.height + this.padding,
      };

      const rightPlace: IPlace = {
        ...place,
        width: place.width - pallet.width - coefficient * this.padding,
        y: place.y + pallet.width + coefficient * this.padding,
      };
      // console.log({ ...leftPlace })
      // console.log({ ...rightPlace })
      // console.log('===============')

      placesInsert = [leftPlace, rightPlace].filter(place => place.width > 0);

      loadedPallet = {
        ...pallet,
        x: place.x + this.padding,
        y: place.y + this.padding,
      };
    } else {
      // console.log('===============')
      // console.log('Right')
      // console.log(pallet)
      // console.log(this.places.map(place => ({...place})))
      const leftPlace: IPlace = {
        ...place,
        width: place.width - pallet.width - coefficient * this.padding,
      };

      const rightPlace: IPlace = {
        ...place,
        height: place.height + pallet.height + this.padding,
        width: pallet.width + coefficient * this.padding,
        x: place.x + pallet.height + this.padding,
        y: place.y + place.width - pallet.width - this.padding,
      };
      // console.log({ ...leftPlace })
      // console.log({ ...rightPlace })
      // console.log('===============')

      placesInsert = [leftPlace, rightPlace].filter(place => place.width > 0);

      loadedPallet = {
        ...pallet,
        x: place.x + this.padding,
        y: rightPlace.y,
      };
    }

    this.places.splice(this.lowestPlaceIndex, 1, ...placesInsert);
    this.updateLowestPlaceIndex();

    return loadedPallet;
  }
}
