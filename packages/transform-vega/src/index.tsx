import vegaEmbed2 from "@nteract/vega-embed-v2";
import { merge } from "lodash";
import * as React from "react";
import vegaEmbed3 from "vega-embed";

const MIMETYPE_VEGA2 = "application/vnd.vega.v2+json";
const MIMETYPE_VEGA3 = "application/vnd.vega.v3+json";
const MIMETYPE_VEGALITE1 = "application/vnd.vegalite.v1+json";
const MIMETYPE_VEGALITE2 = "application/vnd.vegalite.v2+json";

const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = DEFAULT_WIDTH / 1.5;

interface EmbedData {
  config: object;
}

interface EmbedProps {
  data: EmbedData;
  embedMode?: "vega" | "vega-lite";
  version: string;
  renderedCallback: (err: any, result: any) => any;
}

const defaultCallback = (): any => {};

function embed(
  el: HTMLElement,
  spec: EmbedData,
  mode: "vega" | "vega-lite" | undefined,
  version: string,
  cb: (err?: any, result?: any) => any
) {
  if (version === "vega2") {
    const embedSpec = {
      mode,
      spec: Object.assign({}, spec)
    };

    if (mode === "vega-lite") {
      embedSpec.spec.config = merge(
        {
          cell: {
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT
          }
        },
        embedSpec.spec.config
      );
    }

    vegaEmbed2(el, embedSpec, cb);
  } else {
    spec = Object.assign({}, spec);
    if (mode === "vega-lite") {
      spec.config = merge(
        {
          cell: {
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT
          }
        },
        spec.config
      );
    }

    vegaEmbed3(el, spec, {
      mode,
      actions: false
    })
      .then(result => cb(null, result))
      .catch(cb);
  }
}

export class VegaEmbed extends React.Component<Partial<EmbedProps>> {
  static defaultProps = {
    renderedCallback: defaultCallback,
    embedMode: "vega-lite",
    version: "vega2"
  };

  el?: HTMLElement | null;

  componentDidMount(): void {
    if (
      this.el &&
      this.props.data &&
      this.props.embedMode &&
      this.props.version &&
      this.props.renderedCallback
    ) {
      embed(
        this.el,
        this.props.data,
        this.props.embedMode,
        this.props.version,
        this.props.renderedCallback
      );
    }
  }

  shouldComponentUpdate(nextProps: EmbedProps): boolean {
    return this.props.data !== nextProps.data;
  }

  componentDidUpdate(): void {
    if (
      this.el &&
      this.props.data &&
      this.props.embedMode &&
      this.props.version &&
      this.props.renderedCallback
    ) {
      embed(
        this.el,
        this.props.data,
        this.props.embedMode,
        this.props.version,
        this.props.renderedCallback
      );
    }
  }

  render() {
    // Note: We hide vega-actions since they won't work in our environment
    // (this is only needed for vega2, since vega-embed v3 supports hiding
    // actions via options)
    return (
      <React.Fragment>
        <style>{".vega-actions{ display: none; }"}</style>
        <div
          ref={el => {
            this.el = el;
          }}
        />
      </React.Fragment>
    );
  }
}

interface Props<MediaType> {
  data: EmbedData;
  mediaType: MediaType;
}

export function VegaLite1(
  props: Partial<Props<"application/vnd.vegalite.v1+json">>
) {
  return <VegaEmbed data={props.data} embedMode="vega-lite" version="vega2" />;
}
VegaLite1.MIMETYPE = MIMETYPE_VEGALITE1;
VegaLite1.defaultProps = {
  mediaType: MIMETYPE_VEGA2
};

export function Vega2(props: Partial<Props<"application/vnd.vega.v2+json">>) {
  return <VegaEmbed data={props.data} embedMode="vega" version="vega2" />;
}
Vega2.MIMETYPE = MIMETYPE_VEGA2;
Vega2.defaultProps = {
  mediaType: MIMETYPE_VEGA2
};

// For backwards compatibility
export { VegaLite1 as VegaLite, Vega2 as Vega };

export function VegaLite2(
  props: Partial<Props<"application/vnd.vegalite.v2+json">>
) {
  return <VegaEmbed data={props.data} embedMode="vega-lite" version="vega3" />;
}
VegaLite2.MIMETYPE = MIMETYPE_VEGALITE2;
VegaLite2.defaultProps = {
  mediaType: MIMETYPE_VEGALITE2
};

export function Vega3(props: Partial<Props<"application/vnd.vega.v3+json">>) {
  return <VegaEmbed data={props.data} embedMode="vega" version="vega3" />;
}
Vega3.MIMETYPE = MIMETYPE_VEGA3;
Vega3.defaultProps = {
  mediaType: MIMETYPE_VEGA3
};
