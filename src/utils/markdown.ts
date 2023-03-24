type ElementConfig = {
  tag: string;
  attributes?: {
    [key: string]: string;
  };
};

type MappingConfig = {
  baseExpression?: ElementConfig;
  heading1?: ElementConfig;
  heading2?: ElementConfig;
  heading3?: ElementConfig;
  bold?: ElementConfig;
  italic?: ElementConfig;
  blockquote?: ElementConfig;
  ordered_list?: ElementConfig;
  unordered_list?: ElementConfig;
  list_item?: ElementConfig;
  code?: ElementConfig;
  link?: ElementConfig;
  image?: ElementConfig;
};

export class MarkdownParser {
  config: MappingConfig;
  exportString: string;
  constructor(config?: MappingConfig) {
    this.config = {
      baseExpression: { tag: "p" },
      heading1: { tag: "h1" },
      heading2: { tag: "h2" },
      heading3: { tag: "h3" },
      bold: { tag: "strong" },
      italic: { tag: "em" },
      blockquote: { tag: "blockquote" },
      ordered_list: { tag: "ol" },
      unordered_list: { tag: "ul" },
      list_item: { tag: "li" },
      code: { tag: "code" },
      link: { tag: "a", attributes: { target: "_blank" } },
      image: {
        tag: "img",
        attributes: {
          alt: "Image",
        },
      },
      ...config,
    };

    this.exportString = "";
  }

  createImg(tag: string) {
    console.log(tag)
    let string = `<img src="${tag.substring(
      tag.indexOf("(") + 1,
      tag.indexOf(")")
    )}" alt="${tag.substring(tag.indexOf("[") + 1, tag.indexOf("]"))}"`;
    if (this.config.image?.attributes)
      for (const attr of Object.keys(this.config.image?.attributes)) {
        string += `${attr}= "${this.config.image?.attributes[attr]}"`;
      }
    string += "/>";
    return string;
  }

  createLink(tag: string) {
    console.log(tag)
    let string = `<a href="${tag.substring(
      tag.indexOf("(") + 1,
      tag.indexOf(")")
    )}"`;
    if (this.config.link?.attributes)
      for (const attr of Object.keys(this.config.link?.attributes)) {
        string += `${attr}= \"${this.config.link?.attributes[attr]}\"`;
      }
    string += `>${tag.substring(tag.indexOf("[") + 1, tag.indexOf("]"))}</a>`;
    return string;
  }

  openExpression(key: keyof MappingConfig = "baseExpression") {
    const element = this.config[key];
    let elementString = `<${element?.tag} `;
    if (element?.attributes) {
      for (const attr of Object.keys(element.attributes)) {
        elementString += `${attr}= \"${element.attributes[attr]}\"`;
      }
    }
    elementString += ">";
    return elementString;
  }

  closeExpression(key: keyof MappingConfig = "baseExpression") {
    const element = this.config[key];
    return `</${element?.tag}>`;
  }

  parse(markdown: string) {
    this.exportString = "";
    let isHeading = false,
      isBold = false,
      isItalic = false,
      isBlockquote = false,
      isUnorderedList = false,
      isOrderedList = false,
      isListItem = false,
      isCode = false,
      newExpression = false;
    let headingCount = 1;
    let spaceCount = 0;

    for (let i = 0; i < markdown.length; i++) {
      // check if heading
      // if is heading then parse to correct heading tag
      if (!isHeading) {
        if (markdown[i] === "#") {
          isHeading = true;
          if (i + 1 < markdown.length && markdown[i + 1] === "#") {
            i++;
            headingCount++;
          }
          if (i + 1 < markdown.length && markdown[i + 1] === "#") {
            i++;
            headingCount++;
          }
          if (!newExpression) {
            if (isUnorderedList)
              this.exportString += this.closeExpression("unordered_list");
            newExpression = true;
          }
          this.exportString += this.openExpression(
            `heading${headingCount}` as keyof MappingConfig
          );
          continue;
        }
      }
      // create new expression if one does not exist
      if (!newExpression) {
        if (markdown[i] === " ") {
          spaceCount++;
        }
        // create block quote
        if (spaceCount >= 4) {
          newExpression = true;
        }
        if (markdown[i] !== " ") {
          switch (markdown[i]) {
            case "-":
              newExpression = true;
              if (!isUnorderedList) {
                isUnorderedList = true;
                this.exportString += this.openExpression("unordered_list");
              }
              isListItem = true;
              this.exportString += this.openExpression("list_item");
              continue;
            default:
              if(markdown[i].charCodeAt(0) === 10)
                break;
              newExpression = true;
              if (isUnorderedList) {
                isUnorderedList = false;
                this.exportString += this.closeExpression("unordered_list");
              }
              this.exportString += this.openExpression();
              break;
          }
        }
      }
      if (markdown[i] === "*") {
        if (i + 1 < markdown.length && markdown[i + 1] === "*") {
          if (isBold) {
            isBold = false;
            this.exportString += this.closeExpression("bold");
            i++;
            continue;
          } else {
            isBold = true;
            this.exportString += this.openExpression("bold");
            i++;
            continue;
          }
        } else {
          if (isItalic) {
            isItalic = false;
            this.exportString += this.closeExpression("italic");
            continue;
          } else {
            isItalic = true;
            this.exportString += this.openExpression("italic");
            continue;
          }
        }
      }
      if (markdown[i] === "!") {
        if (i + 1 < markdown.length && markdown[i + 1] === "[") {
          const closingIndex = markdown.substring(i).indexOf("]");
          if (markdown.substring(i)[closingIndex + 1] === "(") {
            this.exportString += this.createImg(
              markdown.substring(i, markdown.substring(i).indexOf(")") + 1 + i)
            );
            i += markdown.substring(i).indexOf(")");
            continue;
          }
        }
      }
      if(markdown[i] === "[") {
        const closingIndex = markdown.substring(i).indexOf("]");
          if (markdown.substring(i)[closingIndex + 1] === "(") {
            this.exportString += this.createLink(
              markdown.substring(i, markdown.substring(i).indexOf(")") + 1 + i)
            );
            i += markdown.substring(i).indexOf(")");
            continue;
          }
      }
      if (markdown[i].charCodeAt(0) === 10) {
        console.log("breakfound");
        if (isHeading) {
          this.exportString += this.closeExpression(
            `heading${headingCount}` as keyof MappingConfig
          );
          isHeading = false;
          newExpression = false;
          headingCount = 1;
          continue;
        } else if (isListItem) {
          this.exportString += this.closeExpression("list_item");
          newExpression = false;
          continue;
        } else if(newExpression) {
          this.exportString += this.closeExpression();
          newExpression = false;
          continue;
        } else {
          this.exportString += "</br>"
          continue;
        }
      }
      this.exportString += markdown[i];
    }
    return this.exportString;
  }
}
