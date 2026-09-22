import { suggestionIdValidate } from "./generateId.js";
function compileExtraAttrs(extraAttrs) {
    const extraSpecs = Object.fromEntries(Object.entries(extraAttrs).map(([attrName, { spec }])=>[
            attrName,
            spec
        ]));
    const extraToDOM = (mark)=>{
        let htmlAttrs = {};
        for (const [attrName, { toDOM }] of Object.entries(extraAttrs)){
            htmlAttrs = {
                ...htmlAttrs,
                ...toDOM(mark.attrs[attrName])
            };
        }
        return htmlAttrs;
    };
    const extraParseDOM = (node)=>{
        return Object.fromEntries(Object.entries(extraAttrs).map(([attrName, { parseDOM }])=>[
                attrName,
                parseDOM(node)
            ]));
    };
    return {
        extraSpecs,
        extraToDOM,
        extraParseDOM
    };
}
export function deletion(extraAttrs = {}) {
    const { extraSpecs, extraToDOM, extraParseDOM } = compileExtraAttrs(extraAttrs);
    return {
        inclusive: false,
        excludes: "insertion modification deletion",
        attrs: {
            id: {
                validate: suggestionIdValidate
            },
            ...extraSpecs
        },
        toDOM (mark, inline) {
            return [
                "del",
                {
                    "data-id": JSON.stringify(mark.attrs["id"]),
                    "data-inline": String(inline),
                    ...!inline && {
                        style: "display: block"
                    },
                    ...extraToDOM(mark)
                },
                0
            ];
        },
        parseDOM: [
            {
                tag: "del",
                getAttrs (node) {
                    if (!node.dataset["id"]) return false;
                    return {
                        id: JSON.parse(node.dataset["id"]),
                        ...extraParseDOM(node)
                    };
                }
            }
        ]
    };
}
export function insertion(extraAttrs = {}) {
    const { extraSpecs, extraToDOM, extraParseDOM } = compileExtraAttrs(extraAttrs);
    return {
        inclusive: false,
        excludes: "deletion modification insertion",
        attrs: {
            id: {
                validate: suggestionIdValidate
            },
            ...extraSpecs
        },
        toDOM (mark, inline) {
            return [
                "ins",
                {
                    "data-id": JSON.stringify(mark.attrs["id"]),
                    "data-inline": String(inline),
                    ...!inline && {
                        style: "display: block"
                    },
                    ...extraToDOM(mark)
                },
                0
            ];
        },
        parseDOM: [
            {
                tag: "ins",
                getAttrs (node) {
                    if (!node.dataset["id"]) return false;
                    return {
                        id: JSON.parse(node.dataset["id"]),
                        ...extraParseDOM(node)
                    };
                }
            }
        ]
    };
}
export function blockBoundarySuggestion(extraAttrs = {}) {
    const { extraSpecs, extraToDOM, extraParseDOM } = compileExtraAttrs(extraAttrs);
    return {
        inclusive: false,
        attrs: {
            id: {
                validate: `${suggestionIdValidate}|null`,
                default: null
            },
            type: {
                validate: "string|null",
                default: null
            },
            ...extraSpecs
        },
        toDOM (mark, inline) {
            return [
                inline ? "span" : "div",
                {
                    "data-type": "block-boundary-suggestion",
                    "data-id": JSON.stringify(mark.attrs["id"]),
                    ...mark.attrs["endType"] && {
                        "data-change-type": mark.attrs["type"]
                    },
                    ...extraToDOM(mark)
                },
                0
            ];
        },
        parseDOM: [
            {
                tag: "span[data-type='block-boundary-suggestion']",
                getAttrs (node) {
                    if (!node.dataset["id"]) return false;
                    return {
                        id: JSON.parse(node.dataset["id"]),
                        type: node.dataset["changeType"] ?? null,
                        ...extraParseDOM(node)
                    };
                }
            },
            {
                tag: "div[data-type='block-boundary-suggestion']",
                getAttrs (node) {
                    if (!node.dataset["id"]) return false;
                    return {
                        id: JSON.parse(node.dataset["id"]),
                        type: node.dataset["changeType"] ?? null,
                        ...extraParseDOM(node)
                    };
                }
            }
        ]
    };
}
export function modification(extraAttrs = {}) {
    const { extraSpecs, extraToDOM, extraParseDOM } = compileExtraAttrs(extraAttrs);
    return {
        inclusive: false,
        excludes: "deletion insertion",
        attrs: {
            id: {
                validate: suggestionIdValidate
            },
            type: {
                validate: "string"
            },
            attrName: {
                default: null,
                validate: "string|null"
            },
            previousValue: {
                default: null
            },
            newValue: {
                default: null
            },
            ...extraSpecs
        },
        toDOM (mark, inline) {
            return [
                inline ? "span" : "div",
                {
                    "data-type": "modification",
                    "data-id": JSON.stringify(mark.attrs["id"]),
                    "data-mod-type": mark.attrs["type"],
                    "data-mod-prev-val": JSON.stringify(mark.attrs["previousValue"]),
                    "data-mod-new-val": JSON.stringify(mark.attrs["newValue"]),
                    ...extraToDOM(mark)
                },
                0
            ];
        },
        parseDOM: [
            {
                tag: "span[data-type='modification']",
                getAttrs (node) {
                    if (!node.dataset["id"]) return false;
                    return {
                        id: JSON.parse(node.dataset["id"]),
                        type: node.dataset["modType"],
                        previousValue: node.dataset["modPrevVal"],
                        newValue: node.dataset["modNewVal"],
                        ...extraParseDOM(node)
                    };
                }
            },
            {
                tag: "div[data-type='modification']",
                getAttrs (node) {
                    if (!node.dataset["id"]) return false;
                    return {
                        id: JSON.parse(node.dataset["id"]),
                        type: node.dataset["modType"],
                        previousValue: node.dataset["modPrevVal"],
                        ...extraParseDOM(node)
                    };
                }
            }
        ]
    };
}
/**
 * Add the deletion, insertion, and modification marks to
 * the provided MarkSpec map.
 */ export function addSuggestionMarks(marks, extraAttrs) {
    return {
        ...marks,
        deletion: deletion(extraAttrs),
        insertion: insertion(extraAttrs),
        modification: modification(extraAttrs),
        blockBoundarySuggestion: blockBoundarySuggestion(extraAttrs)
    };
}
