/**
 * Get the suggestion mark types from a schema, with proper error handling.
 * Throws an error if any of the required marks are not found.
 */ export function getSuggestionMarks(schema) {
    const { insertion, deletion, modification, blockBoundarySuggestion } = schema.marks;
    if (!insertion) {
        throw new Error("Failed to find insertion mark in schema. Did you forget to add it?");
    }
    if (!deletion) {
        throw new Error("Failed to find deletion mark in schema. Did you forget to add it?");
    }
    if (!modification) {
        throw new Error("Failed to find modification mark in schema. Did you forget to add it?");
    }
    if (!blockBoundarySuggestion) {
        throw new Error("Failed to find blockBoundarySuggestion mark in schema. Did you forget to add it?");
    }
    return {
        insertion,
        deletion,
        modification,
        blockBoundarySuggestion
    };
}
export function beforesInBlockRange($pos, blockRange) {
    let d = $pos.depth;
    while(!$pos.node(d).isBlock && d > 0){
        d--;
    }
    const befores = [];
    while(d > blockRange.depth){
        befores.push($pos.before(d));
        d--;
    }
    return befores;
}
