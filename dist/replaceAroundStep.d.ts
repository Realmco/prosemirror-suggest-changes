import { type Attrs, type Node } from "prosemirror-model";
import { type EditorState, type Transaction } from "prosemirror-state";
import { type ReplaceAroundStep, type Step } from "prosemirror-transform";
import { type SuggestionId } from "./generateId.js";
/**
 * Transform a replace around step into its equivalent tracked steps.
 *
 * Replace around steps are treated as replace steps in this model. An
 * equivalent replace step will be generated, and then processed via
 * trackReplaceStep().
 */
export declare function suggestReplaceAroundStep(trackedTransaction: Transaction, state: EditorState, doc: Node, step: ReplaceAroundStep, prevSteps: Step[], suggestionId: SuggestionId, extraAttrs?: () => Attrs, preventJoin?: (a: Attrs, b: Attrs) => boolean): boolean;
