import React from 'react';

import MediaMentionsTest from './MediaMentionsTest.client';

export default function Legacy() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Legacy</h2>
      <p>This page includes a manual test harness for Media Mentions hooks.</p>
      <MediaMentionsTest />
    </div>
  );
}
