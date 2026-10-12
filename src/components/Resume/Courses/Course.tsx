import type { Course as CourseType } from '@/data/resume/courses';

interface CourseProps {
  data: CourseType;
}

export default function Course({ data }: CourseProps) {
  return (
    <li className="course-container">
      <span className="course-name">{data.title}</span>
    </li>
  );
}
