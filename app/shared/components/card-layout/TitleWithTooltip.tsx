'use client';
import { Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import styles from './TitleWithTooltip.style';
import TooltipCustom from '~/ds-components/tooltip/Tooltip';

interface TitleWithTooltipProps {
  text: string;
  lineClamp?: number;
  fontWeight?: number;
}

const TitleWithTooltip = ({ text, lineClamp, fontWeight }: TitleWithTooltipProps) => {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const [isTitleTruncated, setIsTitleTruncated] = useState(false);

  useEffect(() => {
    const element = titleRef.current;
    if (!element) return;

    const checkOverflow = () => {
      const hasOverflow = element.scrollHeight > element.clientHeight;
      setIsTitleTruncated((prev) => (prev === hasOverflow ? prev : hasOverflow));
    };

    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(element);
    checkOverflow();

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <TooltipCustom title={isTitleTruncated ? text : ''}>
      <Typography ref={titleRef} variant="subtitle1" component="h3" sx={styles.title(lineClamp, fontWeight)}>
        {text}
      </Typography>
    </TooltipCustom>
  );
};

export default TitleWithTooltip;
