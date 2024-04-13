# Development

## Running locally

```bash
pnpm install
pnpm dev
```

## Code Organisation

This repository is a monorepo organised into the following modules:

### Applications

In `apps` are:

- `client` - the web client app for `jira-flow-metrics`.
- `api` - the API used by `jira-flow-metrics` (including storage).

In `packages` are:

- `metrics` - functions to compute flow metrics for given cycle time policies.
- `charts` - reusable chart components for displaying flow metrics.
- `components` - other reusable components, including for displaying issues and for managing workflows.
- `lib` - convenience functions which aren't inherently related to the flow metrics domains (e.g. data formatting, percentile and outlier functions, etc.)
