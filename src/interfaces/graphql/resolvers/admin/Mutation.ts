import { LoginError } from '~/back-constants/customErrors/adminErrors';
import { LoginArgs } from '~/shared/types/admin/types';
import { GraphQLContext } from '~/shared/types/container/types';

export const Mutation = {
  login: async (_: unknown, args: LoginArgs, context: GraphQLContext) => {
    const loginAdmin = context.container.resolve('loginAdmin');
    try {
      const admin = await loginAdmin.execute(args.email, args.password);
      return {
        __typename: 'LoginPayload',
        success: true,
        adminId: admin.id,
        adminType: admin.type
      };
    } catch (err) {
      if (err instanceof LoginError) {
        return {
          __typename: 'ErrorPayload',
          success: false,
          message: err.message,
          statusCode: 401
        };
      }
      throw err;
    }
  }
};
