import React, { useEffect, useState } from "react";
import { API } from "../services/api";
import TaskItem from "../components/TaskItem";
import { useNavigate } from "react-router-dom";

const StarsBackground = () => {
  React.useEffect(() => {
    const container = document.getElementById('stars-background');
    
    // Create static stars
    for (let i = 0; i < 200; i++) {
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
        star.style.animation = 'twinkle 3s ease-in-out infinite';
      }
      
      container.appendChild(star);
    }
    
    // Create moving stars
    for (let i = 0; i < 60; i++) {
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
    padding: '30px',
    position: 'relative',
  },
  header: {
    maxWidth: '1400px',
    margin: '0 auto 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '30px 0',
    borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
  },
  mainCard: {
    maxWidth: '1400px',
    margin: '0 auto 30px',
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '30px',
    border: '1px solid rgba(51, 65, 85, 0.3)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
  },
  tasksCard: {
    maxWidth: '1400px',
    margin: '0 auto',
    background: 'rgba(30, 41, 59, 0.5)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '30px',
    border: '1px solid rgba(51, 65, 85, 0.3)',
    minHeight: '400px',
  },
  button: {
    padding: '14px 28px',
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
  dangerButton: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  title: {
    fontSize: '3rem',
    background: 'linear-gradient(135deg, #0ea5e9, #22d3ee)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '10px',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1.2rem',
  },
  taskCount: {
    background: 'rgba(14, 165, 233, 0.1)',
    padding: '8px 16px',
    borderRadius: '20px',
    display: 'inline-block',
    marginLeft: '15px',
  },
  userGreeting: {
    color: '#22d3ee',
    fontSize: '1.1rem',
    marginTop: '5px',
  },
};

export default function HomeScreen() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await API.get("/tasks", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const sorted = res.data.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return new Date(a.deadline) - new Date(b.deadline);
      });

      setTasks(sorted);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getUserName = () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).name.split(' ')[0] : "User";
  };

  return (
    <>
      <StarsBackground />
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>TODO APP</h1>
            <p style={styles.userGreeting}>Welcome back, {getUserName()}! 👋</p>
          </div>
          <button 
            style={{...styles.button, ...styles.dangerButton}}
            onClick={logout}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🚀 Logout
          </button>
        </div>

        <div style={styles.mainCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>
                Your Tasks
                <span style={styles.taskCount}>{tasks.length} tasks</span>
              </h2>
              <p style={styles.subtitle}>Priority sorted with nearest deadlines first</p>
            </div>
            <button 
              style={{...styles.button, ...styles.primaryButton}}
              onClick={() => navigate("/add-task")}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 10px 25px rgba(14, 165, 233, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              ✨ Add New Task
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{...styles.tasksCard, textAlign: 'center', padding: '80px 20px'}}>
            <div style={{fontSize: '3rem', marginBottom: '20px'}}>✨</div>
            <h3>Loading your tasks...</h3>
            <p style={styles.subtitle}>Please wait while we fetch your data</p>
          </div>
        ) : tasks.length === 0 ? (
          <div style={{...styles.tasksCard, ...styles.emptyState}}>
            <div style={{fontSize: '4rem', marginBottom: '20px'}}>🌌</div>
            <h2 style={{fontSize: '2rem', marginBottom: '15px'}}>No tasks TO DO yet!</h2>
            <p style={{...styles.subtitle, marginBottom: '30px'}}>
              Your todo list is empty. Start organizing your journey!
            </p>
            <button 
              style={{...styles.button, ...styles.primaryButton, padding: '16px 40px', fontSize: '1.1rem'}}
              onClick={() => navigate("/add-task")}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(1.05)';
                e.target.style.boxShadow = '0 15px 30px rgba(14, 165, 233, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              🚀 Launch First Task
            </button>
          </div>
        ) : (
          <div style={styles.tasksCard}>
            {tasks.map((task) => (
              <TaskItem key={task._id} task={task} refresh={fetchTasks} />
            ))}
          </div>
        )}
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
        .task-item {
          transition: all 0.3s ease;
        }
        .task-item:hover {
          transform: translateX(10px);
        }
      `}</style>
    </>
  );
}