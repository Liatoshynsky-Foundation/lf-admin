import { z } from 'zod';

import { validateRequestData, validateWithZod } from './validateRequestData';

describe('validateRequestData', () => {
  const mockValidationFn = jest.fn();

  beforeEach(() => {
    mockValidationFn.mockReset();
  });

  it('should return valid: true and the value when there are no validation errors', () => {
    const data = { name: 'John' };
    mockValidationFn.mockReturnValue([]);

    const result = validateRequestData(data, mockValidationFn);

    expect(result).toEqual({ valid: true, value: data });
    expect(mockValidationFn).toHaveBeenCalledWith(data);
  });

  it('should return valid: false and the errors when validation fails', () => {
    const data = { name: '' };
    mockValidationFn.mockReturnValue(['Name is required']);

    const result = validateRequestData(data, mockValidationFn);

    expect(result).toEqual({
      valid: false,
      errors: ['Name is required']
    });
    expect(mockValidationFn).toHaveBeenCalledWith(data);
  });

  it('should handle multiple validation errors', () => {
    const data = { name: '', email: 'invalid-email' };
    mockValidationFn.mockReturnValue(['Name is required', 'Email format is invalid']);

    const result = validateRequestData(data, mockValidationFn);

    expect(result).toEqual({
      valid: false,
      errors: ['Name is required', 'Email format is invalid']
    });
    expect(mockValidationFn).toHaveBeenCalledWith(data);
  });

  describe('validateWithZod', () => {
    const testSchema = z.object({
      username: z.string().min(3, 'Username must be at least 3 characters long')
    });

    it('should return valid: true and value when data matches the schema', () => {
      const validData = { username: 'alex' };

      const result = validateWithZod(validData, testSchema);

      expect(result).toEqual({ valid: true, value: validData });
    });

    it('should return valid: false and mapped error messages when data violates the schema', () => {
      const invalidData = { username: 'yo' };

      const result = validateWithZod(invalidData, testSchema);

      expect(result).toEqual({
        valid: false,
        errors: ['Username must be at least 3 characters long']
      });
    });
  });
});
