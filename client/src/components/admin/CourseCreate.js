import React, { useState } from 'react';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';
import axios from 'axios';

const CourseCreate = () => {
  const [course, setCourse] = useState({
    title: '',
    description: '',
    price: '',
    category: ''
  });
  const [chapters, setChapters] = useState([]);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [error, setError] = useState('');

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/admin/courses', course);
      setCurrentChapter({ courseId: response.data._id, contents: [] });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    }
  };

  const handleFileUpload = async (file, chapterId, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('title', file.name);

    try {
      await axios.post(`/api/admin/chapters/${chapterId}/content`, formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload file');
    }
  };

  return (
    <Container className="py-5">
      <h2>Create New Course</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleCourseSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Course Title</Form.Label>
          <Form.Control
            type="text"
            value={course.title}
            onChange={(e) => setCourse({...course, title: e.target.value})}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={course.description}
            onChange={(e) => setCourse({...course, description: e.target.value})}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Price</Form.Label>
          <Form.Control
            type="number"
            value={course.price}
            onChange={(e) => setCourse({...course, price: e.target.value})}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Control
            type="text"
            value={course.category}
            onChange={(e) => setCourse({...course, category: e.target.value})}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Create Course
        </Button>
      </Form>

      {currentChapter && (
        <Card className="mt-4">
          <Card.Body>
            <h3>Add Chapter</h3>
            <ChapterForm 
              courseId={currentChapter.courseId} 
              onChapterAdded={(chapter) => setChapters([...chapters, chapter])}
            />
          </Card.Body>
        </Card>
      )}

      {chapters.map((chapter, index) => (
        <Card key={chapter._id} className="mt-3">
          <Card.Body>
            <h4>{chapter.title}</h4>
            <div className="mt-3">
              <input
                type="file"
                onChange={(e) => handleFileUpload(e.target.files[0], chapter._id, 'video')}
                accept="video/*"
              />
              <input
                type="file"
                onChange={(e) => handleFileUpload(e.target.files[0], chapter._id, 'pdf')}
                accept=".pdf"
              />
            </div>
          </Card.Body>
        </Card>
      ))}
    </Container>
  );
};

export default CourseCreate;
