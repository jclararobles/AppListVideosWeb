import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './Screens/LoginScreen';
import ListsScreen from './Screens/ListsScreen';
import ListDetailScreen from './Screens/ListDetailScreen';
import AddVideoScreen from './Screens/AddVideoScreen';
import UserScreen from './Screens/UserScreen'; // Importamos UserScreen
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />

      {/* Ruta raíz que redirige a /lists si el usuario está autenticado */}
      <Route path="/" element={<Navigate to="/lists" />} />

      {/* Rutas protegidas */}
      <Route
        path="/lists"
        element={
          <ProtectedRoute>
            <ListsScreen />
          </ProtectedRoute>
        }
      />
            <Route
        path="/list-detail/:id"
        element={
          <ProtectedRoute>
            <ListDetailScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-video"
        element={
          <ProtectedRoute>
            <AddVideoScreen />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile" // Agregamos la ruta a UserScreen
        element={
          <ProtectedRoute>
            <UserScreen />
          </ProtectedRoute>
        }
      />

      {/* Redirigir a login si la ruta no existe */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
