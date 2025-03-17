import React from 'react';
import { Container, Table, Card, Row, Col } from 'react-bootstrap';
import { studentData } from '../data/studentData';

const Performance: React.FC = () => {
  const sortedStudents = [...studentData].sort((a, b) => b.gpa - a.gpa);
  const topPerformer = sortedStudents[0];
  const highestExamScore = [...studentData].sort((a, b) => b.examScore - a.examScore)[0];

  return (
    <Container className="py-4">
      <h1 className="mb-4">Student Performance</h1>
      
      <Row className="mb-4">
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Top Performer</Card.Title>
              <Card.Text>
                {topPerformer.name} - GPA {topPerformer.gpa}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Highest Exam Score</Card.Title>
              <Card.Text>
                {highestExamScore.name} - {highestExamScore.examScore}%
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Grade</th>
            <th>Exam Score</th>
            <th>GPA</th>
            <th>Achievements</th>
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map((student) => (
            <tr key={student.id}>
              <td>{student.name}</td>
              <td>{student.grade}</td>
              <td>{student.examScore}%</td>
              <td>{student.gpa}</td>
              <td>{student.achievements.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Performance;
