import { MissionImage, MissionPoint } from '~/shared/components/about-us/our-mission/OurMission';

export interface MissionBlock {
  title: string;
  missionPoints: MissionPoint[];
  imageBlocks: MissionImage[];
}
