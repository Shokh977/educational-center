import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { studentData } from '../data/studentData';

const Home: React.FC = () => {
  const topStudents = [...studentData]
    .sort((a, b) => b.gpa - a.gpa)
    .slice(0, 3);

  return (
    <div>
      <section className="bg-light py-5">
        <Container>
          <h2 className="text-center mb-4">Top Performing Students</h2>
          <Row>
            {topStudents.map((student) => (
              <Col key={student.id} md={4} className="mb-4">
                <Card className="h-100">
                  <Card.Body>
                    <Card.Title>{student.name}</Card.Title>
                    <Card.Text>
                      <p>Grade: {student.grade}</p>
                      <p>GPA: {student.gpa}</p>
                      <p>Exam Score: {student.examScore}%</p>
                      <p>Achievement: {student.achievements[0]}</p>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          <div className="text-center mt-4">
            <Link to="/performance" className="btn btn-primary">
              View All Performance Data
            </Link>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Home;
