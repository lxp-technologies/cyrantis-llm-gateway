# Provider capability and parity plan

Status: proposal backed by sampled local LXP code, not live upstream certification. Evidence: L2-L3 and L6 in the [inspection record](../discovery/INSPECTION-RECORD.md). Provider feature names or method presence alone do not establish supported models or successful execution.

## Observed implementation matrix

`Implemented` means a corresponding method/mapping was inspected. `Partial` means incompatible or incomplete normalization. `Absent` means absent from the inspected shared contract, not necessarily absent upstream. Live support is unverified throughout.

| Capability | OpenAI native adapter | Anthropic native adapter | Google adapter | OpenRouter aggregator | NanoGPT aggregator |
| --- | --- | --- | --- | --- | --- |
| Chat | Implemented | Implemented, Messages mapping | Implemented via Google OpenAI-compatible text endpoint | Implemented | Implemented |
| Model discovery | Retrieved IDs plus local catalog mapping | Method; capability mapping | Retrieved IDs plus local catalog mapping | Remote model/parameter metadata mapping | Remote model/capability metadata mapping |
| Stream | Upstream byte body | Translation into compatible SSE | Upstream byte body | Upstream byte body | Upstream byte body |
| Tool calls/results | Absent shared contract | Absent shared contract | Absent shared contract | Absent shared contract | Absent shared contract |
| Structured JSON | Shared field exists; sampled chat body omits it | Sampled Messages body omits it | Not verified in sampled dispatch | Sampled chat body omits it | Maps `outputFormat: json` to `response_format: json_object` |
| Strict JSON Schema | Absent shared chat field | Absent shared chat field | Absent shared chat field | Absent shared chat field | JSON mode does not prove schema enforcement |
| Output-token bound | Sampled body omits shared bound | Maps bound through max-token resolver | Not verified in sampled dispatch | Maps `max_tokens`, may increase to family minimum | Mapping present |
| Reasoning | Effort/toggle and response fields; partial canonical controls | Thinking/budget/effort and continuation conversion | Response fields; exact request parity unknown | Metadata-derived controls plus family mapping | Canonical controls plus family mapping |
| Image chat input | Forwards content parts | Native message conversion | Shared text/image request | Forwards/maps content parts | Maps content parts |
| Image generation/edit | Both methods | Explicit provider flags false | Both methods | Both methods using provider services | Both methods using provider services |
| Async video | No method on sampled adapter | No method on sampled adapter | Submission/status/download methods; flag true | Methods and mocked tests exist; flag false | Submission/status/download methods; flag true |
| Audio | Absent SDK operation | Absent SDK operation | Absent SDK operation | Absent SDK operation | Absent SDK operation |
| Cancellation/deadline | Caller signal combined with local timeout; stream local timeout disabled | Same pattern | Same pattern | Same pattern | Same pattern |
| Usage/errors | Token metadata; some errors contain upstream text | Native usage/error mapping | Token/error mapping | Token metadata and shared HTTP errors | Token metadata and shared HTTP errors |

Model discovery combines remote metadata and local catalogs. A catalog entry is not proof that a tenant key can invoke that model. Likewise a provider-wide `true` cannot prove every model supports a capability. Streaming final usage and cleanup are not uniformly specified by the byte-stream port.

Other inspected entrypoints: xAI advertises chat/images/edit/video; Z.ai chat/image generation but no editing; Groq/Ollama chat/catalog without image generation; DeepSeek/Mistral/Moonshot/Augure use the shared OpenAI-compatible text base. These are entrypoint observations only. Their detailed controls and live availability remain unverified; do not infer parity with the five columns above.

## Minimal proposed SDK

Only Gateway composes provider adapters; Control manages configuration but never executes provider traffic. Canonical public DTO schemas live in the browser-safe `@cyrantis/core/contracts` export; TypeORM/entities remain server-only. The SDK owns independent provider-neutral types and imports neither core, Nest nor persistence, preventing circular dependencies and broad application coupling.

Keep HTTP/OpenAI schemas separate from this internal port. Implement only what a delivery slice exercises; the following is a contract design, not production source.

