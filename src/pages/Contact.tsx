import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Container className="py-5">
      <h1 className="text-center mb-4">Contact Us</h1>
      <Row>
        <Col md={6} className="mb-4">
          <Card>
            <Card.Body>
              <h3>Contact Information</h3>
              <p><i className="bi bi-geo-alt"></i> Address: 123 Education St, City, Country</p>
              <p><i className="bi bi-envelope"></i> Email: info@educationalwebsite.com</p>
              <p><i className="bi bi-telephone"></i> Phone: +1 234 567 8900</p>
              <p><i className="bi bi-clock"></i> Hours: Monday - Friday, 9:00 AM - 5:00 PM</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Subject</Form.Label>
              <Form.Control
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Send Message
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Contact;
