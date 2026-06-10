
import { createStandardMockBlock, runCommonBlockTests } from '../test-utils/block-test-factory';
import { ContactUs } from './ContactUs';

describe('ContactUs', () => {
  runCommonBlockTests({
    Component: ContactUs,
    mockBlock: createStandardMockBlock().block,
    checkParagraph: true,
  });
});

