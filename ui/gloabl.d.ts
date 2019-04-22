import { Remote } from "electron";

declare global {
  interface Window {
    remote: Remote;
  }
}
