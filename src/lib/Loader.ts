import type { Pallet } from '../types/Pallet';
import type { IHeightMap, Rating } from './HeightMap';

import { HeightMap } from './HeightMap';

const rotate = (pallet: Pallet): Pallet => {
  return {
    ...pallet,
    height: pallet.width,
    width: pallet.height,
  }
}

const compareRatig = (a: Rating, b: Rating): number => {
  if (a.palletsInHeight >= b.palletsInHeight && a.palletsInWidth >= b.palletsInWidth) {
    return -1;
  }
  if (a.palletsInHeight <= b.palletsInHeight && a.palletsInWidth <= b.palletsInWidth) {
    return 1;
  }
  return 0;
}

const loadPallets = (
  bodyHeight: number,
  bodyWidth: number,
  padding: number,
  pallets: Pallet[],
  centerLoading: boolean,
  rotateMode: boolean,
) => {
  const optimizedPallets: Pallet[] = pallets
    .map(pallet => {
      if (rotateMode && pallet.allowRotation && pallet.height > pallet.width) {
        return rotate(pallet)
      }
      return {
        ...pallet,
      }
    })
    .sort((a, b) => b.width - a.width);

  const loadedPallets: Pallet[] = [];
  const heightMap: IHeightMap = new HeightMap(bodyHeight, bodyWidth, padding);

  while (!heightMap.isFull() && optimizedPallets.length) {
    let loadedPallet: Pallet | null = null;

    let i = 0;
    while (!loadedPallet && i < optimizedPallets.length) {
      // loadedPallet = heightMap.insert(optimizedPallets[i]);
      // if (!loadedPallet && optimizedPallets[i].allowRotation) {
      //   const rotatedPallet: Pallet = rotate(optimizedPallets[i]);
      //   loadedPallet = heightMap.insert(rotatedPallet);
      // }
      // console.log('<------->')
      // const origin = heightMap.insert(optimizedPallets[i]);
      // const rotated = optimizedPallets[i].allowRotation ? heightMap.insert(rotate(optimizedPallets[i])) : null
      // console.log(origin)
      // console.log('<------->')

      // if (origin && !rotated) {
      //   loadedPallet = origin.pallet;
      // } else if (!origin && rotated) {
      //   loadedPallet = rotated.pallet;
      // } else if (origin && rotated) {
      //   loadedPallet = origin.rating >= rotated.rating ? origin.pallet : rotated.pallet;
      // }

      const originRating: Rating = heightMap.insertRating(optimizedPallets[i]);
      const rotatedRating: Rating = optimizedPallets[i].allowRotation
        ? heightMap.insertRating(rotate(optimizedPallets[i])) 
        : {
          palletsInHeight: 0,
          palletsInWidth: 0,
        };

      // if (originRating >= rotatedRating) {
      //   loadedPallet = heightMap.insert(optimizedPallets[i]);
      // } else {
      //   loadedPallet = heightMap.insert(rotate(optimizedPallets[i]));
      // }
      const compare: number = compareRatig(originRating, rotatedRating)
      console.log('-----------')
      console.log(originRating)
      console.log(rotatedRating)
      console.log('-----------')
      if (compare === 1) {
        loadedPallet = heightMap.insert(rotate(optimizedPallets[i]));
      } else {
        loadedPallet = heightMap.insert(optimizedPallets[i]);
      }

      i += 1;
    }

    if (loadedPallet) {
      loadedPallets.push(loadedPallet);
      optimizedPallets.splice(i - 1, 1);
    } else {
      heightMap.alignLowestPlace();
    }

    if (!centerLoading) {
      heightMap.alignCenterPlaces();
    }
  }

  return loadedPallets;
}

export const loader = (
  bodyHeight: number,
  bodyWidth: number,
  padding: number,
  pallets: Pallet[],
  centerLoading: boolean,
  backLoading: boolean,
): Pallet[] => {
  const rotateModeEnable: Pallet[] = loadPallets(
    bodyHeight,
    bodyWidth,
    padding,
    pallets,
    centerLoading,
    true,
  );

  const rotateModeDisable: Pallet[] = loadPallets(
    bodyHeight,
    bodyWidth,
    padding,
    pallets,
    centerLoading,
    false,
  );

  return rotateModeEnable.length >= rotateModeDisable.length ? rotateModeEnable : rotateModeDisable;
}
