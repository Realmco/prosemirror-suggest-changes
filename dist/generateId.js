import { getSuggestionMarks } from "./utils.js";
export const suggestionIdValidate = "number|string";
export function parseSuggestionId(id) {
    const parsed = parseInt(id, 10);
    if (isNaN(parsed)) {
        return id;
    }
    return parsed;
}
export function generateNextNumberId(schema, doc) {
    const { deletion, insertion, modification, blockBoundarySuggestion } = getSuggestionMarks(schema);
    // Find the highest change id in the document so far,
    // and use that as the starting point for new changes
    let suggestionId = 0;
    doc?.descendants((node)=>{
        const marks = node.marks.filter((mark)=>mark.type === insertion || mark.type === deletion || mark.type === modification || mark.type === blockBoundarySuggestion);
        if (marks.length) {
            suggestionId = Math.max(suggestionId, ...marks.map((mark)=>mark.attrs["id"]));
            return true;
        }
        return true;
    });
    return suggestionId + 1;
}
