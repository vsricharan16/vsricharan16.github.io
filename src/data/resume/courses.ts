export interface Course {
  title: string;
  number: string;
  university: string;
}

const UCI = 'UC Irvine';
const IITH = 'IIT Hyderabad';

const courses: Course[] = [
  {
    title: 'Parallel and Distributed Computing',
    number: 'COMPSCI 231P',
    university: UCI,
  },
  {
    title: 'Computer Systems Architecture',
    number: 'COMPSCI 250P',
    university: UCI,
  },
  {
    title: 'Compilers',
    number: 'CS3400',
    university: IITH,
  },
  {
    title: 'Operating Systems',
    number: 'CS3510',
    university: IITH,
  },
  {
    title: 'Computer Networks',
    number: 'CS3530',
    university: IITH,
  },
  {
    title: 'Data Center Networking',
    number: 'CS5560',
    university: IITH,
  },
  {
    title: 'Databases',
    number: 'COMPSCI 220P',
    university: UCI,
  },
  {
    title: 'Computer Security',
    number: 'COMPSCI 201P',
    university: UCI,
  },
  {
    title: 'Artificial Intelligence',
    number: 'COMPSCI 271P',
    university: UCI,
  },
  {
    title: 'Machine Learning',
    number: 'COMPSCI 273P',
    university: UCI,
  },
  {
    title: 'Data Mining',
    number: 'CS6670',
    university: IITH,
  },
  {
    title: 'Deep Learning',
    number: 'CS5370',
    university: IITH,
  },
];

export default courses;
