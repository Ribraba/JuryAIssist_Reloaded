import { LazyStore } from "@tauri-apps/plugin-store";

export const settingsStore = new LazyStore("config.json");
export const historyStore = new LazyStore("history.json");
export const timesheetStore = new LazyStore("timesheet.json");
