import { LoginArgs } from '~/interfaces/graphql/types/admin/types';
import { GraphQLContext } from '~/interfaces/graphql/types/container/types';

export const Mutation = {
  login: async (_: unknown, args: LoginArgs, context: GraphQLContext) => {
    const loginAdmin = context.container.resolve('loginAdmin');
    const admin = await loginAdmin.execute(args.email, args.password);
    return { success: true, adminId: admin.id, adminType: admin.type };
  }
};
