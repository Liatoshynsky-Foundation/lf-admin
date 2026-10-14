import {
  createEmptyLocalizedProse,
  isEmptyTeamMember,
  normalizeProseValue,
  prepareTeamMembersForSave
} from './foundationTeamMembers';
import { textToProse } from '~/lib/utils/prose';

describe('foundationTeamMembers', () => {
  const emptyMember = {
    id: 'empty',
    name: createEmptyLocalizedProse(),
    description: createEmptyLocalizedProse(),
    photo: { src: '', generatedSrc: '', alt: createEmptyLocalizedProse() }
  };

  it('createEmptyLocalizedProse returns independent locale docs', () => {
    const localized = createEmptyLocalizedProse();
    expect(localized.uk).toEqual(textToProse(''));
    expect(localized.en).toEqual(textToProse(''));
    expect(localized.uk).not.toBe(localized.en);
  });

  it('normalizeProseValue turns broken objects into empty prose docs', () => {
    expect(normalizeProseValue({})).toEqual(textToProse(''));
    expect(normalizeProseValue({ type: 'doc' })).toEqual(textToProse(''));
    expect(normalizeProseValue('Hello')).toEqual(textToProse('Hello'));
  });

  it('isEmptyTeamMember is true only without image and without text fields', () => {
    expect(isEmptyTeamMember(emptyMember)).toBe(true);
    expect(
      isEmptyTeamMember({
        ...emptyMember,
        name: { uk: textToProse('Name'), en: textToProse('') }
      })
    ).toBe(false);
    expect(
      isEmptyTeamMember({
        ...emptyMember,
        photo: { ...emptyMember.photo, src: 'https://example.com/a.png' }
      })
    ).toBe(false);
  });

  it('prepareTeamMembersForSave drops ghosts and normalizes remaining members', () => {
    const brokenMember = {
      id: 'broken',
      name: { uk: textToProse('OK'), en: {} as never },
      description: { uk: {}, en: {} } as never,
      photo: {
        src: 'https://example.com/a.png',
        generatedSrc: '',
        alt: { uk: {}, en: textToProse('Alt') } as never
      }
    };

    const result = prepareTeamMembersForSave([emptyMember, brokenMember]);

    expect(result.removedEmptyCount).toBe(1);
    expect(result.members).toHaveLength(1);
    expect(result.members[0].name.en).toEqual(textToProse(''));
    expect(result.members[0].description.uk).toEqual(textToProse(''));
    expect(result.members[0].photo.alt.uk).toEqual(textToProse(''));
    expect(result.members[0].photo.alt.en).toEqual(textToProse('Alt'));
  });
});
