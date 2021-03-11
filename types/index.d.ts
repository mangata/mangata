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
    raw: string;
    range: NodeRange;
    loc: NodeLineLocation;
    attributes?: Attributes;
    children?: Node[]
  }

  interface Attributes {
    [key: string]: string
  }

  type NodeType = 'Preamble' | 'Paragraph' | 'Section'
    | 'Verse' | 'STEM' | 'Sidebar' | 'Quote' | 'Open' | 'Example' | 'Listing' | 'Literal' | 'Admonition' | 'Image' | 'Video' | 'Audio' | 'Pass'
    | 'AttributeReference' | 'AttributeDefinition'
    | 'Strong' | 'Emphasis' | 'Monospace' | 'Subscript' | 'Superscript' | 'SingleQuotation' | 'DoubleQuotation' | 'Str'
    | 'Anchor'
    | 'OrderedList' | 'UnorderedList' | 'DescriptionList'
    | 'InlineImage' | 'InlineBreak' | 'InlineButton' | 'InlineMenu' | 'InlineMacro'
    | 'Table';

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


