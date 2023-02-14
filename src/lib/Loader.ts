import type { Pallet } from '../types/Pallet';
import type { IHeightMap } from './HeightMap';

import { HeightMap } from './HeightMap';

export const loader = (
  bodyHeight: number,
  bodyWidth: number,
  pallets: Pallet[],
) => {
  const optimizedPallets: Pallet[] = pallets
    .map(pallet => {
      if (pallet.allowRotation && pallet.height > pallet.width) {
        return {
          ...pallet,
          height: pallet.width,
          width: pallet.height,
        }
      }
      return {
        ...pallet,
      }
    })
    .sort((a, b) => b.width - a.width);

  const loadedPallets: Pallet[] = [];
  const heightMap: IHeightMap = new HeightMap(bodyHeight, bodyWidth);

  while (!heightMap.isFull() && optimizedPallets.length) {
    let loadedPallet: Pallet | null = null;

    let i = 0;
    while (!loadedPallet && i < optimizedPallets.length) {
      loadedPallet = heightMap.insertAtLowestPlace(optimizedPallets[i]);
    }

    if (loadedPallet) {
      loadedPallets.push(loadedPallet);
      optimizedPallets.splice(i, 1);
    } else {
      heightMap.alignLowestPlace();
    }
  }

  return loadedPallets;
}
