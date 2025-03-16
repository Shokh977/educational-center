export interface StudentPerformance {
  id: number;
  name: string;
  grade: string;
  examScore: number;
  gpa: number;
  achievements: string[];
  imageUrl?: string;
}

export const studentData: StudentPerformance[] = [
  {
    id: 1,
    name: "John Doe",
    grade: "12th",
    examScore: 95,
    gpa: 3.9,
    achievements: ["Science Fair Winner", "Math Olympiad Gold"],
    imageUrl: "/images/student1.jpg"
  },
  {
    id: 2,
    name: "Jane Smith",
    grade: "11th",
    examScore: 98,
    gpa: 4.0,
    achievements: ["Debate Champion", "Perfect Attendance"],
    imageUrl: "/images/student2.jpg"
  },
  {
    id: 3,
    name: "Michael Johnson",
    grade: "12th",
    examScore: 97,
    gpa: 3.95,
    achievements: ["Chess Champion", "Science Olympiad Silver"],
    imageUrl: "/images/student3.jpg"
  }
];
