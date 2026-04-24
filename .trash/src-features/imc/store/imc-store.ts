import { Store }    from '../../../lib/store';
import { ImcState } from '../types/imc.types';

class ImcStoreClass extends Store<ImcState> {
  constructor() {
    super({ height: null, weight: null, result: null, category: null });
  }
}

export const ImcStore = new ImcStoreClass();
