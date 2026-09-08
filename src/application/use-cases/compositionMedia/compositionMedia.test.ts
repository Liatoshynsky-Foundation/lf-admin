import {
  prepareCompositionMedia,
  syncCompositionMediaUsage,
  withCompositionMediaDisplayNames
} from './compositionMedia';
import type { Composition } from '~/domain/entities/Composition';
import { type Asset, AssetAlreadyExistsError, type IAssetRepository } from '~/domain/repositories/assetRepository';

const AUDIO_URL = 'https://cdn.example.com/compositions/audio.mp3';
const PDF_URL = 'https://cdn.example.com/compositions/score.pdf';

const createAsset = (overrides: Partial<Asset> = {}): Asset => ({
  id: 'asset-id',
  type: 'audio',
  tags: [],
  usageRefs: [],
  filename: 'audio.mp3',
  mimeType: 'audio/mpeg',
  sizeBytes: 0,
  url: AUDIO_URL,
  isStarred: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides
});

const createAssetsRepository = (): jest.Mocked<IAssetRepository> => ({
  findByUrls: jest.fn().mockResolvedValue([]),
  createAsset: jest.fn().mockResolvedValue(createAsset()),
  addUsageRef: jest.fn().mockResolvedValue(undefined),
  removeUsageRef: jest.fn().mockResolvedValue(undefined)
});

