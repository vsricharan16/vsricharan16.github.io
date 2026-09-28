export interface Course {
  title: string;
  number: string;
  link: string;
  university: string;
}

const UCI = 'UC Irvine';
const IITH = 'IIT Hyderabad';
const UCI_CATALOG = 'https://catalogue.uci.edu/allcourses/compsci/';
const IITH_CSE = 'https://cse.iith.ac.in/';

const courses: Course[] = [
  {
    title: 'Parallel and Distributed Computing',
    number: 'COMPSCI 231P',
    link: UCI_CATALOG,
    university: UCI,
  },
  {
    title: 'Computer Systems Architecture',
    number: 'COMPSCI 250P',
    link: UCI_CATALOG,
    university: UCI,
  },
  {
    title: 'Operating Systems',
    number: 'CS3510',
    link: IITH_CSE,
    university: IITH,
  },
  {
    title: 'Computer Networks',
    number: 'CS3530',
    link: IITH_CSE,
    university: IITH,
  },
  {
    title: 'Data Center Networking',
    number: 'CS5560',
    link: IITH_CSE,
    university: IITH,
  },
  {
    title: 'Databases',
    number: 'COMPSCI 220P',
    link: UCI_CATALOG,
    university: UCI,
  },
  {
    title: 'Computer Security',
    number: 'COMPSCI 201P',
    link: UCI_CATALOG,
    university: UCI,
  },
  {
    title: 'Artificial Intelligence',
    number: 'COMPSCI 271P',
    link: UCI_CATALOG,
    university: UCI,
  },
  {
    title: 'Machine Learning',
    number: 'COMPSCI 273P',
    link: UCI_CATALOG,
    university: UCI,
  },
  {
    title: 'Data Mining',
    number: 'CS6670',
    link: IITH_CSE,
    university: IITH,
  },
  {
    title: 'Deep Learning for Vision',
    number: 'CS5370',
    link: IITH_CSE,
    university: IITH,
  },
];

export default courses;
