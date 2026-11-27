import mongoose from 'mongoose';

import { FoundationInfo } from './foundationInfoBase';
import { translatedFieldUnrequiredSchema } from '~/infrastructure/models/commonSchemas';

export const BrandingInfo =
  FoundationInfo.discriminators?.['branding-info'] ??
  FoundationInfo.discriminator(
    'branding-info',
    new mongoose.Schema(
      {
        foundationName: translatedFieldUnrequiredSchema,
        supportButtonLink: { type: String, required: true }
      },
      { _id: false, timestamps: true }
    )
  );
