# rx-jupyter

This package is a [ReactiveX](http://reactivex.io/) wrapper around the [Jupyter Server API](http://jupyter-api.surge.sh/). **rx-jupyter** can help you query local and remote Jupyter Server instances using Jupyter's Services APIs. Also, **rx-jupyter** integrates responses seamlessly with [RxJS](https://rxjs-dev.firebaseapp.com/)'s functional tooling.

### Roadmap

Primary coverage of the [Jupyter Server API]:

- [x] Contents
  - [x] Checkpoints
- [x] Kernels
- [x] Kernelspecs
- [x] Sessions
- [x] Terminals

Optional coverage:

- [ ] Config
- [ ] nbconvert
- [ ] spec.yaml `/api/spec.yaml`

## Installation

```
$ yarn add rx-jupyter
```

```
$ npm install --save rx-jupyter
```

## Usage

The example below shows how we can use this package to get the version of the Jupyter server API our endpoint is running.

```javascript
import jupyter from "rx-jupyter";
import { of } from "rxjs";
import { mergeMap, catchError } from "rxjs/operators";

const apiVersion = jupyter.apiVersion({
  endpoint: "https://myjupyterendpoint.com",
  crossDomain: true
});
apiVersion.pipe(
  mergeMap(apiVersion => of(apiVersionFulfilled({ apiVersion }))),
  catchError(error => of(apiVersionFailed({ error })))
);
```

## Documentation

You can view the reference documentation for `rx-jupyter` in the [package docs](https://packages.nteract.io/modules/rx_jupyter).

## Support

If you experience an issue while using this package or have a feature request, please file an issue on the [issue board](https://github.com/nteract/nteract/issues/new/choose) and add the `pkg:rx-jupyter` label.

## License

[BSD-3-Clause](https://choosealicense.com/licenses/bsd-3-clause/)
