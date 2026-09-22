import { type Attrs, type Node } from "prosemirror-model";
import { type EditorState, type Transaction } from "prosemirror-state";
import { type RemoveMarkStep, type Step } from "prosemirror-transform";
import { type SuggestionId } from "./generateId.js";
/**
 * Transform a remove mark step into its equivalent tracked steps.
 *
 * Add mark steps are treated as replace steps in this model. An
 * equivalent replace step will be generated, and then processed via
 * trackReplaceStep().
 */
export declare function suggestRemoveMarkStep(trackedTransaction: Transaction, state: EditorState, doc: Node, step: RemoveMarkStep, prevSteps: Step[], suggestionId: SuggestionId, extraAttrs?: () => Attrs, preventJoin?: (a: Attrs, b: Attrs) => boolean): boolean;
