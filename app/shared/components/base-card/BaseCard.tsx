'use client';
import { Typography } from '@mui/material';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import Button from '../design-system/button/Button';
import styles from './BaseCard.styles';
import CardLayout from './CardLayout';
import ImageWithFallback from './ImageWithFallback';
import TooltipCustom from '~/ds-components/tooltip/Tooltip';

const FALLBACK_IMAGE_SRC = '/images/image.png';

interface BaseCardImage {
  src: string;
  alt: {
    uk: string;
    en: string;
  };
}

interface BaseCardActionButton {
  text: string;
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

interface BaseCardProps {
  coverImage: BaseCardImage;
  altText: string;
  titleText: string;
  infoText?: string;
  actionButton: BaseCardActionButton;
  badge?: React.ReactNode;
  renderMenu: (
    anchorEl: HTMLElement | null,
    handleClose: () => void,
    oppositeDirection: 'left' | 'right'
  ) => React.ReactNode;
}

const BaseCard = ({ coverImage, altText, titleText, infoText, actionButton, badge, renderMenu }: BaseCardProps) => {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [isTitleTruncated, setIsTitleTruncated] = useState(false);

  useEffect(() => {
    const element = titleRef.current;
    if (!element) return;
    setIsTitleTruncated(element.scrollHeight > element.clientHeight);
  }, [titleText]);

  const coverImageNode = (
    <ImageWithFallback key={coverImage.src} src={coverImage.src} fallbackSrc={FALLBACK_IMAGE_SRC} alt={altText} />
  );

  const titleNode = (
    <TooltipCustom title={isTitleTruncated ? titleText : ''}>
      <Typography ref={titleRef} variant="subtitle1" component="h3" sx={styles.title}>
        {titleText}
      </Typography>
    </TooltipCustom>
  );

  const info = (
    <Typography variant="caption" sx={styles.date}>
      {infoText}
    </Typography>
  );

  const actionButtonNode = (
    <Button
      variant="filled"
      color="primary"
      href={actionButton.href}
      LinkComponent={actionButton.href ? Link : undefined}
      onClick={actionButton.href ? undefined : actionButton.onClick}
    >
      {actionButton.text}
    </Button>
  );
  return (
    <CardLayout
      coverImage={coverImageNode}
      title={titleNode}
      contentUpper={badge}
      info={info}
      contentBottom={actionButtonNode}
      renderMenu={renderMenu}
    />
  );
};

export default BaseCard;
