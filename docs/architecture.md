# Architecture notes

## Components

| Component | Responsibility | Cannot do |
| --- | --- | --- |
| Intake validator | Requires the fields necessary for the selected workflow | Choose an unknown connector |
| Normalizer | Produces a stable payload representation | Authorize a business decision |
| Effect ID | Identifies one intended connector effect | Prove the effect was correct |
| Connector | Performs one narrow, simulated operation | Expand its own scope |
| Receipt store | Retains a result for an effect ID | Verify an external systemâs later state |

## Rules

1. A workflow must specify an ID, connector, target, and payload.
2. Only registered connectors are allowed.
3. The same normalized request produces the same effect ID.
4. A completed effect ID returns its existing receipt instead of dispatching again.
5. The connector result is captured in a receipt for review and reconciliation.

## Limits

This is an educational reference. A production workflow would need authentication, authorization, retries, failure handling, durable storage, rate limits, observability, data classification, and connector-specific reconciliation.