| Contract | Minimum semantics |
| --- | --- |
| Execution context | Opaque request ID, resolved access material, monotonic deadline and AbortSignal; no user database entity or auth policy |
| Route/model descriptor | Provider route + upstream model ID + display label; capabilities independently supported/unsupported/unknown with provenance, observation time and constraints |
| Chat input | Explicit model, typed messages/content; bounded output; optional tools, structured-output and reasoning only when the selected adapter/model accepts them |
| Chat result | Typed content/tool calls, normalized finish reason, usage provenance; opaque provider continuation state kept separately from displayable text |
| Chat stream | `AsyncIterable` of start, text delta, tool-call delta, permitted reasoning metadata, usage, and exactly one complete/error/cancel terminal outcome; one HTTP serializer |
| Error | Stable category/code, safe message, retry eligibility and optional bounded retry-after; no raw upstream body/key/prompt |
| Media ports | Image capability and asynchronous video job methods only when implemented; opaque tenant-authorized job/asset references resolved outside adapter |

Use separate optional chat/image/video interfaces rather than one required mega-interface or a plugin lifecycle system. Keep adapter registration as a static map. Add audio only after defining and testing a real consumer contract. Adding a provider should change its mapping/fixtures and composition, not unrelated providers or application policy.

Field policy: reject an explicit unsupported or unknown control with a stable validation error before sending a paid request. A model may be discoverable while a particular advanced control remains unavailable. Never drop a requested bound, silently loosen a schema, select another billing route, or convert reasoning effort into a claim about safety/quality. Provider-specific extension schemas, if needed, are owned and validated by that adapter; no free-form arbitrary JSON passthrough.

## Normalization and limits to parity

- Match shared semantic results, not raw provider packet shapes. Use one parser per provider protocol and one Gateway SSE encoder; buffer only bounded incomplete frames/tool arguments. Handle split UTF-8, CRLF, comments, duplicate finish markers and malformed frames.
- JSON-object mode, provider-side strict schemas and server-side validation are distinct. Validate returned data against the requested schema; reject invalid output. Server validation alone cannot promise upstream schema enforcement.
- Tools require explicit call identity, incremental arguments, final validation and caller-controlled execution. The Gateway must not execute tools automatically because a provider emitted a call. Missing tool support is a capability rejection.
- Reasoning effort, budget, output exclusion and opaque continuation tokens are different controls. Do not synthesize hidden reasoning or equate native/aggregator effort labels without evidence. Only expose reasoning metadata/text allowed by upstream and product policy.
- Native versus aggregator model names/versions, available tools, media formats, pricing and usage definitions can differ. Compare a known upstream model/version on explicit routes; record differences rather than promising universal equivalence.
- Distinguish provider-reported, estimated and unavailable usage. Do not count incomplete output as zero. On cancellation or malformed/late frames, produce one local terminal outcome and reconcile reserved usage conservatively. Closing transport is an abort attempt, not proof upstream work/billing stopped. Durable CAS/unique settlement keys prevent duplicate local settlement; crashes after possible dispatch remain unknown until reconciled.
- No automatic retries after stream output or ambiguous paid submission. Transient eligibility is data, not an instruction to retry; the execution service owns safe policy and total deadline.

## Contract-test strategy

PR03 supplies one reusable suite with independently authored fixtures for OpenAI and OpenRouter, then NanoGPT joins in a later slice. Assert common semantics for supported capabilities, explicit rejection for the others, and per-adapter payload mapping. Include schema-valid examples, missing/unknown capabilities, JSON-mode versus schema constraints, output caps, reasoning continuation, tools, finish/usage, empty responses, malformed UTF-8/JSON/SSE, partial chunks, cancellation, late success, deadlines, safe errors, retry limits and upstream 429/5xx.

Require stream and non-stream final equivalence where meaningful; an expected lack of usage must remain explicit. Matrix rows are promoted from unknown only with reviewed upstream documentation and executable mapping/contract evidence. Optional credentialed tests validate selected real model routes and record date/model/region; no keys or paid traffic in untrusted PR CI. These optional tests do not replace mandatory deterministic contracts or authorize marketing claims for untested routes.
