import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Tab } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CourseCreate from '../components/admin/CourseCreate';

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('/api/users/me', {
          headers: { 'x-auth-token': token }
        });

        if (response.data.role !== 'admin') {
          navigate('/');
          return;
        }

        setIsAdmin(true);
        setLoading(false);
      } catch (error) {
        console.error('Error verifying admin status:', error);
        navigate('/login');
      }
    };

    checkAdminStatus();
  }, [navigate]);

  if (loading) {
    return <Container className="text-center mt-5"><h2>Loading...</h2></Container>;
  }

  return (
    <Container fluid className="admin-dashboard py-4">
      <h1 className="text-center mb-4">Admin Dashboard</h1>
      <Row>
        <Col md={3}>
          <Nav variant="pills" className="flex-column">
            <Nav.Item>
              <Nav.Link eventKey="dashboard">Dashboard</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="courses">Manage Courses</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="users">Manage Users</Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="add-course">Add Course</Nav.Link>
            </Nav.Item>
          </Nav>
        </Col>
        <Col md={9}>
          <Tab.Content>
            <Tab.Pane eventKey="dashboard">
              <h2>Admin Overview</h2>
              {/* Dashboard content */}
            </Tab.Pane>
            <Tab.Pane eventKey="courses">
              <h2>Manage Courses</h2>
              {/* Courses management */}
            </Tab.Pane>
            <Tab.Pane eventKey="users">
              <h2>Manage Users</h2>
              {/* Users management */}
            </Tab.Pane>
            <Tab.Pane eventKey="add-course">
              <CourseCreate />
            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
