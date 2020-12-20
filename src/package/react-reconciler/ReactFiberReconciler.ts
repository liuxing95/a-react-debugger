import { container } from "webpack";
import { createFiberRoot } from "./ReactFiberRoot";

export function createContainer(
  containerInfo,
  isConcurrent: boolean
) {
  return createFiberRoot(containerInfo, isConcurrent)
}