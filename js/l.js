/*
a new HTML-element is made with the tag
if there is an object apply its attributes to the element
append each given child to the element
*/
export function l(tagOrElement = "DIV", attributes = {}, ...children) {
    const element = typeof tagOrElement === "string" ? document.createElement(tagOrElement) : tagOrElement;
    attribute(element, attributes);
    element.append(...children);
    return element;
}
// applies all attributes in an object to a HTML-element
function attribute(element, attributes) {
    for (const [key, value] of Object.entries(attributes)) {
        if (typeof value === "object") {
            attribute(element[key], value);
        }
        else {
            element[key] = value;
        }
    }
}
//# sourceMappingURL=l.js.map