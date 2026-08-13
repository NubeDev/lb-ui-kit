// The batch provider's two mount modes. Both are real: an extension mounts it under a `KitProvider`
// and lets it bind to the injected client; the shell passes its own leashed widget bridge and mounts
// no kit context at that depth.
//
// The `call`-without-provider case is not hypothetical — an earlier draft called `useKit()`
// unconditionally and threw in all seven of the shell's `useVizQuery` batch tests, which wrap a
// subtree in this provider and nothing else. That is what this file exists to stop recurring.

import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

import { makeKitClient } from "../client/makeKitClient";
import { KitProvider } from "../provider/KitProvider";
import { VizBatchProvider, useVizBatchLoader } from "./VizBatchProvider";

function Probe({ onLoader }: { onLoader: (l: ReturnType<typeof useVizBatchLoader>) => void }) {
  onLoader(useVizBatchLoader());
  return null;
}

describe("VizBatchProvider", () => {
  it("binds to an injected `call` with NO KitProvider above it", () => {
    const call = vi.fn(async () => ({ results: [] }));
    let loader: ReturnType<typeof useVizBatchLoader> = null;
    expect(() =>
      render(
        <VizBatchProvider call={call}>
          <Probe onLoader={(l) => (loader = l)} />
        </VizBatchProvider>,
      ),
    ).not.toThrow();
    expect(loader).not.toBeNull();
  });

  it("dispatches through the injected call, not through any ambient client", async () => {
    const injected = vi.fn(async () => ({ results: [{ frames: [] }] }));
    const ambient = vi.fn(async () => ({ results: [{ frames: [] }] }));
    let loader: ReturnType<typeof useVizBatchLoader> = null;
    render(
      <KitProvider client={makeKitClient(ambient)} ws="acme">
        <VizBatchProvider call={injected}>
          <Probe onLoader={(l) => (loader = l)} />
        </VizBatchProvider>
      </KitProvider>,
    );
    await loader!.load({ sources: [] });
    // The explicit leash wins. In the shell that leash is what restricts the subtree to
    // `viz.query`/`viz.query_batch`; silently preferring the ambient client would widen it.
    expect(injected).toHaveBeenCalled();
    expect(ambient).not.toHaveBeenCalled();
  });

  it("falls back to the KitProvider's client when no `call` is given", async () => {
    const client = vi.fn(async () => ({ results: [{ frames: [] }] }));
    let loader: ReturnType<typeof useVizBatchLoader> = null;
    render(
      <KitProvider client={makeKitClient(client)} ws="acme">
        <VizBatchProvider>
          <Probe onLoader={(l) => (loader = l)} />
        </VizBatchProvider>
      </KitProvider>,
    );
    await loader!.load({ sources: [] });
    expect(client).toHaveBeenCalled();
  });

  it("THROWS with neither a call nor a provider — never a silent no-op transport", () => {
    // A no-op default would render every panel in the subtree empty, which is indistinguishable from
    // "the query returned nothing". Failing loudly is the honest option.
    const quiet = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <VizBatchProvider>
          <Probe onLoader={() => {}} />
        </VizBatchProvider>,
      ),
    ).toThrow(/no `call` prop and no <KitProvider>/);
    quiet.mockRestore();
  });

  it("useVizBatchLoader is null outside any provider — the lone viz.query path", () => {
    let loader: ReturnType<typeof useVizBatchLoader> = undefined as never;
    render(<Probe onLoader={(l) => (loader = l)} />);
    expect(loader).toBeNull();
  });
});
