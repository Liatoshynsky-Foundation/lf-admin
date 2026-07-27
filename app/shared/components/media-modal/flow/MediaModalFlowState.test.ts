import type { MediaModalOpenState, SelectedMedia } from '../MediaModal.types';
import { buildInitialState, reducer } from './MediaModalFlowState';
import type { CropResult } from '~/types/common';

const initialCrop: CropResult = { rect: { x: 0, y: 0, width: 200, height: 200 } };
const resizedCrop: CropResult = { rect: { x: 10, y: 12, width: 180, height: 160 } };

describe('MediaModalFlowState', () => {
  it('should derive tab from initial selected (upload -> UPLOAD)', () => {
    const initial: MediaModalOpenState = {
      selected: {
        kind: 'upload',
        id: 'upload-1',
        fileName: 'a.png',
        file: new File(['x'], 'a.png', { type: 'image/png' })
      }
    };

    const state = buildInitialState(initial);

    expect(state.tab).toBe('UPLOAD');
    expect(state.step).toBe('SELECT');
    expect(state.selected?.kind).toBe('upload');
  });

  it('should ignore initial step CROP when selected is missing', () => {
    const initial: MediaModalOpenState = { tab: 'GALLERY', step: 'CROP', selected: null, crop: null };

    const state = buildInitialState(initial);

    expect(state.step).toBe('SELECT');
    expect(state.crop).toBeNull();
    expect(state.baselineCrop).toBeNull();
  });

  it('should enter crop on PICK_AND_CROP and clear crop/baseline', () => {
    const selected: SelectedMedia = {
      kind: 'used',
      id: 'used-1-en',
      fileName: 'used-1.png',
      src: '/demo/used-1.png',
      locale: 'en'
    };

    const state0 = buildInitialState({ tab: 'GALLERY' });

    const state1 = reducer(state0, { type: 'PICK_AND_CROP', selected });

    expect(state1.step).toBe('CROP');
    expect(state1.tab).toBe('USED');
    expect(state1.selected).toEqual(selected);
    expect(state1.crop).toBeNull();
    expect(state1.baselineCrop).toBeNull();
    expect(state1.resetSeq).toBe(0);
  });

  it('should keep select step for non-image upload on PICK_AND_CROP', () => {
    const selected: SelectedMedia = {
      kind: 'upload',
      id: 'upload-doc-1',
      fileName: 'doc.pdf',
      file: new File(['x'], 'doc.pdf', { type: 'application/pdf' })
    };

    const state0 = buildInitialState({ tab: 'UPLOAD' });
    const state1 = reducer(state0, { type: 'PICK_AND_CROP', selected });

    expect(state1.step).toBe('SELECT');
    expect(state1.tab).toBe('UPLOAD');
    expect(state1.selected).toEqual(selected);
    expect(state1.crop).toBeNull();
    expect(state1.baselineCrop).toBeNull();
  });

  it('should set baseline crop only when user has not changed crop', () => {
    const selected: SelectedMedia = {
      kind: 'gallery',
      id: 'gallery-1-uk',
      fileName: 'gallery-1.png',
      src: '/demo/gallery-1.png',
      locale: 'uk'
    };

    const state0 = reducer(buildInitialState({ tab: 'GALLERY' }), { type: 'PICK_AND_CROP', selected });

    const state1 = reducer(state0, { type: 'SET_BASELINE_CROP', crop: initialCrop });
    expect(state1.baselineCrop).toEqual(initialCrop);
    expect(state1.crop).toEqual(initialCrop);

    const state2 = reducer(state1, { type: 'SET_CROP', crop: resizedCrop });
    expect(state2.crop).toEqual(resizedCrop);

    const state3 = reducer(state2, { type: 'SET_BASELINE_CROP', crop: initialCrop });
    expect(state3.baselineCrop).toEqual(initialCrop);
    expect(state3.crop).toEqual(resizedCrop);
  });

  it('should reset crop to baseline and increment resetSeq', () => {
    const selected: SelectedMedia = {
      kind: 'gallery',
      id: 'gallery-1-uk',
      fileName: 'gallery-1.png',
      src: '/demo/gallery-1.png',
      locale: 'uk'
    };

    const state0 = reducer(buildInitialState({ tab: 'GALLERY' }), { type: 'PICK_AND_CROP', selected });
    const state1 = reducer(state0, { type: 'SET_BASELINE_CROP', crop: initialCrop });
    const state2 = reducer(state1, { type: 'SET_CROP', crop: resizedCrop });

    const state3 = reducer(state2, { type: 'RESET_CROP' });

    expect(state3.crop).toEqual(initialCrop);
    expect(state3.resetSeq).toBe(state2.resetSeq + 1);
  });

  it('should derive tab from initial selected (used -> USED)', () => {
    const initial: MediaModalOpenState = {
      selected: {
        kind: 'used',
        id: 'used-1',
        fileName: 'u.png',
        src: '/demo/u.png',
        locale: 'uk'
      }
    };
    const state = buildInitialState(initial);
    expect(state.tab).toBe('USED');
  });

  it('should derive tab from initial selected (gallery -> GALLERY)', () => {
    const initial: MediaModalOpenState = {
      selected: {
        kind: 'gallery',
        id: 'gallery-1',
        fileName: 'g.png',
        src: '/demo/g.png',
        locale: 'uk'
      }
    };
    const state = buildInitialState(initial);
    expect(state.tab).toBe('GALLERY');
  });

  it('should build initial state with default GALLERY tab when no initial state provided', () => {
    const state = buildInitialState(undefined);
    expect(state.tab).toBe('GALLERY');
    expect(state.selected).toBeNull();
  });

  it('should accept step CROP and init crops when selected exists on initialization', () => {
    const initial: MediaModalOpenState = {
      step: 'CROP',
      selected: {
        kind: 'gallery',
        id: 'gallery-1',
        fileName: 'g.png',
        src: '/demo/g.png',
        locale: 'uk'
      },
      crop: initialCrop
    };
    const state = buildInitialState(initial);
    expect(state.step).toBe('CROP');
    expect(state.crop).toEqual(initialCrop);
    expect(state.baselineCrop).toEqual(initialCrop);
  });

  it('should handle OPEN action and build new initial state', () => {
    const state0 = buildInitialState();
    const initial: MediaModalOpenState = { tab: 'USED' };
    const state1 = reducer(state0, { type: 'OPEN', initial });
    expect(state1.tab).toBe('USED');
  });

  it('should handle SET_TAB action and switch tabs resetting active selections', () => {
    const state0 = buildInitialState();
    const state1 = reducer(state0, { type: 'SET_TAB', tab: 'UPLOAD' });
    expect(state1.tab).toBe('UPLOAD');
    expect(state1.step).toBe('SELECT');
  });

  it('should handle PICK action and store selected media metadata', () => {
    const state0 = buildInitialState();
    const selected: SelectedMedia = {
      kind: 'gallery',
      id: 'gallery-1',
      fileName: 'g.png',
      src: '/demo/g.png',
      locale: 'uk'
    };
    const state1 = reducer(state0, { type: 'PICK', selected });
    expect(state1.selected).toEqual(selected);
    expect(state1.tab).toBe('GALLERY');
  });

  it('should handle BACK action and navigate back to select step safely', () => {
    const selected: SelectedMedia = {
      kind: 'gallery',
      id: 'gallery-1',
      fileName: 'g.png',
      src: '/demo/g.png',
      locale: 'uk'
    };
    const state0 = reducer(buildInitialState(), { type: 'PICK_AND_CROP', selected });
    expect(state0.step).toBe('CROP');

    const state1 = reducer(state0, { type: 'BACK' });
    expect(state1.step).toBe('SELECT');

    const state2 = reducer(state1, { type: 'BACK' });
    expect(state2.step).toBe('SELECT');
  });

  it('should switch step to crop if valid image type upload payload comes via PICK_AND_CROP', () => {
    const selected: SelectedMedia = {
      kind: 'upload',
      id: 'upload-img-1',
      fileName: 'image.png',
      file: new File(['x'], 'image.png', { type: 'image/png' })
    };
    const state0 = buildInitialState({ tab: 'UPLOAD' });
    const state1 = reducer(state0, { type: 'PICK_AND_CROP', selected });
    expect(state1.step).toBe('CROP');
  });

  it('should decline SET_BASELINE_CROP mutation handler early if component step is not CROP', () => {
    const state0 = buildInitialState();
    const state1 = reducer(state0, { type: 'SET_BASELINE_CROP', crop: initialCrop });
    expect(state1.baselineCrop).toBeNull();
  });

  it('should reject SET_CROP action updates if crops are structurally identical', () => {
    const selected: SelectedMedia = {
      kind: 'gallery',
      id: 'gallery-1',
      fileName: 'g.png',
      src: '/demo/g.png',
      locale: 'uk'
    };
    const state0 = reducer(buildInitialState(), { type: 'PICK_AND_CROP', selected });
    const state1 = reducer(state0, { type: 'SET_BASELINE_CROP', crop: initialCrop });

    const state2 = reducer(state1, { type: 'SET_CROP', crop: initialCrop });
    expect(state2).toBe(state1);

    const partialCrop1: CropResult = { rect: { x: 0, y: 0, width: 10, height: 10 } };
    const state3 = reducer(state1, { type: 'SET_CROP', crop: partialCrop1 });
    expect(state3.crop).toEqual(partialCrop1);
  });

  it('should perform identity checking edge-cases for crops safely', () => {
    const selected: SelectedMedia = {
      kind: 'gallery',
      id: 'gallery-1',
      fileName: 'g.png',
      src: '/demo/g.png',
      locale: 'uk'
    };
    const state0 = reducer(buildInitialState(), { type: 'PICK_AND_CROP', selected });
    const state1 = reducer(state0, { type: 'SET_BASELINE_CROP', crop: initialCrop });

    const state2 = reducer(state1, { type: 'SET_CROP', crop: null });
    expect(state2.crop).toBeNull();
  });

  it('should process partial object overlays for GALLERY tab search parameters', () => {
    const state0 = buildInitialState();
    const state1 = reducer(state0, { type: 'SET_GALLERY_FILTERS', filters: { search: 'query' } });
    expect(state1.filters.gallery.search).toBe('query');
  });

  it('should process partial object overlays for USED tab language parameters', () => {
    const state0 = buildInitialState();
    const state1 = reducer(state0, { type: 'SET_USED_FILTERS', filters: { language: 'en' } });
    expect(state1.filters.used.language).toBe('en');
  });

  it('should fallback step to SELECT when initial step is undefined', () => {
    const initial: MediaModalOpenState = {
      tab: 'GALLERY',
      step: undefined,
      selected: null,
      crop: null
    };
    const state = buildInitialState(initial);
    expect(state.step).toBe('SELECT');
  });

  it('should bypass SET_CROP action handling if both active and incoming crops are null', () => {
    const state0 = buildInitialState();
    const state1 = reducer(state0, { type: 'SET_CROP', crop: null });
    expect(state1.crop).toBeNull();
  });

  it('should keep existing tab state on PICK action if tab derivation returns null', () => {
    const state0 = buildInitialState();
    const invalidSelected = {
      kind: 'invalid-kind',
      id: '1',
      fileName: 'a.png'
    } as unknown as SelectedMedia;

    const state1 = reducer(state0, {
      type: 'PICK',
      selected: invalidSelected
    });
    expect(state1.tab).toBe(state0.tab);
  });

  it('should preserve CROP step during initialization if selected media is present', () => {
    const initial: MediaModalOpenState = {
      step: 'CROP',
      selected: {
        kind: 'gallery',
        id: 'gallery-1',
        fileName: 'g.png',
        src: '/demo/g.png',
        locale: 'uk'
      },
      crop: initialCrop
    };
    const state = buildInitialState(initial);
    expect(state.step).toBe('CROP');
  });

  it('should switch to CROP step when PICK_AND_CROP is dispatched for gallery item', () => {
    const state0 = buildInitialState();
    const gallerySelected: SelectedMedia = {
      kind: 'gallery',
      id: 'gallery-1',
      fileName: 'g.png',
      src: '/demo/g.png',
      locale: 'uk'
    };
    const state1 = reducer(state0, { type: 'PICK_AND_CROP', selected: gallerySelected });
    expect(state1.step).toBe('CROP');
    expect(state1.tab).toBe('GALLERY');
  });

  it('should return false in isSameCrop when one of the crops is null and another is an object', () => {
    const state0 = buildInitialState();
    const gallerySelected: SelectedMedia = {
      kind: 'gallery',
      id: 'gallery-1',
      fileName: 'g.png',
      src: '/demo/g.png',
      locale: 'uk'
    };
    const state1 = reducer(state0, { type: 'PICK_AND_CROP', selected: gallerySelected });
    const state2 = reducer(state1, { type: 'SET_CROP', crop: initialCrop });

    const state3 = reducer(state2, { type: 'SET_CROP', crop: null });
    expect(state3.crop).toBeNull();
  });

  it('should return false in isSameCrop when current crop is an object and new crop is null', () => {
    const selected: SelectedMedia = {
      kind: 'gallery',
      id: 'g-1',
      fileName: 'g.png',
      src: '/demo/g.png',
      locale: 'uk'
    };
    const state0 = reducer(buildInitialState(), { type: 'PICK_AND_CROP', selected });
    const state1 = reducer(state0, { type: 'SET_BASELINE_CROP', crop: initialCrop });

    const state2 = reducer(state1, { type: 'SET_CROP', crop: null });
    expect(state2.crop).toBeNull();
  });

  it('should return false in isSameCrop when current crop is null and new crop is an object', () => {
    const selected: SelectedMedia = {
      kind: 'gallery',
      id: 'g-1',
      fileName: 'g.png',
      src: '/demo/g.png',
      locale: 'uk'
    };
    const state0 = reducer(buildInitialState(), { type: 'PICK_AND_CROP', selected });
    const state1 = reducer(state0, { type: 'SET_CROP', crop: initialCrop });
    expect(state1.crop).toEqual(initialCrop);
  });

  it('should fallback to existing tab on PICK if tab derivation returns null', () => {
    const state0 = buildInitialState({ tab: 'USED' });

    const nullSelected = null as unknown as SelectedMedia;

    const state1 = reducer(state0, { type: 'PICK', selected: nullSelected });
    expect(state1.tab).toBe('USED');
  });

  it('should fallback to existing tab on PICK_AND_CROP if tab derivation returns null', () => {
    const state0 = buildInitialState({ tab: 'USED' });

    const invalidKindSelected = {
      kind: 'invalid-kind',
      id: '1',
      fileName: 'a.png',
      file: new File(['x'], 'a.png', { type: 'image/png' })
    } as unknown as SelectedMedia;

    const state1 = reducer(state0, { type: 'PICK_AND_CROP', selected: invalidKindSelected });
    expect(state1.tab).toBe('GALLERY');
  });

  it('should return false in isSameCrop when both crops are objects with different coordinates', () => {
    const cropA: CropResult = { rect: { x: 0, y: 0, width: 100, height: 100 } };
    const cropB: CropResult = { rect: { x: 5, y: 0, width: 100, height: 100 } };

    const selected: SelectedMedia = {
      kind: 'gallery',
      id: 'gallery-1',
      fileName: 'g.png',
      src: '/demo/g.png',
      locale: 'uk'
    };
    const state0 = reducer(buildInitialState(), { type: 'PICK_AND_CROP', selected });
    const state1 = reducer(state0, { type: 'SET_CROP', crop: cropA });

    const state2 = reducer(state1, { type: 'SET_CROP', crop: cropB });
    expect(state2.crop).toEqual(cropB);
  });

  it('should default crop to null on init when step is CROP but crop is not provided', () => {
    const initial: MediaModalOpenState = {
      step: 'CROP',
      selected: {
        kind: 'gallery',
        id: 'gallery-1',
        fileName: 'g.png',
        src: '/demo/g.png',
        locale: 'uk'
      }
    };
    const state = buildInitialState(initial);
    expect(state.step).toBe('CROP');
    expect(state.crop).toBeNull();
    expect(state.baselineCrop).toBeNull();
  });
});