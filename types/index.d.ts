export namespace AsciiDoc {
  interface Attributes {
    [key: string]: string
  }
}

export namespace AsciiDocAbstractSemanticGraph {

  interface Document {
    header?: Header;
    body: Body;
  }

  interface Header extends Node {
    title: string;
    authors?: Author[];
    revision: Revision;
  }

  interface Author {
    name: string;
    firstname: string;
    middlename: string;
    lastname: string;
    initials: string;
    email: string;
  }

  interface Revision {
    date: string;
  }

  type Body = Node[];

  interface Node {
    type: NodeType;
    attributes?: AsciiDoc.Attributes;
    children?: Node[]
  }

  type NodeType = 'Preamble' | 'Paragraph' | 'Section'
    | 'Verse' | 'STEM' | 'Sidebar' | 'Quote' | 'Open' | 'Example' | 'Listing' | 'Literal' | 'Admonition' | 'Image' | 'Video' | 'Audio' | 'Pass'
    // Attributes are already resolved in an Abstract Semantic Graph
    //| 'AttributeReference' | 'AttributeDefinition'
    | 'Strong' | 'Emphasis' | 'Monospace' | 'Subscript' | 'Superscript' | 'SingleQuotation' | 'DoubleQuotation' | 'Str'
    | 'Anchor'
    | 'OrderedList' | 'UnorderedList' | 'DescriptionList'
    | 'InlineImage' | 'InlineBreak' | 'InlineButton' | 'InlineMenu' | 'InlineMacro'
    | 'Table';
}

/**
 * Syntax tree.
 */
export namespace AsciiDocSyntaxTree {

  interface Node {
    type: string;
    raw: string;
    range: NodeRange;
    loc: NodeLineLocation;
    attributes?: AsciiDoc.Attributes;
    children?: Node[]
  }

  // 0-based index
  type NodeRange = [number, number];

  /**
   * Location
   */
  interface NodeLineLocation {
    start: NodePosition;
    end: NodePosition;
  }

  /**
   * Position's line start with 1.
   * Position's column start with 1.
   */
  interface NodePosition {
    line: number; // start with 1
    column: number; // start with 1
  }
}
