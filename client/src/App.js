import TeachersPage from './pages/TeachersPage';
import CourseContentManager from './components/admin/CourseContentManager';
import CourseCMS from './components/admin/CourseCMS';

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
  <Route 
    path="/admin/course/new" 
    element={
      <ProtectedRoute>
        <CourseCMS />
      </ProtectedRoute>
    } 
  />
</div>
