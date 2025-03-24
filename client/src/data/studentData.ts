interface Student {
  id: number;
  name: string;
  grade: string;
  gpa: number;
  examScore: number;
  achievements: string[];
}

export const studentData: Student[] = [
  { 
    id: 1, 
    name: 'John Doe', 
    grade: 'A',
    gpa: 4.0,
    examScore: 98,
    achievements: ['Honor Roll', 'Science Fair Winner']
  },
  { 
    id: 2, 
    name: 'Jane Smith', 
    grade: 'B',
    gpa: 3.5,
    examScore: 92,
    achievements: ['Student Council President', 'Debate Team Captain']
  },
  { 
    id: 3, 
    name: 'Mike Johnson', 
    grade: 'A-',
    gpa: 3.8,
    examScore: 95,
    achievements: ['Math Olympiad Winner', 'Chess Club Champion']
  }
];
