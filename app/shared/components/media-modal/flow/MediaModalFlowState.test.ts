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

    // user already changed crop -> baseline must NOT be overwritten
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
});
