export interface Degree {
  school: string;
  degree: string;
  /** Optional secondary qualification shown on its own line below the degree. */
  minor?: string;
  /** Optional institution mark shown to the left, mirroring Experience logos. */
  logo?: string;
  link: string;
  year: number;
}

const degrees: Degree[] = [
  {
    school: 'University of California, Irvine',
    degree: 'Master of Computer Science',
    logo: '/images/companies/uci.png',
    link: 'https://www.uci.edu',
    year: 2022,
  },
  {
    school: 'Indian Institute of Technology, Hyderabad',
    degree: 'Bachelor of Technology in Computer Science & Engineering',
    minor: 'Minor in Design',
    logo: '/images/companies/iith.png',
    link: 'https://www.iith.ac.in',
    year: 2020,
  },
];

export default degrees;
