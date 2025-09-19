export type Patch = {
  $set?: Record<string, JsonValue>;
  $unset?: Record<string, ''>;
};

export type JsonPrimitive = string | number | boolean | null;
export type JsonArray = JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export type JsonValue = JsonPrimitive | JsonArray | JsonObject;
