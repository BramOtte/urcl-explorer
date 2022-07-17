type L<T extends string | HTMLElement> =  T extends keyof HTMLElementTagNameMap ? HTMLElementTagNameMap[T]: (T extends HTMLElement ? T : HTMLElement)
type RPartial<T> = {[K in keyof T]?: T[K] extends object ? RPartial<T[K]> : T[K]};

/*
a new HTML-element is made with the tag
if there is an object apply its attributes to the element
append each given child to the element
*/
export function l<T extends keyof HTMLElementTagNameMap | HTMLElement>
    (tagOrElement: T = "DIV" as any, attributes: RPartial<L<T>> & {tagName?: never} = {}, ...children: (Node|string)[]): L<T>
{
    const element: HTMLElement = typeof tagOrElement === "string" ? document.createElement(tagOrElement) : tagOrElement;
    attribute(element, attributes as any)
    element.append(...children)
    return element as any;
}

// applies all attributes in an object to a HTML-element
function attribute<T extends Record<string, any>>(element: T, attributes: RPartial<T>){
    for (const [key, value] of Object.entries(attributes)){
        if (typeof value === "object"){
            attribute(element[key], value);
        } else {
            element[key as keyof T] = value;
        }
    }
}
