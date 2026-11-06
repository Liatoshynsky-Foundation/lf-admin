import type { LocalizedString } from '~/types/localization';

type CoverImageAltUpdate = {
  coverImage: { alt: LocalizedString };
};

type CoverImageAltRepository = {
  updateCoverImageAlt: (id: string, alt: LocalizedString) => Promise<CoverImageAltUpdate | null>;
};

type CoverImageAltRepositoryTestOptions = {
  getRepository: () => CoverImageAltRepository;
  findByIdAndUpdateMock: jest.Mock;
  createDocument: (alt: LocalizedString) => { coverImage: { alt: LocalizedString } };
  validId: string;
};

export const addCoverImageAltRepositoryTests = ({
  getRepository,
  findByIdAndUpdateMock,
  createDocument,
  validId
}: CoverImageAltRepositoryTestOptions) => {
  it('updates only cover image alt text', async () => {
    const alt = { uk: 'а', en: 'a' };
    findByIdAndUpdateMock.mockReturnValue({
      lean: jest.fn().mockResolvedValue(createDocument(alt))
    });

    const result = await getRepository().updateCoverImageAlt(validId, alt);

    expect(result?.coverImage.alt).toEqual(alt);
    expect(findByIdAndUpdateMock).toHaveBeenCalledWith(validId, { $set: { 'coverImage.alt': alt } }, { new: true });
  });

  it('returns null without updating for an invalid cover image alt ID', async () => {
    const alt = { uk: 'а', en: 'a' };

    const result = await getRepository().updateCoverImageAlt('invalid-id', alt);

    expect(result).toBeNull();
    expect(findByIdAndUpdateMock).not.toHaveBeenCalled();
  });
};
