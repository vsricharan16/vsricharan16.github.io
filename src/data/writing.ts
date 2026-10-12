export interface WritingItem {
  title: string;
  url: string;
  date: string;
  description: string;
  /** Optional topic tags; unused today but honored by the writing filter. */
  tags?: string[];
}

const data: WritingItem[] = [];

export default data;