describe('composition media use cases', () => {
  describe('prepareCompositionMedia', () => {
    it('creates missing media assets and attaches the resolved PDF filename', async () => {
      const assetsRepository = createAssetsRepository();

      const media = await prepareCompositionMedia(
        {
          audios: [{ url: AUDIO_URL, name: null }],
          sheetMusic: [{ url: PDF_URL, name: '  Score  ', isFree: true }]
        },
        assetsRepository
      );

      expect(assetsRepository.findByUrls).toHaveBeenCalledWith([PDF_URL]);
      expect(assetsRepository.createAsset).toHaveBeenNthCalledWith(
        1,
        {
          filename: 'score.pdf',
          originalname: 'score.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 0,
          url: PDF_URL,
          type: 'pdf'
        },
        undefined
      );
      expect(assetsRepository.createAsset).toHaveBeenNthCalledWith(
        2,
        {
          filename: 'audio.mp3',
          originalname: 'audio.mp3',
          mimeType: 'audio/mpeg',
          sizeBytes: 0,
          url: AUDIO_URL,
          type: 'audio'
        },
        undefined
      );
      expect(media.sheetMusic).toEqual([{ url: PDF_URL, name: 'Score', fileName: 'score.pdf', isFree: true }]);
    });

    it('does not access assets for empty URLs and creates audio assets with their file extension', async () => {
      const assetsRepository = createAssetsRepository();
      const wavUrl = 'https://cdn.example.com/compositions/recording.wav';

      await expect(
        prepareCompositionMedia(
          {
            audios: [
              { url: '  ', name: null },
              { url: wavUrl, name: null },
              { url: wavUrl, name: null }
            ],
            sheetMusic: [{ url: null, name: null, isFree: true }]
          },
          assetsRepository
        )
      ).resolves.toMatchObject({ sheetMusic: [{ fileName: undefined }] });

      expect(assetsRepository.findByUrls).toHaveBeenCalledTimes(1);
      expect(assetsRepository.findByUrls).toHaveBeenCalledWith([wavUrl]);
      expect(assetsRepository.createAsset).toHaveBeenCalledTimes(1);
      expect(assetsRepository.createAsset).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'recording.wav',
          mimeType: 'audio/wav',
          url: wavUrl
        }),
        undefined
      );
    });

    it('supports omitted media collections and uses stored filenames when an asset has no original name', async () => {
      const assetsRepository = createAssetsRepository();
      assetsRepository.findByUrls.mockResolvedValue([
        createAsset({
          type: 'pdf',
          url: PDF_URL,
          originalname: undefined,
          filename: 'stored-score.pdf'
        })
      ]);

      await expect(prepareCompositionMedia({}, assetsRepository)).resolves.toEqual({ sheetMusic: [] });
      const media = await prepareCompositionMedia(
        {
          sheetMusic: [{ url: PDF_URL, name: 'Score', isFree: true }]
        },
        assetsRepository
      );

      expect(media.sheetMusic).toEqual([{ url: PDF_URL, name: 'Score', fileName: 'stored-score.pdf', isFree: true }]);
    });

    it('uses existing asset names and reports duplicate new assets as media conflicts', async () => {
      const assetsRepository = createAssetsRepository();
      assetsRepository.findByUrls.mockResolvedValue([
        createAsset({
          type: 'pdf',
          url: PDF_URL,
          filename: 'stored-score.pdf',
          originalname: 'Original score.pdf'
        })
      ]);

      const input: Pick<Composition, 'audios' | 'sheetMusic'> = {
        audios: [],
        sheetMusic: [{ url: PDF_URL, name: 'Score', isFree: true }]
      };
      const media = await prepareCompositionMedia(input, assetsRepository);

      expect(assetsRepository.createAsset).not.toHaveBeenCalled();
      expect(media.sheetMusic?.[0]?.fileName).toBe('Original score.pdf');

      assetsRepository.findByUrls.mockResolvedValue([]);
      assetsRepository.createAsset.mockRejectedValueOnce(new AssetAlreadyExistsError('score.pdf'));
      await expect(prepareCompositionMedia(input, assetsRepository)).rejects.toThrow('score.pdf');

      assetsRepository.createAsset.mockRejectedValueOnce(new Error('storage unavailable'));
      await expect(prepareCompositionMedia(input, assetsRepository)).rejects.toThrow('storage unavailable');
    });
  });

  describe('withCompositionMediaDisplayNames', () => {
    it('uses asset names for display and falls back to URL filenames', async () => {
      const assetsRepository = createAssetsRepository();
      const composition = {
        id: 'composition-id',
        audios: [{ url: AUDIO_URL, name: null }],
        sheetMusic: [{ url: PDF_URL, name: 'Score', isFree: true }]
      } as Composition;
      assetsRepository.findByUrls.mockResolvedValue([createAsset({ originalname: 'Stored audio.mp3' })]);

      const result = await withCompositionMediaDisplayNames([composition], assetsRepository);

      expect(result[0].audios?.[0]?.name).toBe('Stored audio.mp3');
      expect(result[0].sheetMusic?.[0]?.fileName).toBe('score.pdf');
      expect(
        await withCompositionMediaDisplayNames([{ ...composition, audios: [], sheetMusic: [] }], assetsRepository)
      ).toEqual([{ ...composition, audios: [], sheetMusic: [] }]);
    });

    it('preserves existing media labels and falls back to stored filenames', async () => {
      const assetsRepository = createAssetsRepository();
      const composition = {
        id: 'composition-id',
        audios: [{ url: AUDIO_URL, name: 'Audio label' }],
        sheetMusic: [{ url: PDF_URL, name: 'Score', fileName: 'Saved score.pdf', isFree: true }]
      } as Composition;
      assetsRepository.findByUrls.mockResolvedValue([
        createAsset({ url: AUDIO_URL, originalname: undefined, filename: 'stored-audio.mp3' }),
        createAsset({ url: PDF_URL, type: 'pdf', originalname: undefined, filename: 'stored-score.pdf' })
      ]);

      const result = await withCompositionMediaDisplayNames([composition], assetsRepository);

      expect(result[0].audios?.[0]?.name).toBe('Audio label');
      expect(result[0].sheetMusic?.[0]?.fileName).toBe('Saved score.pdf');
    });

    it('falls back to URL filenames when assets and media labels are missing', async () => {
      const assetsRepository = createAssetsRepository();
      const result = await withCompositionMediaDisplayNames(
        [
          {
            id: 'composition-id',
            audios: [{ url: AUDIO_URL, name: null }],
            sheetMusic: [{ url: PDF_URL, name: 'Score', fileName: '', isFree: true }]
          } as Composition
        ],
        assetsRepository
      );

      expect(result[0].audios?.[0]?.name).toBe('audio.mp3');
      expect(result[0].sheetMusic?.[0]?.fileName).toBe('score.pdf');
    });
  });

  describe('syncCompositionMediaUsage', () => {
    it('adds current usage and removes stale usage references', async () => {
      const assetsRepository = createAssetsRepository();

      await syncCompositionMediaUsage(
        'composition-id',
        {
          audios: [{ url: AUDIO_URL, name: null }],
          sheetMusic: [{ url: 'https://cdn.example.com/old.pdf', name: 'Old', isFree: true }]
        },
        { audios: [{ url: AUDIO_URL, name: null }], sheetMusic: [{ url: PDF_URL, name: 'Score', isFree: true }] },
        assetsRepository
      );

      expect(assetsRepository.addUsageRef).toHaveBeenCalledWith(
        AUDIO_URL,
        { compositionId: 'composition-id' },
        undefined
      );
      expect(assetsRepository.addUsageRef).toHaveBeenCalledWith(
        PDF_URL,
        { compositionId: 'composition-id' },
        undefined
      );
      expect(assetsRepository.removeUsageRef).toHaveBeenCalledWith(
        'https://cdn.example.com/old.pdf',
        { compositionId: 'composition-id' },
        undefined
      );
    });

    it('handles missing previous and current media collections', async () => {
      const assetsRepository = createAssetsRepository();

      await syncCompositionMediaUsage('composition-id', undefined, undefined, assetsRepository);

      expect(assetsRepository.addUsageRef).not.toHaveBeenCalled();
      expect(assetsRepository.removeUsageRef).not.toHaveBeenCalled();
    });
  });
});
