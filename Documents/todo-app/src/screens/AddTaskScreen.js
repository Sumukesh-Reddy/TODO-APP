import React, { useState } from "react";
import { API } from "../services/api";
import { useNavigate } from "react-router-dom";

const StarsBackground = () => {
  React.useEffect(() => {
    const container = document.getElementById('stars-background');
    
    
    for (let i = 0; i < 150; i++) {
      const star = document.createElement('div');
      star.style.position = 'absolute';
      star.style.backgroundColor = 'white';
      star.style.borderRadius = '50%';
      star.style.width = Math.random() * 3 + 1 + 'px';
      star.style.height = star.style.width;
      star.style.left = Math.random() * 100 + 'vw';
      star.style.top = Math.random() * 100 + 'vh';
      star.style.opacity = Math.random() * 0.7 + 0.3;
      
      if (Math.random() > 0.7) {
        star.style.animation = 'twinkle 2s ease-in-out infinite';
      }
      
      container.appendChild(star);
    }
    
    
    for (let i = 0; i < 50; i++) {
      const star = document.createElement('div');
      star.style.position = 'absolute';
      star.style.backgroundColor = 'white';
      star.style.borderRadius = '50%';
      star.style.width = Math.random() * 2 + 1 + 'px';
      star.style.height = star.style.width;
      star.style.left = Math.random() * 100 + 'vw';
      star.style.top = Math.random() * 100 + 'vh';
      star.style.opacity = Math.random() * 0.8 + 0.2;
      
      const animationNum = Math.floor(Math.random() * 3) + 1;
      star.style.animation = `moveStar${animationNum} ${20 + Math.random() * 15}s linear infinite`;
      
      container.appendChild(star);
    }
    
    return () => {
      container.innerHTML = '';
    };
  }, []);

  return (
    <div 
      id="stars-background"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        overflow: 'hidden',
      }}
    />
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    color: '#f8fafc',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: '20px',
    position: 'relative',
  },
  header: {
    maxWidth: '1200px',
    margin: '0 auto 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 0',
    borderBottom: '1px solid #334155',
  },
  card: {
    maxWidth: '800px',
    margin: '0 auto',
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '40px',
    border: '1px solid #334155',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
  },
  inputGroup: {
    marginBottom: '25px',
  },
  inputLabel: {
    display: 'block',
    marginBottom: '10px',
    color: '#cbd5e1',
    fontWeight: '500',
    fontSize: '14px',
  },
  inputField: {
    width: '100%',
    padding: '16px',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '2px solid #334155',
    borderRadius: '12px',
    color: '#f8fafc',
    fontSize: '16px',
    transition: 'all 0.3s ease',
  },
  buttonGroup: {
    display: 'flex',
    gap: '20px',
    marginTop: '40px',
  },
  button: {
    flex: 1,
    padding: '16px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
    color: 'white',
  },
  secondaryButton: {
    background: 'transparent',
    border: '2px solid #0ea5e9',
    color: '#0ea5e9',
  },
  title: {
    fontSize: '2.5rem',
    background: 'linear-gradient(135deg, #0ea5e9, #22d3ee)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '10px',
  },
};

export default function AddTaskScreen() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState(2);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const addTask = async (e) => {
    e.preventDefault();
    try {
      await API.post(
        "/tasks",
        { title, description, deadline, priority },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/home");
    } catch (error) {
      alert("Failed to add task");
      console.error(error);
    }
  };

  return (
    <>
      <StarsBackground />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Create New Task</h1>
          <button 
            onClick={() => navigate("/home")}
            style={{
              ...styles.button,
              ...styles.secondaryButton,
              padding: '12px 24px',
            }}
          >
            ← Back to Tasks
          </button>
        </div>

        <div style={styles.card}>
          <form onSubmit={addTask}>
            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Task Title *</label>
              <input 
                style={styles.inputField}
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Description</label>
              <textarea 
                style={{...styles.inputField, minHeight: '120px', resize: 'vertical'}}
                placeholder="Enter task description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Deadline</label>
              <input 
                style={styles.inputField}
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Priority</label>
              <select 
                style={styles.inputField}
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value))}
                onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                onBlur={(e) => e.target.style.borderColor = '#334155'}
              >
                <option value="1">🔥 High Priority</option>
                <option value="2">⚡ Medium Priority</option>
                <option value="3">💧 Low Priority</option>
              </select>
            </div>

            <div style={styles.buttonGroup}>
              <button 
                type="submit" 
                style={{...styles.button, ...styles.primaryButton}}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                ✨ Add Task
              </button>
              <button 
                type="button" 
                style={{...styles.button, ...styles.secondaryButton}}
                onClick={() => navigate("/home")}
                onMouseOver={(e) => {
                  e.target.style.background = '#0ea5e9';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#0ea5e9';
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`
        @keyframes moveStar1 {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-100px) translateX(100px); }
          100% { transform: translateY(0) translateX(0); }
        }
        @keyframes moveStar2 {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-150px) translateX(-150px); }
          100% { transform: translateY(0) translateX(0); }
        }
        @keyframes moveStar3 {
          0% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(200px) translateX(50px); }
          100% { transform: translateY(0) translateX(0); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        .input-field:focus {
          outline: none;
          border-color: #0ea5e9 !important;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }
      `}</style>
    </>
  );
}