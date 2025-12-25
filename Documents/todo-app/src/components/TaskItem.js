import React, { useState } from "react";
import { API } from "../services/api";
import PriorityBadge from "./PriorityBadge";

const styles = {
  taskItem: {
    background: 'rgba(30, 41, 59, 0.6)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '25px',
    marginBottom: '15px',
    border: '1px solid rgba(51, 65, 85, 0.3)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  taskTitle: {
    fontSize: '1.4rem',
    fontWeight: '600',
    color: '#f8fafc',
    marginRight: '20px',
    flex: 1,
  },
  taskContent: {
    marginBottom: '20px',
  },
  taskDescription: {
    color: '#94a3b8',
    fontSize: '1rem',
    lineHeight: '1.5',
    marginBottom: '15px',
  },
  taskMeta: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  deadlineBadge: {
    background: 'rgba(14, 165, 233, 0.1)',
    color: '#22d3ee',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  statusBadge: {
    background: 'rgba(34, 197, 94, 0.1)',
    color: '#22c55e',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.9rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  pendingBadge: {
    background: 'rgba(251, 191, 36, 0.1)',
    color: '#fbbf24',
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
    marginTop: '20px',
  },
  iconButton: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    transition: 'all 0.3s ease',
  },
  completeButton: {
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
  },
  deleteButton: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
    color: 'white',
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at 50% 0%, rgba(14, 165, 233, 0.1), transparent 70%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
};

export default function TaskItem({ task, refresh }) {
  const [isHovered, setIsHovered] = useState(false);
  const token = localStorage.getItem("token");

  const toggle = async () => {
    try {
      await API.put(
        `/tasks/${task._id}`,
        { completed: !task.completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      refresh();
    } catch (error) {
      console.error("Failed to toggle task:", error);
    }
  };

  const remove = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await API.delete(`/tasks/${task._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        refresh();
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilDeadline = (dateString) => {
    if (!dateString) return null;
    const deadline = new Date(dateString);
    const today = new Date();
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)} days`, className: 'overdue' };
    if (diffDays === 0) return { text: 'Due today', className: 'due-today' };
    if (diffDays === 1) return { text: 'Due tomorrow', className: 'due-soon' };
    if (diffDays <= 7) return { text: `Due in ${diffDays} days`, className: 'due-soon' };
    return { text: `Due ${formatDate(dateString)}`, className: 'due-later' };
  };

  const deadlineInfo = getDaysUntilDeadline(task.deadline);

  return (
    <>
      <div 
        style={{
          ...styles.taskItem,
          transform: isHovered ? 'translateX(10px) translateY(-5px)' : 'none',
          boxShadow: isHovered ? '0 15px 35px rgba(0, 0, 0, 0.3)' : 'none',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glow effect on hover */}
        <div 
          style={{
            ...styles.glowEffect,
            opacity: isHovered ? 1 : 0,
          }}
        />
        
        <div style={styles.taskHeader}>
          <h3 style={styles.taskTitle}>
            {task.title}
            {task.completed && (
              <span style={{
                fontSize: '1rem',
                marginLeft: '10px',
                color: '#10b981',
              }}>✓</span>
            )}
          </h3>
          <PriorityBadge priority={task.priority} />
        </div>

        <div style={styles.taskContent}>
          {task.description && (
            <p style={styles.taskDescription}>
              {task.description}
            </p>
          )}
          
          <div style={styles.taskMeta}>
            <div style={styles.deadlineBadge}>
              <span>📅</span>
              <span>{deadlineInfo.text}</span>
            </div>
            
            <div 
              style={{
                ...styles.statusBadge,
                ...(task.completed ? {} : styles.pendingBadge),
                color: task.completed ? '#22c55e' : '#fbbf24',
              }}
            >
              <span>{task.completed ? '✅' : '⏳'}</span>
              <span>{task.completed ? "Completed" : "Pending"}</span>
            </div>
          </div>
        </div>

        <div style={styles.actionButtons}>
          <button
            onClick={toggle}
            style={{
              ...styles.iconButton,
              ...styles.completeButton,
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}
            title={task.completed ? "Mark as pending" : "Mark as complete"}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            {task.completed ? '↩' : '✓'}
          </button>
          
          <button
            onClick={remove}
            style={{
              ...styles.iconButton,
              ...styles.deleteButton,
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            }}
            title="Delete task"
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.4)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
          >
            🗑
          </button>
        </div>
      </div>
      <style>{`
        .overdue { color: #ef4444 !important; background: rgba(239, 68, 68, 0.1) !important; }
        .due-today { color: #f59e0b !important; background: rgba(245, 158, 11, 0.1) !important; }
        .due-soon { color: #fbbf24 !important; background: rgba(251, 191, 36, 0.1) !important; }
        .due-later { color: #22d3ee !important; background: rgba(34, 211, 238, 0.1) !important; }
        
        .task-item-enter {
          opacity: 0;
          transform: translateY(20px);
        }
        .task-item-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: all 0.3s ease;
        }
        .task-item-exit {
          opacity: 1;
          transform: scale(1);
        }
        .task-item-exit-active {
          opacity: 0;
          transform: scale(0.9);
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
}