'use client';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Pagination,
  Stack,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { type SyntheticEvent, useEffect, useState } from 'react';

import type { LogEntry, LogLevel, LogsResponse } from '~/back-shared/types/logs';

const LEVEL_OPTIONS: Array<{ value: LogLevel | 'all'; label: string }> = [
  { value: 'all', label: 'Усі' },
  { value: 'error', label: 'Error' },
  { value: 'warn', label: 'Warn' },
  { value: 'info', label: 'Info' },
  { value: 'debug', label: 'Debug' }
];

const LEVEL_COLORS: Record<LogLevel, 'error' | 'warning' | 'info' | 'default'> = {
  error: 'error',
  warn: 'warning',
  info: 'info',
  debug: 'default'
};

const LEVEL_ACCENTS: Record<LogLevel, { border: string; background: string }> = {
  error: {
    border: 'rgba(211, 47, 47, 0.28)',
    background: 'rgba(211, 47, 47, 0.05)'
  },
  warn: {
    border: 'rgba(237, 108, 2, 0.28)',
    background: 'rgba(237, 108, 2, 0.05)'
  },
  info: {
    border: 'rgba(2, 136, 209, 0.28)',
    background: 'rgba(2, 136, 209, 0.05)'
  },
  debug: {
    border: 'rgba(97, 97, 97, 0.28)',
    background: 'rgba(97, 97, 97, 0.05)'
  }
};

const formatTimestamp = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('uk-UA');
};

const JsonBlock = ({ value }: { value?: Record<string, unknown> }) => {
  if (!value || Object.keys(value).length === 0) return null;

  return (
    <Typography component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13 }}>
      {JSON.stringify(value, null, 2)}
    </Typography>
  );
};

const LogItem = ({ item }: { item: LogEntry }) => {
  const hasStatusCode = typeof item.meta.statusCode === 'number';
  const hasDetails = Boolean(item.meta.method || item.meta.url || hasStatusCode || item.meta.stack || item.meta.metadata || item.meta.raw);
  const noDetails = !hasDetails;
  const accent = LEVEL_ACCENTS[item.level];

  return (
    <Accordion
      disableGutters
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: `1px solid ${accent.border}`,
        backgroundColor: accent.background,
        '&:before': { display: 'none' }
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} width="100%" alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Chip label={item.level.toUpperCase()} color={LEVEL_COLORS[item.level]} size="small" />
          <Typography sx={{ flexGrow: 1, fontWeight: 700 }}>{item.message}</Typography>
          <Typography variant="body2" color="text.secondary">
            {formatTimestamp(item.timestamp)}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pb: 2 }}>
        <Stack spacing={1}>
          {item.meta.method ? (
            <Typography variant="body2">
              <strong>Method:</strong> {item.meta.method}
            </Typography>
          ) : null}
          {item.meta.url ? (
            <Typography variant="body2">
              <strong>URL:</strong> {item.meta.url}
            </Typography>
          ) : null}
          {hasStatusCode ? (
            <Typography variant="body2">
              <strong>Status:</strong> {item.meta.statusCode}
            </Typography>
          ) : null}
          {item.meta.stack ? (
            <Typography component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13 }}>
              {item.meta.stack}
            </Typography>
          ) : null}
          <JsonBlock value={item.meta.metadata} />
          <JsonBlock value={item.meta.raw} />
          {noDetails ? (
            <Typography variant="body2" color="text.secondary">
              Немає додаткових деталей.
            </Typography>
          ) : null}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

const LogsPageClient = () => {
  const [level, setLevel] = useState<LogLevel | 'all'>('all');
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadLogs = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({ page: String(page), limit: '20' });
        if (level !== 'all') params.set('level', level);

        const response = await fetch(`/api/logs?${params.toString()}`, {
          signal: controller.signal,
          credentials: 'include'
        });
        const payload = (await response.json()) as LogsResponse;

        setItems(payload.items);
        setTotal(payload.pagination.total);
      } catch {
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
    return () => controller.abort();
  }, [level, page]);

  const totalPages = Math.max(1, Math.ceil(total / 20));
  const hasItems = items.length > 0;
  const noItems = items.length === 0;

  const onLevelChange = (_event: SyntheticEvent, value: LogLevel | 'all') => {
    setLevel(value);
    setPage(1);
  };

  let content: React.ReactNode;
  if (loading) {
    content = (
      <Typography variant="body2" color="text.secondary">
        Завантаження...
      </Typography>
    );
  } else if (noItems) {
    content = (
      <Typography variant="body2" color="text.secondary">
        Логи не знайдено.
      </Typography>
    );
  } else {
    content = (
      <Stack spacing={1.5}>
        {items.map((item) => (
          <LogItem key={item.id} item={item} />
        ))}
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.5}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Logs
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Логи з MongoDB. Деталі відкриваються по кліку на запис.
        </Typography>
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={level} onChange={onLevelChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile>
          {LEVEL_OPTIONS.map((option) => (
            <Tab key={option.value} value={option.value} label={option.label} />
          ))}
        </Tabs>
      </Box>

      <Typography variant="body2" color="text.secondary">
        {total} записів
      </Typography>

      {content}

      {hasItems && totalPages > 1 ? <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} /> : null}
    </Stack>
  );
};

export default LogsPageClient;
