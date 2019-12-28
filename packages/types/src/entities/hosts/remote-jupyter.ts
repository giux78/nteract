import * as Immutable from "immutable";
import { AjaxRequest } from "rxjs/ajax";

import { BaseHostProps } from "./base";

export interface ServerConfig {
  endpoint: string;
  url?: string;
  crossDomain?: boolean;
  token?: string;
  xsrfToken?: string;
  ajaxOptions?: Partial<AjaxRequest>;
  wsProtocol?: string | string[];
}

export type JupyterHostRecordProps = BaseHostProps & {
  type: "jupyter";
  token?: string | null;
  origin: string;
  basePath: string;
  bookstoreEnabled: boolean;
  showHeaderEditor: boolean;
  crossDomain?: boolean | null;
  ajaxOptions?: Partial<AjaxRequest>;
  wsProtocol?: string | string[];
};

export const makeJupyterHostRecord = Immutable.Record<JupyterHostRecordProps>({
  type: "jupyter",
  id: null,
  defaultKernelName: "python",
  token: null,
  origin: typeof location === "undefined" ? "" : location.origin,
  basePath: "/",
  crossDomain: false,
  ajaxOptions: undefined,
  wsProtocol: undefined,
  bookstoreEnabled: false,
  showHeaderEditor: false
});

export type JupyterHostRecord = Immutable.RecordOf<JupyterHostRecordProps>;
