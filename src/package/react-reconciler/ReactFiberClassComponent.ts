import { isMount } from './ReactFiberTreeReflection'
import { get as getInstance} from '../shared/ReactInstanceMap'
const classComponentUpdater = {
  isMount,
  enqueueSetState(inst, payload, callback) {
    // const fiber = getInstance(inst);
    // const currentTime = requestCurrentTime();
    // const expirationTime = computeExpirationForFiber(currentTime, fiber);

    // const update = createUpdate(fiber)
  }
}