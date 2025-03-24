import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import axios from 'axios';

const ChapterForm = ({ courseId, onChapterAdded }) => {
  const [chapter, setChapter] = useState({
    title: '',
    description: '',
    order: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/admin/courses/${courseId}/chapters`, chapter);
      onChapterAdded(response.data);
      setChapter({ title: '', description: '', order: chapter.order + 1 });
    } catch (error) {
      console.error('Failed to add chapter:', error);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Chapter Title</Form.Label>
        <Form.Control
          type="text"
          value={chapter.title}
          onChange={(e) => setChapter({...chapter, title: e.target.value})}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={chapter.description}
          onChange={(e) => setChapter({...chapter, description: e.target.value})}
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Order</Form.Label>
        <Form.Control
          type="number"
          value={chapter.order}
          onChange={(e) => setChapter({...chapter, order: parseInt(e.target.value)})}
          required
        />
      </Form.Group>

      <Button variant="success" type="submit">
        Add Chapter
      </Button>
    </Form>
  );
};

export default ChapterForm;
