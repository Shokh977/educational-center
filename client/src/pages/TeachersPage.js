import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { API_URL } from '../config';

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/users/teachers`);
        setTeachers(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load teachers. Please try again later.');
        setLoading(false);
        console.error('Error fetching teachers:', err);
      }
    };

    fetchTeachers();
  }, []);

  if (loading) return <div className="text-center mt-5"><h2>Loading...</h2></div>;
  if (error) return <div className="text-center mt-5 text-danger"><h2>{error}</h2></div>;

  return (
    <Container className="py-5">
      <h1 className="text-center mb-5">Our Teachers</h1>
      <Row>
        {teachers.length > 0 ? (
          teachers.map(teacher => (
            <Col key={teacher._id} md={4} className="mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Img 
                  variant="top" 
                  src={teacher.profileImage || 'https://via.placeholder.com/150'} 
                  alt={teacher.name}
                  className="card-img-top p-3"
                  style={{ height: '250px', objectFit: 'cover' }}
                />
                <Card.Body>
                  <Card.Title>{teacher.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{teacher.specialty || 'Educator'}</Card.Subtitle>
                  <Card.Text>
                    {teacher.bio || 'No biography available.'}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className="bg-white">
                  <small className="text-muted">Email: {teacher.email}</small>
                </Card.Footer>
              </Card>
            </Col>
          ))
        ) : (
          <Col className="text-center">
            <h3>No teachers found</h3>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default TeachersPage;
