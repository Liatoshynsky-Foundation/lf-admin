import { NewsService } from './newsService';
import { News } from '~/domain/entities/News';
import { NewsRepository } from '~/domain/repositories/newsRepository';
import { NewsStatus } from '~/types/enums/common.enums';

describe('NewsService', () => {
  let mockNewsRepository: jest.Mocked<NewsRepository>;
  let newsService: ReturnType<typeof NewsService>;

  const mockNews: News = {
    id: '507f1f77bcf86cd799439011',
    publishedAt: new Date('2024-01-01'),
    newsDate: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    title: {
      uk: 'Тестова новина',
      en: 'Test News'
    },
    description: {
      uk: 'Опис',
      en: 'Description'
    },
    content: {
      uk: 'Контент',
      en: 'Content'
    },
    slug: 'test-news',
    coverImage: {
      src: 'test-image.jpg',
      alt: { uk: 'Альт текст', en: 'Alt text' },
      caption: { uk: 'Підпис', en: 'Caption' },
      isTmp: false
    },
    status: NewsStatus.Published,
    meta: {
      views: 0
    }
  };

  beforeEach(() => {
    mockNewsRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      incrementViews: jest.fn()
    };

    newsService = NewsService({ newsRepository: mockNewsRepository });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createNews', () => {
    it('should create a new news article with default status', async () => {
      const input = {
        title: mockNews.title,
        content: mockNews.content,
        slug: 'new-news',
        coverImage: mockNews.coverImage,
        newsDate: new Date('2024-01-01')
      };

      mockNewsRepository.findBySlug.mockResolvedValue(null);
      mockNewsRepository.create.mockResolvedValue({ ...mockNews, ...input, status: NewsStatus.Draft });

      const result = await newsService.createNews(input);

      expect(mockNewsRepository.findBySlug).toHaveBeenCalledWith('new-news');
      expect(mockNewsRepository.create).toHaveBeenCalledWith({
        ...input,
        status: NewsStatus.Draft,
        publishedAt: null,
        meta: { views: 0 }
      });
      expect(result.status).toBe(NewsStatus.Draft);
    });

    it('should throw error if slug already exists', async () => {
      const input = {
        title: mockNews.title,
        content: mockNews.content,
        slug: 'test-news',
        coverImage: mockNews.coverImage,
        newsDate: new Date('2024-01-01')
      };

      mockNewsRepository.findBySlug.mockResolvedValue(mockNews);

      await expect(newsService.createNews(input)).rejects.toThrow('News with slug "test-news" already exists');
    });

    it('should create news with custom status', async () => {
      const input = {
        title: mockNews.title,
        content: mockNews.content,
        slug: 'new-news',
        coverImage: mockNews.coverImage,
        status: NewsStatus.Published,
        publishedAt: new Date('2024-01-01'),
        newsDate: new Date('2024-01-01')
      };

      mockNewsRepository.findBySlug.mockResolvedValue(null);
      mockNewsRepository.create.mockResolvedValue({ ...mockNews, ...input });

      const result = await newsService.createNews(input);

      expect(mockNewsRepository.create).toHaveBeenCalledWith({
        ...input,
        meta: { views: 0 }
      });
      expect(result).toBeDefined();
      expect(result.status).toBe(NewsStatus.Published);
    });
  });

  describe('getNewsById', () => {
    it('should return news by id', async () => {
      mockNewsRepository.findById.mockResolvedValue(mockNews);

      const result = await newsService.getNewsById('507f1f77bcf86cd799439011');

      expect(mockNewsRepository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockNews);
    });

    it('should return null if news not found', async () => {
      mockNewsRepository.findById.mockResolvedValue(null);

      const result = await newsService.getNewsById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('getNewsBySlug', () => {
    it('should return news by slug', async () => {
      mockNewsRepository.findBySlug.mockResolvedValue(mockNews);

      const result = await newsService.getNewsBySlug('test-news');

      expect(mockNewsRepository.findBySlug).toHaveBeenCalledWith('test-news');
      expect(result).toEqual(mockNews);
    });
  });

  describe('getAllNews', () => {
    it('should return all news', async () => {
      mockNewsRepository.findAll.mockResolvedValue([mockNews]);

      const result = await newsService.getAllNews();

      expect(mockNewsRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([mockNews]);
    });

    it('should return news with filters', async () => {
      const filters = { status: NewsStatus.Published, limit: 10 };
      mockNewsRepository.findAll.mockResolvedValue([mockNews]);

      const result = await newsService.getAllNews(filters);

      expect(mockNewsRepository.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual([mockNews]);
    });
  });

  describe('getPublishedNews', () => {
    it('should return only published news', async () => {
      mockNewsRepository.findAll.mockResolvedValue([mockNews]);

      const result = await newsService.getPublishedNews();

      expect(mockNewsRepository.findAll).toHaveBeenCalledWith({
        status: NewsStatus.Published
      });
      expect(result).toEqual([mockNews]);
    });

    it('should apply additional filters', async () => {
      const filters = { limit: 5, sortBy: 'publishedAt' as const };
      mockNewsRepository.findAll.mockResolvedValue([mockNews]);

      const result = await newsService.getPublishedNews(filters);

      expect(mockNewsRepository.findAll).toHaveBeenCalledWith({
        ...filters,
        status: NewsStatus.Published
      });
      expect(result).toEqual([mockNews]);
    });
  });

  describe('updateNews', () => {
    it('should update news successfully', async () => {
      const updateData = { title: { uk: 'Оновлена', en: 'Updated' } };
      mockNewsRepository.update.mockResolvedValue({ ...mockNews, ...updateData });

      const result = await newsService.updateNews('507f1f77bcf86cd799439011', updateData);

      expect(mockNewsRepository.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', updateData);
      expect(result.title).toEqual(updateData.title);
    });

    it('should throw error if news not found', async () => {
      mockNewsRepository.update.mockResolvedValue(null);

      await expect(newsService.updateNews('nonexistent-id', {})).rejects.toThrow(
        'News with id "nonexistent-id" not found'
      );
    });

    it('should check for slug uniqueness when updating', async () => {
      const updateData = { slug: 'another-news' };
      const anotherNews = { ...mockNews, id: 'another-id', slug: 'another-news' };

      mockNewsRepository.findBySlug.mockResolvedValue(anotherNews);

      await expect(newsService.updateNews('507f1f77bcf86cd799439011', updateData)).rejects.toThrow(
        'News with slug "another-news" already exists'
      );
    });

    it('should allow updating same news slug', async () => {
      const updateData = { slug: 'test-news' };
      mockNewsRepository.findBySlug.mockResolvedValue(mockNews);
      mockNewsRepository.update.mockResolvedValue(mockNews);

      const result = await newsService.updateNews('507f1f77bcf86cd799439011', updateData);

      expect(mockNewsRepository.update).toHaveBeenCalled();
      expect(result).toEqual(mockNews);
    });
  });

  describe('publishNews', () => {
    it('should publish news with default date', async () => {
      const draftNews = { ...mockNews, status: NewsStatus.Draft, publishedAt: null };
      mockNewsRepository.findById.mockResolvedValue(draftNews);
      mockNewsRepository.update.mockResolvedValue({ ...draftNews, status: NewsStatus.Published });

      const result = await newsService.publishNews({ id: '507f1f77bcf86cd799439011' });

      expect(mockNewsRepository.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', {
        status: NewsStatus.Published,
        publishedAt: expect.any(Date)
      });
      expect(result.status).toBe(NewsStatus.Published);
    });

    it('should publish news with custom date', async () => {
      const publishDate = new Date('2024-02-01');
      const draftNews = { ...mockNews, status: NewsStatus.Draft, publishedAt: null };
      mockNewsRepository.findById.mockResolvedValue(draftNews);
      mockNewsRepository.update.mockResolvedValue({ ...draftNews, status: NewsStatus.Published });

      const result = await newsService.publishNews({ id: '507f1f77bcf86cd799439011', publishedAt: publishDate });

      expect(mockNewsRepository.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', {
        status: NewsStatus.Published,
        publishedAt: publishDate
      });
      expect(result.status).toBe(NewsStatus.Published);
    });

    it('should throw error if news not found', async () => {
      mockNewsRepository.findById.mockResolvedValue(null);

      await expect(newsService.publishNews({ id: 'nonexistent-id' })).rejects.toThrow(
        'News with id "nonexistent-id" not found'
      );
    });
  });

  describe('unpublishNews', () => {
    it('should unpublish news', async () => {
      mockNewsRepository.findById.mockResolvedValue(mockNews);
      mockNewsRepository.update.mockResolvedValue({ ...mockNews, status: NewsStatus.Draft, publishedAt: null });

      const result = await newsService.unpublishNews('507f1f77bcf86cd799439011');

      expect(mockNewsRepository.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', {
        status: NewsStatus.Draft,
        publishedAt: null
      });
      expect(result.status).toBe(NewsStatus.Draft);
    });
  });

  describe('archiveNews', () => {
    it('should archive news', async () => {
      mockNewsRepository.findById.mockResolvedValue(mockNews);
      mockNewsRepository.update.mockResolvedValue({ ...mockNews, status: NewsStatus.Archived });

      const result = await newsService.archiveNews('507f1f77bcf86cd799439011');

      expect(mockNewsRepository.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', {
        status: NewsStatus.Archived
      });
      expect(result.status).toBe(NewsStatus.Archived);
    });
  });

  describe('hideNews', () => {
    it('should hide news', async () => {
      mockNewsRepository.findById.mockResolvedValue(mockNews);
      mockNewsRepository.update.mockResolvedValue({ ...mockNews, status: NewsStatus.Hidden });

      const result = await newsService.hideNews('507f1f77bcf86cd799439011');

      expect(mockNewsRepository.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', {
        status: NewsStatus.Hidden
      });
      expect(result.status).toBe(NewsStatus.Hidden);
    });
  });

  describe('deleteNews', () => {
    it('should delete news successfully', async () => {
      mockNewsRepository.delete.mockResolvedValue(true);

      const result = await newsService.deleteNews('507f1f77bcf86cd799439011');

      expect(mockNewsRepository.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toBe(true);
    });

    it('should throw error if news not found', async () => {
      mockNewsRepository.delete.mockResolvedValue(false);

      await expect(newsService.deleteNews('nonexistent-id')).rejects.toThrow(
        'News with id "nonexistent-id" not found or could not be deleted'
      );
    });
  });

  describe('getNewsCount', () => {
    it('should return count of all news', async () => {
      mockNewsRepository.count.mockResolvedValue(42);

      const result = await newsService.getNewsCount();

      expect(mockNewsRepository.count).toHaveBeenCalledWith(undefined);
      expect(result).toBe(42);
    });

    it('should return count with filters', async () => {
      const filters = { status: NewsStatus.Published };
      mockNewsRepository.count.mockResolvedValue(10);

      const result = await newsService.getNewsCount(filters);

      expect(mockNewsRepository.count).toHaveBeenCalledWith(filters);
      expect(result).toBe(10);
    });
  });

  describe('incrementViews', () => {
    it('should increment view count', async () => {
      const updatedNews = { ...mockNews, meta: { views: 1 } };
      mockNewsRepository.incrementViews.mockResolvedValue(updatedNews);

      const result = await newsService.incrementViews('507f1f77bcf86cd799439011');

      expect(mockNewsRepository.incrementViews).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result.meta.views).toBe(1);
    });

    it('should throw error if news not found', async () => {
      mockNewsRepository.incrementViews.mockResolvedValue(null);

      await expect(newsService.incrementViews('nonexistent-id')).rejects.toThrow(
        'News with id "nonexistent-id" not found'
      );
    });
  });

  describe('getPaginatedNews', () => {
    it('should return paginated news', async () => {
      mockNewsRepository.findAll.mockResolvedValue([mockNews]);
      mockNewsRepository.count.mockResolvedValue(25);

      const result = await newsService.getPaginatedNews(1, 10);

      expect(mockNewsRepository.findAll).toHaveBeenCalledWith({
        limit: 10,
        skip: 0
      });
      expect(mockNewsRepository.count).toHaveBeenCalledWith(undefined);
      expect(result).toEqual({
        news: [mockNews],
        total: 25,
        page: 1,
        totalPages: 3
      });
    });

    it('should handle second page correctly', async () => {
      mockNewsRepository.findAll.mockResolvedValue([mockNews]);
      mockNewsRepository.count.mockResolvedValue(25);

      const result = await newsService.getPaginatedNews(2, 10);

      expect(mockNewsRepository.findAll).toHaveBeenCalledWith({
        limit: 10,
        skip: 10
      });
      expect(result.page).toBe(2);
    });

    it('should apply filters to paginated results', async () => {
      const filters = { status: NewsStatus.Published };
      mockNewsRepository.findAll.mockResolvedValue([mockNews]);
      mockNewsRepository.count.mockResolvedValue(10);

      await newsService.getPaginatedNews(1, 5, filters);

      expect(mockNewsRepository.findAll).toHaveBeenCalledWith({
        ...filters,
        limit: 5,
        skip: 0
      });
      expect(mockNewsRepository.count).toHaveBeenCalledWith(filters);
    });
  });
});
