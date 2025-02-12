import React, { useState, useEffect } from 'react';
import { db } from '../firebaseconfig';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const AddVideoScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [isInstagram, setIsInstagram] = useState(false);
  const [videos, setVideos] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState('');
  const auth = getAuth();

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = new Date(date).toLocaleDateString('es-ES', options);
    return formattedDate;
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    const userId = auth.currentUser?.uid;
    if (userId) {
      const q = query(collection(db, 'videos'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const videoList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVideos(videoList);
    }
  };

  const handleAddVideo = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (userId && title && description && url) {
        // Siempre que sea Instagram, usamos la miniatura fija
        const thumbnailUrl = isInstagram ? getInstagramThumbnail() : getYouTubeThumbnail(url);
  
        if (thumbnailUrl) {
          const currentDate = new Date();
          console.log("Fecha actual: ", currentDate); 
  
          await addDoc(collection(db, 'videos'), {
            userId,
            title,
            description,
            url,
            platform: isInstagram ? 'Instagram' : 'YouTube',
            thumbnail: thumbnailUrl,
            date: currentDate.toISOString(), 
          });
  
          setTitle('');
          setDescription('');
          setUrl('');
          setIsInstagram(false);
          setIsModalVisible(false);
          fetchVideos();
        } else {
          alert('Error al generar la miniatura');
        }
      } else {
        alert('Por favor, completa todos los campos');
      }
    } catch (error) {
      console.error('Error añadiendo el video: ', error.message);
    }
  };
  
  
  
  const handleDeleteVideo = async (id) => {
    try {
      await deleteDoc(doc(db, 'videos', id));
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video: ', error.message);
    }
  };
  

  const handlePlayVideo = (url) => {
    // Para YouTube, extraemos el ID y formamos la URL de embed
    const youtubeEmbedUrl = url.match(/(?:youtube\.com\/(?:[^\/]+\/[^\/]+\/|(?:v|embed)\/|.*[?&]v=)|https:\/\/youtu\.be\/)([^"&?\/ ]{11})/)
      ? `https://www.youtube.com/embed/${url.match(/(?:youtube\.com\/(?:[^\/]+\/[^\/]+\/|(?:v|embed)\/|.*[?&]v=)|https:\/\/youtu\.be\/)([^"&?\/ ]{11})/)[1]}`
      : url;
  
    // Para Instagram, extraemos el ID y formamos la URL embebida
    const instagramEmbedUrl = url.match(/(?:https:\/\/www\.instagram\.com\/reel\/)([^\/]+)/)
      ? `https://www.instagram.com/reel/${url.match(/(?:https:\/\/www\.instagram\.com\/reel\/)([^\/]+)/)[1]}/embed`
      : youtubeEmbedUrl;  // Si no es un video de Instagram, utilizamos la URL de YouTube.
  
    setSelectedUrl(instagramEmbedUrl);
    setIsFullScreen(true);
  };
  
  
  const handleCloseFullScreen = () => {
    setIsFullScreen(false);
    setSelectedUrl('');
  };

  const getYouTubeThumbnail = (url) => {
    // Ajustamos la expresión regular para manejar tanto los parámetros adicionales como las URLs cortas
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/[^\/]+\/|(?:v|embed)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/);
    return match ? `https://img.youtube.com/vi/${match[1]}/0.jpg` : null;
  };

  const getInstagramThumbnail = () => {
    return require('../assets/miniatura.jpg'); // Asegúrate de que la ruta sea correcta
  };
  
  
  
  
  return (
    <div className="container">
      {isFullScreen ? (
        <div className="fullscreen-container">
          <button className="close-button" onClick={handleCloseFullScreen}>
            Go Back
          </button>
          <iframe
            src={selectedUrl}
            className="fullscreen-iframe"
            title="Video Player"
            allowFullScreen
          />
        </div>
      ) : (
        <>
          <div className="video-grid">
            {videos.map((item) => (
              <div key={item.id} className="video-item">
              <img src={item.thumbnail} alt={item.title} className="video-thumbnail" />
              <h3 className="video-title">{item.title}</h3>
                <p className="description-text">{item.description}</p>
                <div className="platform-text">Platform: {item.platform}</div>
                <div className="date-container">
                  <span className="date-text">{formatDate(item.date)}</span>
                </div>
                <div className="button-container">
                  <button className="play-button" onClick={() => handlePlayVideo(item.url)}>
                    Play
                  </button>
                                <button 
                className="delete-button" 
                onClick={() => {
                  const isConfirmed = window.confirm("Are you sure you want to delete this video?");
                  if (isConfirmed) {
                    handleDeleteVideo(item.id);
                  }
                }}
              >
                Delete
              </button>

                </div>
              </div>
            ))}
          </div>

          <button className="fab-button" onClick={() => setIsModalVisible(true)}>
            +
          </button>

          {isModalVisible && (
            <div className="modal-overlay">
              <div className="modal-content">
                <button className="close-modal-button" onClick={() => setIsModalVisible(false)}>
                  &times;
                </button>
                <h2 className="modal-title">Add New Video</h2>
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                />
                <textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="input"
                />
                <div className="switch-container">
                  <span className="switch-label">Select Platform:</span>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={isInstagram}
                      onChange={(e) => setIsInstagram(e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                  <span className="switch-label">{isInstagram ? "Instagram" : "YouTube"}</span>
                </div>
                <div className="button-group">
                  <button className="add-button" onClick={handleAddVideo}>
                    Add Video
                  </button>
                  <button className="cancel-button" onClick={() => setIsModalVisible(false)}>
                    Cancel
                  </button>
            </div>
          </div>
        </div>
      )}
    </>
  )}

      <style jsx>{`
           .container {
      padding: 20px;
      background-color: #fefae0;
      min-height: 100vh;
      position: relative;
    }

    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 80px;
    }

    .video-item {
      background-color: #e9edc9;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .video-thumbnail {
      width: 100%;
      height: 200px;
      border-radius: 8px;
      object-fit: cover;
    }

    .video-title {
      font-size: 20px;
      font-weight: bold;
      margin: 10px 0;
      color: #003049;
      text-align: center;
      background-color: #fcbf49;
      padding: 5px;
      border-radius: 5px;
    }

    .description-text {
      font-size: 16px;
      color: #333;
      margin-bottom: 15px;
      line-height: 1.4;
      padding: 15px;
      background-color: #fafafa;
      border-radius: 8px;
    }

    .platform-text {
      font-size: 15px;
      color: #fff;
      font-weight: bold;
      background-color: #003049;
      padding: 10px 20px;
      border-radius: 5px;
      display: inline-block;
      margin-bottom: 10px;
    }

    .button-container {
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }

    .play-button, .delete-button {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      cursor: pointer;
    }

    .play-button {
      background-color: #ccd5ae;
    }

    .delete-button {
      background-color: #d62828;
    }

    .fab-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 60px;
      height: 60px;
      background-color: #d4a373;
      border: none;
      border-radius: 30px;
      color: white;
      font-size: 36px;
      cursor: pointer;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 48, 73, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .modal-content {
      background-color: #faedcd;
      padding: 40px;
      border-radius: 10px;
      width: 90%;
      max-width: 500px;
      position: relative;
    }

    .close-modal-button {
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #003049;
    }

    .modal-title {
      font-size: 24px;
      color: #003049;
      margin-bottom: 20px;
      text-align: center;
    }

    .input {
      width: 100%;
      padding: 10px;
      margin-bottom: 15px;
      border: 1px solid #ccd5ae;
      border-radius: 5px;
      font-size: 16px;
    }

    .switch-container {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
      margin: 0 10px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #eae2b7;
      transition: .4s;
      border-radius: 34px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: #003049;
      transition: .4s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: #fcbf49;
    }

    input:checked + .slider:before {
      transform: translateX(26px);
    }

    .button-group {
      display: flex;
      gap: 10px;
    }

    .add-button, .cancel-button {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      cursor: pointer;
    }

    .add-button {
      background-color: #d4a373;
    }

    .cancel-button {
      background-color: #e9edc9;
      color: #003049;
    }

    .fullscreen-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: black;
      z-index: 1000;
    }

    .fullscreen-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    .close-button {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #fcbf49;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      z-index: 1001;
    }

    .date-container {
      text-align: right;
      margin-top: 10px;
    }

    .date-text {
      font-size: 14px;
      color: #003049;
      font-style: italic;
      padding: 5px;
    }
      `}</style>
    </div>
  );
};

export default AddVideoScreen;