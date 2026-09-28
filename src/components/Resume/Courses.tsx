import type { Course as CourseType } from '@/data/resume/courses';

import Course from './Courses/Course';

interface CoursesProps {
  data: CourseType[];
}

function getRows(courses: CourseType[]) {
  return courses.map((course) => (
    <Course data={course} key={`${course.university}-${course.number}`} />
  ));
}

export default function Courses({ data }: CoursesProps) {
  return (
    <div className="courses">
      <div className="title">
        <h2>Selected Courses</h2>
      </div>
      <ul className="course-list">{getRows(data)}</ul>
    </div>
  );
}
