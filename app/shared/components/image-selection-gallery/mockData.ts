import { GalleryImage } from './types';

export const mockImages: GalleryImage[] = [
  {
    id: '1',
    src: '/images/foundation-second.png',
    name: 'liatoshynsky-portrait.jpg',
    alt: 'Boris Liatoshynsky portrait',
    width: 912,
    height: 515,
    languageVersion: 'uk',
    uploadedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    src: '/images/foundation-first.png',
    name: 'piano-studio.jpg',
    alt: 'Piano in studio',
    width: 1920,
    height: 1080,
    languageVersion: null,
    uploadedAt: new Date('2024-01-20')
  },
  {
    id: '3',
    src: '/images/mission-1.png',
    name: 'composer-at-work.jpg',
    alt: 'Composer working',
    width: 1024,
    height: 768,
    languageVersion: 'en',
    uploadedAt: new Date('2024-02-01')
  },
  {
    id: '4',
    src: '/images/foundation-first.png',
    name: 'music-sheet.jpg',
    alt: 'Music sheet',
    width: 800,
    height: 600,
    languageVersion: null,
    uploadedAt: new Date('2024-02-10')
  },
  {
    id: '5',
    src: '/images/mission-1.png',
    name: 'orchestra-hall.jpg',
    alt: 'Orchestra hall',
    width: 1600,
    height: 900,
    languageVersion: 'uk',
    uploadedAt: new Date('2024-02-15')
  },
  {
    id: '6',
    src: '/images/Image_2.png',
    name: 'vintage-photo.jpg',
    alt: 'Vintage photo',
    width: 640,
    height: 480,
    languageVersion: null,
    uploadedAt: new Date('2024-03-01')
  },
  {
    id: '7',
    src: '/images/foundation-second.png',
    name: 'concert-poster.jpg',
    alt: 'Concert poster',
    width: 1200,
    height: 1600,
    languageVersion: 'en',
    uploadedAt: new Date('2024-03-10')
  }
];
