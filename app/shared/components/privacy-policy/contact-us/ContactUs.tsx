import { EditParagraphsBlock } from '../components/edit-paragraphs-block/EditParagraphsBlock';
import { BLOCK_IDS } from '~/constants/pageBlocks';

export const ContactUs = () => {
  const blockId = BLOCK_IDS.CONTACT_US;
  const title = 'Як зв’язатися з нами';

  return <EditParagraphsBlock blockId={blockId} title={title} />;
};