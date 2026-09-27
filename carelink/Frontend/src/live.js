import { useCallback, useEffect, useRef, useState } from "react";

const changes = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("carelink-updates") : null;
changes?.addEventListener("message", () => window.dispatchEvent(new Event("carelink:changed")));
export function announceChange() {
  window.dispatchEvent(new Event("carelink:changed"));
  changes?.postMessage("refresh");
}

// One in-flight request per query; stop it on unmount, preserve current data
// through outages, and never reset an editor just because fresh data arrives.
export function useLiveQuery(loader, dependencies = []) {
  const loadRef = useRef(loader);
  loadRef.current = loader;
  const refreshRef = useRef(() => {});
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const refresh = useCallback(() => refreshRef.current(), []);
  useEffect(() => {
    let stopped = false, running = false, queued = false, timer, controller;
    const run = async () => {
      if (stopped) return;
      if (running) { queued = true; return; }
      clearTimeout(timer);
      running = true;
      controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);
      try {
        const next = await loadRef.current(controller.signal);
        if (!stopped) {
          setData(previous => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
          setError(""); setUpdatedAt(Date.now());
        }
      } catch (e) {
        if (!stopped) setError(e.name === "AbortError" ? "Connection is slow. Retrying automatically…" : e.message);
      } finally {
        clearTimeout(timeout);
        running = false;
        if (!stopped) {
          timer = setTimeout(run, queued ? 0 : 3000);
          queued = false;
        }
      }
    };
    const resume = () => { if (!document.hidden) run(); };
    refreshRef.current = run;
    window.addEventListener("carelink:changed", run);
    window.addEventListener("focus", run);
    window.addEventListener("online", run);
    document.addEventListener("visibilitychange", resume);
    run();
    return () => {
      stopped = true; clearTimeout(timer); controller?.abort();
      window.removeEventListener("carelink:changed", run);
      window.removeEventListener("focus", run);
      window.removeEventListener("online", run);
      document.removeEventListener("visibilitychange", resume);
    };
  }, dependencies);
  return { data, error, updatedAt, refresh };
}
