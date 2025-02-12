import React from 'react';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // React Router v6

const UserScreen = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login'); 
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Account Details</h2>

      <div style={styles.infoContainer}>
        <p style={styles.infoText}><strong>Email:</strong> {user ? user.email : 'No disponible'}</p>
        <p style={styles.infoText}><strong>Password:</strong> {'******'}</p>
      </div>

      <button style={styles.logoutButton} onClick={handleLogout}>
        <span style={styles.logoutText}>Logout</span>
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',  // Cambiado de 'center' a 'flex-start' para alinear más arriba
    alignItems: 'center',
    padding: '30px',
    backgroundColor: '#fefae0',
    minHeight: '100vh',
    fontFamily: "'Roboto', sans-serif",
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#003049',
    marginBottom: '15px',  // Reducido el margen inferior para acercarlo más
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '25px',
    width: '100%',
    maxWidth: '500px',
    marginBottom: '20px',  // Reducido el margen inferior para acercarlo más
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    border: '1px solid #d4a373',
  },
  infoText: {
    fontSize: '18px',
    color: '#003049',
    marginBottom: '15px',
  },
  logoutButton: {
    width: '100%',
    maxWidth: '500px',
    padding: '15px',
    backgroundColor: '#fcbf49',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  logoutButtonHover: {
    backgroundColor: '#ff8c00',
  },
  logoutText: {
    color: '#003049',
    fontSize: '18px',
    fontWeight: 'bold',
  },
};

export default UserScreen;
