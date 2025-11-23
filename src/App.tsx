import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Print from './pages/Print';
import ApiIntegration from './pages/ApiIntegration';
import Templates from './pages/Templates';
import TemplatesPage from './pages/TemplatesPage';
import UsersManagement from './pages/UsersManagement';
import UserForm from './pages/UserForm';
import UsuariosAdicionais from './pages/UsuariosAdicionais';
import UsuarioAdicionalForm from './pages/UsuarioAdicionalForm';
import History from './pages/History';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import PrivateRoute from './components/auth/PrivateRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        <Routes>
          {/* Rota pública - Login */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas com layout */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="editor" element={<Editor />} />
            <Route path="print" element={<Print />} />
            <Route path="api-integration" element={<ApiIntegration />} />
            <Route path="templates" element={<TemplatesPage />} />
            <Route path="saved-templates" element={<Templates />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="users/new" element={<UserForm />} />
            <Route path="users/edit/:id" element={<UserForm />} />
            <Route path="usuarios-adicionais" element={<UsuariosAdicionais />} />
            <Route path="usuarios-adicionais/new" element={<UsuarioAdicionalForm />} />
            <Route path="usuarios-adicionais/edit/:id" element={<UsuarioAdicionalForm />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Rota 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
