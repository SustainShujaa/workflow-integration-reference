import { WorkflowRuntime } from "./workflow.js";

const runtime = new WorkflowRuntime({
  "work-item": ({ target, payload }) => ({ delivery: "simulated", target, title: payload.title, status: "created" })
});

const request = { workflowId: "synthetic-intake-v1", connector: "work-item", target: "review-queue", payload: { title: "Review intake record" } };
console.log(JSON.stringify({ firstRun: runtime.run(request), replay: runtime.run(request) }, null, 2));
