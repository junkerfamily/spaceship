import { bindings, defineConfig, exports } from "cf/config";
import * as entrypoint from "./src/index.ts" with { type: "cf-worker" };

// Relay that keeps the mission control iPad and the cockpit window iPad in sync.
export default defineConfig({
	worker: {
		name: "explorer-relay",
		compatibilityDate: "2026-10-06",
		entrypoint,
		exports: {
			Room: exports.durableObject({ storage: "sqlite" }),
		},
		env: {
			ROOM: bindings.durableObject({ worker: "explorer-relay", exportName: "Room" }),
		},
	},
});
