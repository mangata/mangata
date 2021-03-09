export namespace AsciiDocAbstractSemanticGraph {

    interface Attribute {
        key: string;
        value: string;
    }

    interface Node {
        type: string;
        raw: string;
        range: NodeRange;
        loc: NodeLineLocation;
        attributes?: Attribute[];
        children?: Node[]
    }

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

    interface Block extends Node {

    }

    interface Str extends Node {

    }

    interface Paragraph extends Block {

    }

    interface Header extends Node {
        title: string;
        authors?: Author[];
        revision: Revision;
    }

    type Body = Node[];

    interface Document {
        header?: Header;
        body: Body;
    }
}


