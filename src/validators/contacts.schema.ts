import { z } from 'zod';

import { contactsValidationErrors } from '~/back-constants/errors';
import {
  SOCIAL_NETWORK_PLATFORMS,
  SocialNetworkIcon
} from '~/domain/entities/Contacts';

const localizedTextSchema = z.string().trim().max(150, contactsValidationErrors.LOCALIZED_FIELD_TOO_LONG);

const localizedStringSchema = z.object({
  uk: localizedTextSchema,
  en: localizedTextSchema
});

const emailSchema = z.string().trim().refine(
  (value) => value === '' || z.email().safeParse(value).success,
  contactsValidationErrors.EMAIL_INVALID
);

const phoneSchema = z.string().trim().refine(
  (value) => value === '' || /^\+380\d{9}$/.test(value),
  contactsValidationErrors.PHONE_INVALID
);

const socialNetworkIconSchema = z.enum(
  SOCIAL_NETWORK_PLATFORMS.map(({ icon }) => icon) as [SocialNetworkIcon, ...SocialNetworkIcon[]],
  { error: contactsValidationErrors.PLATFORM_INVALID }
);

export const zContactsSchema = z.object({
  contactInformation: z.object({
    foundationName: localizedStringSchema,
    address: localizedStringSchema,
    email: emailSchema,
    phone: phoneSchema
  }),
  socialNetworks: z.array(
    z.object({
      icon: socialNetworkIconSchema,
      link: z.string().trim().pipe(z.url({ error: contactsValidationErrors.LINK_INVALID }))
    })
  )
});
