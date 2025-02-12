import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebaseconfig'; // Usa auth importado
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const ListsScreen = () => {
  const [lists, setLists] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const navigate = useNavigate();

  const fetchLists = async () => {
    const userId = auth.currentUser?.uid; // Usa auth de firebaseconfig
    if (userId) {
      const q = query(collection(db, 'lists'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const userLists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLists(userLists);
    }
  };

  useEffect(() => {
    fetchLists();
    fetchVideos();
    const userId = auth.currentUser?.uid; // Usa auth de firebaseconfig
    if (userId) {
      const q = query(collection(db, 'lists'), where('userId', '==', userId));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const userLists = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLists(userLists);
      });
      return () => unsubscribe();
    }
  }, []);

  const fetchVideos = async () => {
    const userId = auth.currentUser?.uid; // Usa auth de firebaseconfig
    const q = query(collection(db, 'videos'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const userVideos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAllVideos(userVideos);
  };

  const handleCreateList = async () => {
    const userId = auth.currentUser?.uid;
    if (userId && title && selectedVideos.length > 0) {
      await addDoc(collection(db, 'lists'), {
        userId,
        title,
        videos: selectedVideos.map(video => ({
          id: video.id, 
          title: video.title, 
          description: video.description, 
          thumbnail: video.thumbnail, 
          url: video.url, 
          platform: video.platform, 
          date: video.date // Incluyendo todos los detalles que necesitas
        })),
      });
      setIsModalVisible(false);
      setTitle('');
      setSelectedVideos([]);
      fetchLists();
    } else {
      alert('Please complete all fields and select at least one video');
    }
  };
  

  const handleDeleteList = async (listId) => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      const listRef = doc(db, 'lists', listId);
      await deleteDoc(listRef);
    }
  };

  const handleRemoveVideo = (videoId) => {
    setSelectedVideos(prevSelectedVideos =>
      prevSelectedVideos.filter(video => video.id !== videoId)
    );
  };

  return (
    <div className="container">
      {/* Mostrar el Navbar solo si el usuario está autenticado */}

      <button className="create-button" onClick={() => setIsModalVisible(true)}>
        Create New List
      </button>

      <div className="lists-container">
        {lists.map((item) => (
          <div key={item.id} className="list-card">
            <div className="list-content">
              <h3 className="list-title">{item.title}</h3>
              <div className="list-actions">
              <button 
              className="view-button"
              onClick={() => navigate(`/list-detail/${item.id}`)} // Ajustado el path aquí
            >
              View List
                </button>
                <button 
                  className="delete-button"
                  onClick={() => handleDeleteList(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Create New List</h2>
            <input
              type="text"
              placeholder="Enter list title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="title-input"
            />
            
            <div className="videos-selection">
              <h3>Select Videos</h3>
              <div className="videos-grid">
                {allVideos.map((item) => (
                  <div 
                    key={item.id} 
                    className={`video-item ${selectedVideos.some(video => video.id === item.id) ? 'selected' : ''}`}
                  >
                    <div 
                      className="video-select"
                      onClick={() => {
                        setSelectedVideos(prev =>
                          prev.some(video => video.id === item.id)
                            ? prev.filter(video => video.id !== item.id)
                            : [...prev, item]
                        );
                      }}
                    >
                      {item.title}
                      {selectedVideos.some(video => video.id === item.id) && (
                        <span className="selected-indicator">✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="save-button" onClick={handleCreateList}>
                Save List
              </button>
              <button className="cancel-button" onClick={() => setIsModalVisible(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .container {
          padding: 2rem;
          background-color: #fefae0;
          min-height: 100vh;
        }

        .create-button {
          background-color: #fcbf49;
          color: #003049;
          padding: 1rem 2rem;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.2s ease;
          margin-bottom: 2rem;
        }

        .create-button:hover {
          background-color: #f3b33d;
        }

        .lists-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .list-card {
          background-color: #e9edc9;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .list-card:hover {
          transform: translateY(-4px);
        }

        .list-content {
          padding: 1.5rem;
        }

        .list-title {
          font-size: 1.25rem;
          color: #003049;
          margin-bottom: 1rem;
        }

        .list-actions {
          display: flex;
          gap: 1rem;
        }

        .view-button, .delete-button {
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 5px;
          font-weight: bold;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .view-button {
          background-color: #ccd5ae;
          color: #003049;
        }

        .delete-button {
          background-color: #d62828;
          color: white;
        }

        .view-button:hover, .delete-button:hover {
          opacity: 0.9;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background-color: #fefae0;
          padding: 3rem;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-title {
          color: #003049;
          margin-bottom: 1.5rem;
          text-align: center;
        }

        .title-input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #ccd5ae;
          border-radius: 5px;
          margin-bottom: 1.5rem;
          font-size: 1rem;
        }

        .videos-selection {
          margin-bottom: 1.5rem;
        }

        .videos-grid {
          display: grid;
          gap: 1rem;
          margin-top: 1rem;
        }

        .video-item {
          background-color: #e9edc9;
          border-radius: 5px;
          transition: background-color 0.2s ease;
        }

        .video-select {
          padding: 1rem;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .selected {
          background-color: #fcbf49;
        }

        .selected-indicator {
          color: #003049;
          font-weight: bold;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .save-button, .cancel-button {
          flex: 1;
          padding: 0.75rem;
          border: none;
          border-radius: 5px;
          font-weight: bold;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .save-button {
          background-color: #fcbf49;
          color: #003049;
        }

        .cancel-button {
          background-color: #d4a373;
          color: #003049;
        }

        .save-button:hover, .cancel-button:hover {
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .modal-content {
            width: 95%;
            padding: 1.5rem;
          }

          .lists-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ListsScreen;