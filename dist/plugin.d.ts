import { type EditorState, Plugin, PluginKey } from "prosemirror-state";
export declare const suggestChangesKey: PluginKey<{
    enabled: boolean;
}>;
export declare function suggestChanges(): Plugin<{
    enabled: boolean;
}>;
export declare function isSuggestChangesEnabled(state: EditorState): boolean;
