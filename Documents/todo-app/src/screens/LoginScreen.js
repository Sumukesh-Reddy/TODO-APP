import React, { useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StarsBackground = () => {
  useEffect(() => {
    const container = document.getElementById('stars-background');
    
    // Create static stars
    for (let i = 0; i < 250; i++) {
      const star = document.createElement('div');
      star.style.position = 'absolute';
      star.style.backgroundColor = 'white';
      star.style.borderRadius = '50%';
      star.style.width = Math.random() * 4 + 1 + 'px';
      star.style.height = star.style.width;
      star.style.left = Math.random() * 100 + 'vw';
      star.style.top = Math.random() * 100 + 'vh';
      star.style.opacity = Math.random() * 0.8 + 0.2;
      
      if (Math.random() > 0.6) {
        star.style.animation = `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`;
      }
      
      container.appendChild(star);
    }
    
    // Create moving stars
    for (let i = 0; i < 80; i++) {
      const star = document.createElement('div');
      star.style.position = 'absolute';
      star.style.backgroundColor = 'white';
      star.style.borderRadius = '50%';
      star.style.width = Math.random() * 3 + 1 + 'px';
      star.style.height = star.style.width;
      star.style.left = Math.random() * 100 + 'vw';
      star.style.top = Math.random() * 100 + 'vh';
      star.style.opacity = Math.random() * 0.9 + 0.1;
      
      const animationNum = Math.floor(Math.random() * 3) + 1;
      const duration = 25 + Math.random() * 20;
      star.style.animation = `moveStar${animationNum} ${duration}s linear infinite`;
      
      container.appendChild(star);
    }
    
    // Create shooting stars
    for (let i = 0; i < 5; i++) {
      const shootingStar = document.createElement('div');
      shootingStar.style.position = 'absolute';
      shootingStar.style.width = '100px';
      shootingStar.style.height = '2px';
      shootingStar.style.background = 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8))';
      shootingStar.style.left = Math.random() * 100 + 'vw';
      shootingStar.style.top = Math.random() * 100 + 'vh';
      shootingStar.style.opacity = '0';
      shootingStar.style.animation = `shootingStar ${3 + Math.random() * 4}s linear infinite ${Math.random() * 5}s`;
      container.appendChild(shootingStar);
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
    background: 'linear-gradient(135deg, #0f172a 0%, #1a1a2e 100%)',
    color: '#f8fafc',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    position: 'relative',
  },
  loginCard: {
    width: '100%',
    maxWidth: '480px',
    background: 'rgba(30, 41, 59, 0.8)',
    backdropFilter: 'blur(15px)',
    borderRadius: '24px',
    padding: '50px 40px',
    border: '1px solid rgba(51, 65, 85, 0.4)',
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5)',
    textAlign: 'center',
    marginBottom: '50px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '25px',
  },
  logoIcon: {
    width: '70px',
    height: '70px',
    background: 'linear-gradient(135deg, #0ea5e9, #22d3ee)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 'bold',
    color: 'white',
    boxShadow: '0 10px 20px rgba(14, 165, 233, 0.3)',
  },
  title: {
    fontSize: '3.5rem',
    background: 'linear-gradient(135deg, #0ea5e9, #22d3ee)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '10px',
    fontWeight: '800',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1.2rem',
    marginBottom: '40px',
    lineHeight: '1.6',
  },
  divider: {
    position: 'relative',
    margin: '40px 0',
    color: '#64748b',
    fontSize: '14px',
  },
  googleButtonContainer: {
    margin: '30px 0',
    display: 'flex',
    justifyContent: 'center',
  },
  features: {
    display: 'flex',
    gap: '40px',
    marginTop: '30px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  feature: {
    background: 'rgba(30, 41, 59, 0.6)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '25px',
    textAlign: 'center',
    minWidth: '200px',
    border: '1px solid rgba(51, 65, 85, 0.3)',
    transition: 'all 0.3s ease',
  },
  featureIcon: {
    fontSize: '40px',
    marginBottom: '15px',
  },
  footerText: {
    marginTop: '40px',
    fontSize: '12px',
    color: '#64748b',
    lineHeight: '1.6',
    maxWidth: '400px',
  },
  dividerLine: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, #334155, transparent)',
    margin: '30px 0',
  },
  glowText: {
    textShadow: '0 0 20px rgba(14, 165, 233, 0.5)',
  },
};

export default function LoginScreen() {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post("http://localhost:3001/auth/google", {
        token: credentialResponse.credential
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/home");
    } catch (err) {
      alert("Google login failed");
      console.error(err);
    }
  };

  return (
    <>
      <StarsBackground />
      <div style={styles.container}>
        <div style={styles.loginCard}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>🚀</div>
            <h1 style={styles.title}>TODO APP</h1>
          </div>
          
          <p style={styles.subtitle}>
            Organize your tasks with  task manager. 
            Secure, fast, and out of this world!
          </p>

          <div style={styles.dividerLine}></div>

          <h3 style={{ marginBottom: '30px', fontSize: '1.4rem', ...styles.glowText }}>
            Begin Your TODO Journey
          </h3>

          <div style={styles.googleButtonContainer}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert("Failed to connect to the cosmos")}
              theme="filled_blue"
              size="large"
              shape="pill"
              text="continue_with"
              width="300"
            />
          </div>

         
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
        @keyframes shootingStar {
          0% {
            opacity: 0;
            transform: translateX(0) translateY(0) rotate(45deg);
          }
          10% {
            opacity: 1;
          }
          70% {
            opacity: 1;
            transform: translateX(-400px) translateY(200px) rotate(45deg);
          }
          100% {
            opacity: 0;
            transform: translateX(-400px) translateY(200px) rotate(45deg);
          }
        }
        body {
          margin: 0;
          overflow-x: hidden;
        }
        .google-login-button {
          transition: all 0.3s ease !important;
        }
        .google-login-button:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 10px 30px rgba(14, 165, 233, 0.3) !important;
        }
      `}</style>
    </>
  );
}