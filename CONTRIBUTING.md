# Contributing to calc-engine

Thanks for considering a contribution! The full contributing guide —
setup, testing, linting, and PR expectations — lives in
[`docs/developer.md#contributing`](docs/developer.md#contributing) to
avoid maintaining the same instructions in two places.

Quick version:

```bash
git clone <your-fork-url>
cd calc-engine
npm install
npm test        # add/update tests for any behavior change
npm run lint     # no-eval / no-implied-eval / no-new-func are enforced
```

Then open a PR. For anything touching the parser or evaluator, please
include a few example expressions and their expected results.
