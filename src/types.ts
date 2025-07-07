export interface Topic {
    id: string;
    title: string;
    description: string;
  }
  
  export interface Chapter {
    id: string;
    title: string;
    topics: Topic[];
  }
  
  export interface Subject {
    id: string;
    title: string;
    chapters: Chapter[];
  }
  
  export interface Modal {
    isOpen: boolean;
    title: string;
    description: string;
  }