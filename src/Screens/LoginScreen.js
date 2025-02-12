import React, { useState } from 'react';
import { auth } from '../firebaseconfig.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleLoginOrRegister = async () => {
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/add-video');
    } catch (error) {
      const errorMessage = error.message;

      if (errorMessage.includes('auth/weak-password')) {
        toast.error('Password should be at least 6 characters long.');
      } else if (errorMessage.includes('auth/invalid-email')) {
        toast.error('Please enter a valid email address.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{isRegistering ? 'Register' : 'Login'}</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />

      <button style={styles.button} onClick={handleLoginOrRegister}>
        {isRegistering ? 'Register' : 'Login'}
      </button>

      <p
        style={styles.switchText}
        onClick={() => setIsRegistering(!isRegistering)}
      >
        {isRegistering ? 'Switch to Login' : 'Switch to Register'}
      </p>

      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} closeOnClick />
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#fefae0',
    minHeight: '100vh',
    fontFamily: "'Roboto', sans-serif",
  },
  title: {
    fontSize: '32px',
    marginBottom: '20px',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#003049',
  },
  input: {
    width: '100%',
    maxWidth: '400px',
    padding: '12px',
    marginBottom: '15px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #d4a373',
    fontSize: '16px',
    transition: 'all 0.3s ease',
  },
  inputFocus: {
    borderColor: '#fcbf49',
    boxShadow: '0 0 5px rgba(252, 191, 73, 0.5)',
  },
  button: {
    width: '100%',
    maxWidth: '400px',
    padding: '15px',
    backgroundColor: '#fcbf49',
    borderRadius: '8px',
    marginBottom: '10px',
    color: '#003049',
    fontWeight: 'bold',
    fontSize: '18px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#ff8c00',
  },
  switchText: {
    color: '#003049',
    fontSize: '16px',
    marginTop: '10px',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

