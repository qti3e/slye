import * as electron from "electron";

interface Window {
  something: string;
  remote: typeof electron.remote;
}
