import { z } from 'zod';

import { contactsValidationErrors } from '~/back-constants/errors';
import {
  SOCIAL_NETWORK_PLATFORMS,
  SocialNetworkIcon
} from '~/domain/entities/Contacts';

const localizedStringSchema = z.object({
  uk: z.string().trim().min(1, contactsValidationErrors.LOCALIZED_FIELD_REQUIRED),
  en: z.string().trim().min(1, contactsValidationErrors.LOCALIZED_FIELD_REQUIRED)
});

const socialNetworkIconSchema = z.enum(
  SOCIAL_NETWORK_PLATFORMS.map(({ icon }) => icon) as [SocialNetworkIcon, ...SocialNetworkIcon[]],
  { error: contactsValidationErrors.PLATFORM_INVALID }
);

export const zContactsSchema = z.object({
  contactInformation: z.object({
    foundationName: localizedStringSchema,
    address: localizedStringSchema,
    email: z.string().trim().pipe(z.email({ error: contactsValidationErrors.EMAIL_INVALID })),
    phone: z.string().regex(/^\+38 \d{3} \d{3} \d{4}$/, contactsValidationErrors.PHONE_INVALID)
  }),
  socialNetworks: z.array(
    z.object({
      icon: socialNetworkIconSchema,
      link: z.string().trim().pipe(z.url({ error: contactsValidationErrors.LINK_INVALID }))
    })
  )
});
