import test from "node:test";
import assert from "node:assert/strict";
import { WorkflowRuntime } from "../src/workflow.js";

const calls = [];
const runtime = new WorkflowRuntime({
  "work-item": (request) => {
    calls.push(request);
    return { delivery: "simulated", target: request.target };
  }
});
const request = { workflowId: "w-1", connector: "work-item", target: "queue-a", payload: { title: "Review record" } };

test("validates required workflow intake", () => {
  assert.throws(() => runtime.run({ workflowId: "w-1" }), /WORKFLOW_INTAKE_INCOMPLETE/);
});

test("executes a registered narrow connector and emits a receipt", () => {
  const result = runtime.run(request);
  assert.equal(result.status, "EXECUTED");
  assert.equal(result.effect.delivery, "simulated");
  assert.equal(result.replayed, false);
});

test("returns the original receipt for a replay instead of repeating the connector call", () => {
  const first = runtime.run(request);
  const second = runtime.run(request);
  assert.equal(second.replayed, true);
  assert.equal(first.receiptId, second.receiptId);
  assert.equal(calls.length, 1);
});

test("denies an unknown connector without emitting an effect", () => {
  const result = runtime.run({ ...request, workflowId: "w-2", connector: "unknown" });
  assert.equal(result.status, "NOT_EXECUTED");
  assert.equal(result.code, "CONNECTOR_NOT_REGISTERED");
});

test("changes effect identity when normalized payload changes", () => {
  const changed = runtime.run({ ...request, workflowId: "w-3", payload: { title: "Different record" } });
  const original = runtime.run({ ...request, workflowId: "w-4" });
  assert.notEqual(changed.effectId, original.effectId);
});
