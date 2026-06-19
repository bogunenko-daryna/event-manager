const allowedTags = new Set(["B", "BR", "DIV", "EM", "I", "LI", "OL", "P", "SPAN", "STRONG", "U", "UL", "A"]);

export function sanitizeRichText(html: string) {
  const documentValue = new DOMParser().parseFromString(html, "text/html");

  documentValue.body.querySelectorAll("*").forEach((element) => {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    Array.from(element.attributes).forEach((attribute) => {
      const isSafeLink =
        element.tagName === "A" &&
        attribute.name === "href" &&
        /^https?:\/\//.test(attribute.value);

      if (!isSafeLink) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return documentValue.body.innerHTML.trim();
}

export function getPlainTextFromRichText(html: string) {
  const documentValue = new DOMParser().parseFromString(html, "text/html");

  return documentValue.body.textContent?.trim() ?? "";
}
