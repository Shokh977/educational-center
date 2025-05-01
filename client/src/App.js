import TeachersPage from './pages/TeachersPage';
import CourseContentManager from './components/admin/CourseContentManager';

// Inside your Routes component
<div>
  <Route path="/teachers" element={<TeachersPage />} />
  <Route 
    path="/admin" 
    element={
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    } 
  />
  <Route 
    path="/admin/course/:courseId/content" 
    element={
      <ProtectedRoute>
        <CourseContentManager />
      </ProtectedRoute>
    } 
  />
</div>
