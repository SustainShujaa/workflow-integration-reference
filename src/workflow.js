import { createHash, randomUUID } from "node:crypto";

const canonical = (value) => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
};
const effectIdFor = (request) => createHash("sha256").update(canonical(request)).digest("hex");

export class WorkflowRuntime {
  #receipts = new Map();

  constructor(connectors) {
    this.connectors = connectors;
  }

  run(input) {
    const request = validateAndNormalize(input);
    const effectId = effectIdFor(request);
    const existing = this.#receipts.get(effectId);
    if (existing) return { ...existing, replayed: true };

    const connector = this.connectors[request.connector];
    if (!connector) return { status: "NOT_EXECUTED", code: "CONNECTOR_NOT_REGISTERED", effectId };

    const effect = connector(request);
    const receipt = { receiptId: randomUUID(), effectId, workflowId: request.workflowId, connector: request.connector, target: request.target, status: "EXECUTED", effect };
    this.#receipts.set(effectId, receipt);
    return { ...receipt, replayed: false };
  }
}

function validateAndNormalize(input) {
  if (!input?.workflowId || !input?.connector || !input?.target || input.payload === undefined) throw new Error("WORKFLOW_INTAKE_INCOMPLETE");
  return { workflowId: input.workflowId, connector: input.connector, target: input.target, payload: input.payload };
}
