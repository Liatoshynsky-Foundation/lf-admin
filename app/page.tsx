import React from 'react';

import { ContributorCard } from './shared/components/contributor-card/ContributorCard';
export default function Home() {
  return (
    <>
      <h1>Liatoshynsky project</h1>
      <ContributorCard contributorNameValue={''} contributorDescriptionValue={''} />
    </>
  );
}
