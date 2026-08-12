export interface VolunteerDonationBlock {
  hidden: boolean | undefined;
  title: Record<'uk' | 'en', string>;
  imageSrc: string;
  caption: Record<'uk' | 'en', string>;
  paymentMethods: Array<{
    label: Record<'uk' | 'en', string>;
    value: string;
  }>;
}