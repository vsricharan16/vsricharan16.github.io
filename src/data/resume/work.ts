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
    url: 'https://www.nutanix.com/products/nutanix-cloud-infrastructure/compute',
    logo: '/images/companies/nutanix.svg',
    startDate: '2024-02-01',
    summary: `Working on Curator, the MapReduce control plane for storage, now extended to run across disaggregated third-party arrays.`,
    highlights: [
      'Engineered core distributed MapReduce control plane services, orchestrating storage workflows including deduplication, garbage collection, and collapsing long snapshot chains across dense multi-node clusters.',
      'Worked with a team of 4 engineers through end-to-end design and cross-functional delivery of disaggregated storage, integrating Nutanix AOS with external enterprise arrays (Pure, Dell, NetApp).',
      'Redesigned the garbage-collection scan scheduler to prevent starvation of low-priority background tasks, isolating heavy jobs into dedicated queues with their own scheduling rules.',
      'Designed a vendor-agnostic lifecycle engine for managing virtual disks in Nutanix, safely attaching, detaching, and deleting volumes on external arrays without leaking storage or corrupting active snapshots. Built the engine on crash-consistent idempotent operations, bottom-up traversal of snapshot-dependency DAGs, batched vendor API calls, and bounded retries.',
      'Overhauled resource management for the disaggregated stack, building the observability and telemetry pipeline that polls vendor APIs for usage statistics. Aggregated stats across the virtual disk, VM, container, storage-pool, and cluster hierarchy into a Cassandra time-series store, and raised alerts when capacity thresholds were exceeded.',
    ],
  },
  {
    name: 'Amazon',
    position: 'Software Dev Engineer, Audio Team',
    url: 'https://www.amazon.jobs/content/en/teams/devices-and-services/lab126',
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
    url: 'https://www.nutanix.com/products/nutanix-cloud-infrastructure/compute',
    logo: '/images/companies/nutanix.svg',
    startDate: '2023-03-01',
    endDate: '2023-09-01',
    summary: `Extended Curator to support Nutanix’s Nike metadata backend.`,
    highlights: [
      'Contributed to Project Nike’s storage-metadata integration, enabling backend-aware metadata scans as Nutanix transitioned primary metadata from Cassandra to RocksDB-backed metadata on replicated virtual disks.',
      'Improved Project Nike’s reliability and observability by expanding unit-test coverage, adding backend-specific audit scans, and introducing per-backend performance telemetry.',
    ],
  },
  {
    name: 'Amazon',
    position: 'Software Dev Engineer Intern, Camera Team',
    url: 'https://www.amazon.jobs/content/en/teams/devices-and-services/lab126',
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
    summary: `Built alerting and autoscaling for high-volume data ingestion infrastructure.`,
    highlights: [
      'Designed and implemented an automated Alert Manager detecting message volume anomalies, broadcasting ~4,000 tailored insights daily and cutting manual monitoring by 90%.',
      'Developed CRON jobs to ingest data from two new media sources (Podcast and Classifieds) into Sprinklr’s distributed databases, reducing latency by 3 minutes.',
      'Implemented a Research Adoption metrics service pipeline with 99.9% uptime to identify features that drive revenue.',
      'Owned end-to-end development and re-architecture of alert dashboards, reducing support call volume by 80%.',
      'Developed an autoscaling mechanism for Alert Manager services, reducing annual infrastructure cost by $135K.',
    ],
  },
  {
    name: 'IIT Hyderabad',
    position: 'Placement Coordinator',
    url: 'https://www.iith.ac.in',
    logo: '/images/companies/iith.png',
    startDate: '2019-05-01',
    endDate: '2020-04-01',
    summary: `Served on the student placement team, connecting recruiters with the graduating class through the campus hiring cycle.`,
    highlights: [
      'Invited and onboarded companies for campus recruitment, acting as the student point of contact across the hiring season.',
      'Coordinated pre-placement talks, written tests, and interview logistics between recruiters and students.',
    ],
  },
  {
    name: 'Samsung R&D Bangalore',
    position: 'Software Developer Intern, Networks',
    url: 'https://research.samsung.com/sri-b',
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
    position: 'Research Intern',
    url: 'https://www.iith.ac.in',
    logo: '/images/companies/iith.png',
    startDate: '2017-07-01',
    endDate: '2018-05-01',
    summary: `Worked on Software Defined Networks, exploring how routing decisions shape end-to-end network utilization.`,
    highlights: [
      'Simulated test-bed environments using VyOS to study routing protocols.',
      'Developed a network monitoring tool to predict network utilization in a software-defined network, with 86% accuracy across topologies.',
    ],
  },
  {
    name: 'Elan & nVision, IIT Hyderabad',
    position: 'Publicity Coordinator',
    url: 'https://www.elan.org.in',
    logo: '/images/companies/iith.png',
    startDate: '2017-07-01',
    endDate: '2018-03-01',
    summary: `Elan & nVision is IIT Hyderabad’s annual techno-cultural festival.`,
    highlights: [
      'Directed 40+ student volunteers to execute on-ground marketing and introduced a Campus Ambassador program that recruited representatives from 50+ universities in Telangana and beyond.',
      'Orchestrated Facebook and Instagram campaigns that generated 500,000+ organic impressions and increased technical event registrations by 25%.',
    ],
  },
];

export default work;
