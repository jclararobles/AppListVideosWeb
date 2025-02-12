import React, { useState, useEffect } from 'react';
import { db } from '../firebaseconfig.js';
import { collection, query, where, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const ListDetailScreen = () => {
  const [videos, setVideos] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const q = query(collection(db, 'videos'), where('userId', '==', userId));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const videoList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVideos(videoList);
      });

      return () => unsubscribe();
    }
  }, [auth.currentUser?.uid]);

  const handlePlayVideo = (url) => {
    setSelectedUrl(url);
    setIsFullScreen(true);
  };

  const handleCloseFullScreen = () => {
    setIsFullScreen(false);
    setSelectedUrl('');
  };

  const handleDeleteVideo = (id) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        deleteDoc(doc(db, 'videos', id));
      } catch (error) {
        console.error('Error deleting video: ', error.message);
      }
    }
  };

  return (
    <div className="container">
      {isFullScreen ? (
        <div className="fullscreen-container">
          <iframe 
            src={selectedUrl} 
            className="fullscreen-iframe"
            title="Video Player"
            allowFullScreen
          />
          <button 
            onClick={handleCloseFullScreen} 
            className="close-button"
            aria-label="Close video"
          >
            ×
          </button>
        </div>
      ) : (
        <>
          <div className="video-grid">
            {videos.map((item) => (
              <div key={item.id} className="video-card">
                <img 
                  src={item.thumbnail} 
                  alt={item.title} 
                  className="video-thumbnail"
                  loading="lazy"
                />
                <h3 className="video-title">{item.title}</h3>
                <p className="video-description">{item.description}</p>
                <div className="button-group">
                  <button 
                    onClick={() => handlePlayVideo(item.url)} 
                    className="play-button"
                  >
                    Play
                  </button>
                  <button 
                    onClick={() => handleDeleteVideo(item.id)} 
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="back-button"
          >
            Go Back
          </button>
        </>
      )}

      <style jsx>{`
        .container {
          padding: 2rem;
          background-color: #fefae0;
          min-height: 100vh;
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .video-card {
          background-color: #e9edc9;
          border-radius: 8px;
          padding: 1rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }

        .video-card:hover {
          transform: translateY(-4px);
        }

        .video-thumbnail {
          width: 100%;
          height: 200px;
          border-radius: 8px;
          object-fit: cover;
        }

        .video-title {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 1rem 0;
          color: #003049;
          background-color: #fcbf49;
          padding: 0.5rem;
          border-radius: 5px;
          text-align: center;
        }

        .video-description {
          font-size: 1rem;
          color: #333;
          margin-bottom: 1rem;
          text-align: justify;
          background-color: #fafafa;
          border-radius: 8px;
          padding: 1rem;
          line-height: 1.5;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .play-button, .delete-button {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 5px;
          font-weight: bold;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .play-button:hover, .delete-button:hover {
          opacity: 0.9;
        }

        .play-button {
          background-color: #ccd5ae;
          color: #003049;
        }

        .delete-button {
          background-color: #d62828;
          color: white;
        }

        .back-button {
          display: block;
          margin: 2rem auto;
          padding: 0.75rem 2rem;
          background-color: #fcbf49;
          color: #003049;
          border: none;
          border-radius: 5px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .back-button:hover {
          background-color: #f3b33d;
        }

        .fullscreen-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.9);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .fullscreen-iframe {
          width: 90%;
          height: 90%;
          border: none;
          border-radius: 8px;
        }

        .close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background-color: transparent;
          color: white;
          font-size: 2rem;
          border: none;
          cursor: pointer;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s ease;
        }

        .close-button:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .video-grid {
            grid-template-columns: 1fr;
          }

          .fullscreen-iframe {
            width: 100%;
            height: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ListDetailScreen;