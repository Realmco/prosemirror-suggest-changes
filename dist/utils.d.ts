import { type ResolvedPos, type MarkType, type Schema, type NodeRange } from "prosemirror-model";
export interface SuggestionMarks {
    insertion: MarkType;
    deletion: MarkType;
    modification: MarkType;
    blockBoundarySuggestion: MarkType;
}
/**
 * Get the suggestion mark types from a schema, with proper error handling.
 * Throws an error if any of the required marks are not found.
 */
export declare function getSuggestionMarks(schema: Schema): SuggestionMarks;
export declare function beforesInBlockRange($pos: ResolvedPos, blockRange: NodeRange): number[];
