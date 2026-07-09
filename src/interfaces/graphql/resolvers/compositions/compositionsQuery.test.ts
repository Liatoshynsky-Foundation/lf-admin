import { CompositionsQuery } from './compositionsQuery'; // скоригуйте шлях за потреби
import type { GraphQLContext } from '~/back-shared/types/container/types';
import { Composition } from '~/domain/entities/Composition';
import type { ICompositionRepository } from '~/domain/repositories/compositionRepository';

describe('CompositionsQuery Resolvers', () => {
  const mockCompositionsRepo: jest.Mocked<Partial<ICompositionRepository>> = {
    findAll: jest.fn()
  };

  const buildContext = (isAdmin: boolean): GraphQLContext =>
    ({
      admin: isAdmin,
      requestContainer: {
        cradle: { 
          compositionsRepository: mockCompositionsRepo as unknown as ICompositionRepository 
        }
      }
    }) as unknown as GraphQLContext;

  const adminContext = buildContext(true);

  const mockCompositionEntity = { 
    id: '1', 
    title: { uk: 'Тестова композиція', en: 'Test Composition' } 
  } as unknown as Composition;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allCompositions should call repo.findAll with mapped filters and explicit isStandalone', async () => {
    (mockCompositionsRepo.findAll as jest.Mock).mockResolvedValue([mockCompositionEntity]);

    const result = await CompositionsQuery.allCompositions(
      {}, 
      { filters: { isStandalone: true } }, 
      adminContext
    );

    expect(mockCompositionsRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        isStandalone: true
      })
    );
    expect(result).toEqual([mockCompositionEntity]);
  });

  it('allCompositions should call repo.findAll with undefined isStandalone if filter is omitted', async () => {
    (mockCompositionsRepo.findAll as jest.Mock).mockResolvedValue([mockCompositionEntity]);

    await CompositionsQuery.allCompositions({}, { filters: {} }, adminContext);

    expect(mockCompositionsRepo.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        isStandalone: undefined
      })
    );
  });

  it('allCompositions should return empty array if repo returns null or empty list', async () => {
    (mockCompositionsRepo.findAll as jest.Mock).mockResolvedValue([]);

    const result = await CompositionsQuery.allCompositions({}, { filters: {} }, adminContext);

    expect(result).toEqual([]);
  });
});