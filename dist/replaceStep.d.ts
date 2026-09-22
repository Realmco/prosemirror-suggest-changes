import { type Attrs, type Node } from "prosemirror-model";
import { type EditorState, type Transaction } from "prosemirror-state";
import { type ReplaceStep, type Step } from "prosemirror-transform";
import { type SuggestionId } from "./generateId.js";
/**
 * Transform a replace step into its equivalent tracked steps.
 *
 * Any deletions of slices that are _not_ within existing
 * insertion marks will be replaced with addMark steps that add
 * deletion marks to those ranges.
 *
 * Any deletions of slices that _are_ within existing insertion
 * marks will actually be deleted.
 *
 * Any slices that are to be inserted will also be marked with
 * insertion marks.
 *
 * If a deletion or insertion crosses a block boundary, a block
 * boundary suggestion mark will be added to all but the last
 * block touched by the change.
 *
 * After all of the above have been evaluated, if the resulting
 * insertion or deletion marks abut or join existing marks, they
 * will be joined and given the same ids.
 */
export declare function suggestReplaceStep(trackedTransaction: Transaction, state: EditorState, doc: Node, step: ReplaceStep, prevSteps: Step[], suggestionId: SuggestionId, createExtraAttrs?: () => Attrs, preventJoin?: (a: Attrs, b: Attrs) => boolean): boolean;
