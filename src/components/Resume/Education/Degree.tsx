import type { Degree as DegreeType } from '@/data/resume/degrees';
import { newTabProps } from '@/lib/links';

interface DegreeProps {
  data: DegreeType;
}

export default function Degree({ data }: DegreeProps) {
  return (
    <article className="degree-container">
      <header className="degree-header">
        {data.logo ? (
          // biome-ignore lint/performance/noImgElement: Static export; avoid next/image runtime for a small mark.
          <img
            src={data.logo}
            alt=""
            width={48}
            height={48}
            className="degree-logo"
          />
        ) : null}
        <div className="degree-text">
          <h3 className="school">
            <a href={data.link} {...newTabProps(data.link)}>
              {data.school}
            </a>
          </h3>
          <p className="degree">{data.degree}</p>
          {data.minor ? <p className="degree-minor">{data.minor}</p> : null}
        </div>
      </header>
    </article>
  );
}
