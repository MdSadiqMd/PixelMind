type Model = {
    id: string;
    name: string;
};

type SchemaProperty = {
    type: string;
    description: string;
    default?: any;
    minimum?: number;
    maximum?: number;
};

type Schema = {
    input: {
        properties: Record<string, SchemaProperty>;
        required: string[];
    };
};

export type { Model, Schema, SchemaProperty };