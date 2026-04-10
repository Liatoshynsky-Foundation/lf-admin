type MockSchemaType = jest.Mock & { Types: { ObjectId: StringConstructor } };

const MockSchema = jest.fn().mockImplementation(() => ({ index: jest.fn() })) as MockSchemaType;
MockSchema.Types = { ObjectId: String };

const mongoose = {
  Schema: MockSchema,
  Types: {
    ObjectId: jest.fn().mockImplementation(() => 'mocked-id'),
  },
  model: jest.fn().mockReturnValue({}),
  models: {},
};

export default mongoose;
module.exports = mongoose;