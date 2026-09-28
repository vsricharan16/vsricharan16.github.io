/**
 * Conforms to https://jsonresume.org/schema/
 */
export interface Position {
  name: string;
  position: string;
  url: string;
  startDate: string;
  endDate?: string;
  summary?: string;
  highlights?: string[];
  logo?: string;
}

const work: Position[] = [
  {
    name: 'Nutanix',
    position: 'Member of Technical Staff, Core Data Path',
    url: 'https://www.nutanix.com',
    logo: '/images/companies/nutanix.svg',
    startDate: '2024-02-01',
    summary: `Building petabyte-scale storage control planes and data-path infrastructure in C++, gRPC, and high-concurrency systems that serve millions of clients with low latency.`,
    highlights: [
      'Engineered core distributed MapReduce control plane services, orchestrating storage workflows including deduplication, replication, and garbage collection across dense multi-node clusters.',
      'Led a team of 4 engineers through the end-to-end design and cross-functional delivery of an array-agnostic storage lifecycle workflow for external enterprise arrays (Pure, Dell).',
      'Set the technical direction to stabilize the disaggregated storage stack by resolving critical outages in customer and test environments, incorporating dynamic thresholds to achieve steady state 10x faster.',
      'Restored critical erasure-coding savings on dense clusters by introducing priority-aware, selective metadata scans, eliminating arbitrary task cancellations that caused an 85% task drop rate.',
      'Built a highly resilient storage monitoring service leveraging async requests, caching, and batched API calls, aggregating telemetry data across infrastructure levels to provide accurate reporting and dynamic capacity alerts.',
      'Cut cluster volume bring-up latency by 65% by architecting a fault-tolerant state machine with bounded retry mechanisms to automate provisioning, monitoring, and auto-growth.',
    ],
  },
  {
    name: 'Amazon',
    position: 'Software Dev Engineer',
    url: 'https://www.amazon.com',
    logo: '/images/companies/amazon.png',
    startDate: '2023-09-01',
    endDate: '2024-02-01',
    summary: `Designed a serverless data visualization platform on AWS to streamline KPI analysis for audio algorithms across device revisions.`,
    highlights: [
      'Designed a serverless data visualization platform on AWS (Lambda, Step Functions, Redshift, S3) to streamline KPI analysis for audio algorithms across device revisions for 30+ engineers.',
      'Replaced a 5-hour manual workflow with an automated live dashboard, saving 90+ engineering hours monthly and cutting data analysis time by 60%.',
    ],
  },
  {
    name: 'Nutanix',
    position: 'Member of Technical Staff, Core Data Path',
    url: 'https://www.nutanix.com',
    logo: '/images/companies/nutanix.svg',
    startDate: '2023-03-01',
    endDate: '2023-09-01',
    summary: `First stint on the core data-path team, building distributed storage control-plane services.`,
  },
  {
    name: 'Amazon',
    position: 'Software Dev Engineer Intern',
    url: 'https://www.amazon.com',
    logo: '/images/companies/amazon.png',
    startDate: '2022-06-01',
    endDate: '2022-09-01',
    highlights: [
      'Built a lightweight ML model for skin tone detection supporting Camera 3A algorithms (AE, AWB, AF).',
    ],
  },
  {
    name: 'Sprinklr',
    position: 'Software Engineer, Modern Research',
    url: 'https://www.sprinklr.com',
    logo: '/images/companies/sprinklr.png',
    startDate: '2020-08-01',
    endDate: '2021-09-01',
    summary: `Built alerting and autoscaling for high-volume customer-experience infrastructure.`,
    highlights: [
      'Designed and implemented an automated Alert Manager detecting message volume anomalies, broadcasting ~4,000 tailored insights daily and cutting manual monitoring by 90%.',
      'Developed CRON jobs to ingest data from two new media sources (Podcast and Classifieds) into Sprinklr’s distributed databases, reducing latency by 3 minutes.',
      'Implemented a Research Adoption metrics service pipeline with 99.9% uptime to identify features that drive revenue.',
      'Owned end-to-end development and re-architecture of alert dashboards, reducing support call volume by 80%.',
      'Developed an autoscaling mechanism for Alert Manager services, reducing annual infrastructure cost by $135K.',
    ],
  },
  {
    name: 'Samsung R&D Bangalore',
    position: 'Software Developer Intern, Networks',
    url: 'https://research.samsung.com',
    logo: '/images/companies/samsung.svg',
    startDate: '2019-05-01',
    endDate: '2019-07-01',
    summary: `Built a dockerized simulator for 4G and 5G radio-unit testing.`,
    highlights: [
      'Designed and implemented a generic simulator in a dockerized environment for testing communication between the Data Unit (DU) and the Radio Unit (RRH) for Samsung 4G and 5G networking devices.',
      'The prototype had more than 92% test coverage.',
    ],
  },
  {
    name: 'IIT Hyderabad',
    position: 'Research Intern, Software Defined Networks',
    url: 'https://www.iith.ac.in',
    logo: '/images/companies/iith.png',
    startDate: '2017-07-01',
    endDate: '2018-05-01',
    summary: `Studied routing and utilization in software-defined networks.`,
    highlights: [
      'Simulated test-bed environments using VyOS to study routing protocols.',
      'Developed a network monitoring tool to predict network utilization in a software-defined network, with 86% accuracy across topologies.',
    ],
  },
];

export default work;
