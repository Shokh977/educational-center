import { Link } from 'react-router-dom';
import { studentData } from '../data/studentData';

// ...existing code...

const Home: React.FC = () => {
  // Get top 3 students sorted by GPA
  const topStudents = [...studentData]
    .sort((a, b) => b.gpa - a.gpa)
    .slice(0, 3);

  return (
    // ...existing code...
    <section className="top-performers-section my-5">
      <Container>
        <h2 className="text-center mb-4">Top Performing Students</h2>
        <Row>
          {topStudents.map((student) => (
            <Col key={student.id} md={4} className="mb-3">
              <Card>
                {student.imageUrl && (
                  <Card.Img 
                    variant="top" 
                    src={student.imageUrl} 
                    alt={student.name}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body>
                  <Card.Title>{student.name}</Card.Title>
                  <Card.Text>
                    <div>Grade: {student.grade}</div>
                    <div>GPA: {student.gpa}</div>
                    <div>Latest Score: {student.examScore}%</div>
                    <div>Achievements: {student.achievements[0]}</div>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        <div className="text-center mt-3">
          <Link to="/performance" className="btn btn-primary">
            View All Performance Data
          </Link>
        </div>
      </Container>
    </section>
    // ...existing code...
  );
};
