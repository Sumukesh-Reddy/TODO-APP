const styles = {
    badge: {
      color: 'white',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '0.9rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
    },
    pulseEffect: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '100%',
      height: '100%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.3) 1%, transparent 60%)',
      transform: 'translate(-50%, -50%) scale(0)',
      animation: 'pulse 2s infinite',
    },
  };
  
  export default function PriorityBadge({ priority }) {
    const priorityMap = {
      1: { 
        label: "High", 
        color: "#ef4444",
        gradient: "linear-gradient(135deg, #ef4444, #dc2626)",
        icon: "🔥",
        glow: "0 0 20px rgba(239, 68, 68, 0.4)"
      },
      2: { 
        label: "Medium", 
        color: "#f59e0b",
        gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
        icon: "⚡",
        glow: "0 0 20px rgba(245, 158, 11, 0.4)"
      },
      3: { 
        label: "Low", 
        color: "#10b981",
        gradient: "linear-gradient(135deg, #10b981, #059669)",
        icon: "💧",
        glow: "0 0 20px rgba(16, 185, 129, 0.4)"
      }
    };
  
    const priorityInfo = priorityMap[priority];
  
    return (
      <>
        <div 
          style={{
            ...styles.badge,
            background: priorityInfo.gradient,
            boxShadow: `0 6px 20px ${priorityInfo.color}40`,
          }}
          className="priority-badge"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
            e.currentTarget.style.boxShadow = `0 10px 25px ${priorityInfo.color}60`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = `0 6px 20px ${priorityInfo.color}40`;
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>{priorityInfo.icon}</span>
          <span>{priorityInfo.label}</span>
          {priority === 1 && (
            <div style={styles.pulseEffect} />
          )}
        </div>
        <style>{`
          @keyframes pulse {
            0% {
              transform: translate(-50%, -50%) scale(0);
              opacity: 1;
            }
            70% {
              transform: translate(-50%, -50%) scale(1.5);
              opacity: 0;
            }
            100% {
              transform: translate(-50%, -50%) scale(1.5);
              opacity: 0;
            }
          }
          
          .priority-badge {
            animation: float 3s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-5px);
            }
          }
          
          .priority-badge:hover {
            animation: none;
          }
        `}</style>
      </>
    );
  }