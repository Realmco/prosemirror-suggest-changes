import { type AttributeSpec, type MarkSpec } from "prosemirror-model";
export type SuggestionType = "insertion" | "deletion";
export declare function deletion(extraAttrs?: Record<string, ExtraAttr>): MarkSpec;
export declare function insertion(extraAttrs?: Record<string, ExtraAttr>): MarkSpec;
export interface BoundarySuggestion {
    id: string | number | null;
    type: SuggestionType | null;
}
export declare function blockBoundarySuggestion(extraAttrs?: Record<string, ExtraAttr>): MarkSpec;
export declare function modification(extraAttrs?: Record<string, ExtraAttr>): MarkSpec;
export interface ExtraAttr {
    spec: AttributeSpec;
    toDOM: (value: any) => Record<string, string>;
    parseDOM: (node: HTMLElement) => unknown;
}
/**
 * Add the deletion, insertion, and modification marks to
 * the provided MarkSpec map.
 */
export declare function addSuggestionMarks<Marks extends string>(marks: Record<Marks, MarkSpec>, extraAttrs?: Record<string, ExtraAttr>): Record<Marks | "deletion" | "insertion" | "modification" | "blockBoundarySuggestion", MarkSpec>;
