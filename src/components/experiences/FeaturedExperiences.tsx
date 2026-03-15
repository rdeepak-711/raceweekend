'use client';

import ExperienceCard from './ExperienceCard';
import type { Experience } from '@/types/experience';

interface Props {
  experiences: Experience[];
  raceSlug: string;
  series: string;
}

export default function FeaturedExperiences({ experiences, raceSlug, series }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {experiences.map((exp, i) => (
        <ExperienceCard
          key={exp.id}
          experience={exp}
          onBook={() => window.open(exp.affiliateUrl, '_blank')}
          index={i}
          detailHref={`/${series}/${raceSlug}/experiences/${exp.slug}`}
        />
      ))}
    </div>
  );
}
