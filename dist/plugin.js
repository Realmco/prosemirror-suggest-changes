import { Plugin, PluginKey } from "prosemirror-state";
import { getSuggestionDecorations } from "./decorations.js";
export const suggestChangesKey = new PluginKey("@handlewithcare/prosemirror-suggest-changes");
export function suggestChanges() {
    return new Plugin({
        key: suggestChangesKey,
        state: {
            init () {
                return {
                    enabled: false
                };
            },
            apply (tr, value) {
                const meta = tr.getMeta(suggestChangesKey);
                if (meta && "enabled" in meta) return meta;
                return value;
            }
        },
        props: {
            decorations: getSuggestionDecorations
        }
    });
}
export function isSuggestChangesEnabled(state) {
    return !!suggestChangesKey.getState(state)?.enabled;
}
