import type { MetaFunction, LoaderFunction } from "@vercel/remix";
import { useTheme } from "~/context/ThemeContext";
import { useEffect, useRef, useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { optimizeImage } from "~/utils/imageOptimizer";

export const loader: LoaderFunction = async () => {
  const optimizedImagePath = await optimizeImage('also_me.png', {
    width: 800,
    quality: 90,
    format: 'webp'
  });

  // Ensure the path starts with a forward slash
  const imagePath = optimizedImagePath.startsWith('/') ? optimizedImagePath : `/${optimizedImagePath}`;

  return json({ optimizedImagePath: imagePath });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Tomás Korenblit | Data Scientist" },
    { name: "description", content: "Data Scientist specializing in Bayesian methods and Machine Learning. Portfolio showcasing projects in data analysis, machine learning, and statistical modeling." },
    { name: "keywords", content: "Data Science, Machine Learning, Bayesian Statistics, PyMC, Data Analysis" },
    { name: "author", content: "Tomás Korenblit" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { property: "og:title", content: "Tomás Korenblit | Data Scientist" },
    { property: "og:description", content: "Data Scientist specializing in Bayesian methods and Machine Learning. Portfolio showcasing projects in data analysis, machine learning, and statistical modeling." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: "Tomás Korenblit | Data Scientist" },
    { name: "twitter:description", content: "Data Scientist specializing in Bayesian methods and Machine Learning. Portfolio showcasing projects in data analysis, machine learning, and statistical modeling." },
    { rel: "preload", as: "image", href: "/optimized-images/also_me-800w-90q.webp" }
  ];
};

export default function Index() {
  const { theme, toggleTheme } = useTheme();
  const imageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const { optimizedImagePath } = useLoaderData<{ optimizedImagePath: string }>();

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    let currentX = 0;
    let currentY = 0;
    let currentZ = 0;
    let targetX = 0;
    let targetY = 0;
    let targetZ = 0;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = image.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate distance from center of image
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      
      // Calculate target rotation based on distance from center
      // Negative sign only for vertical rotation
      targetX = -(deltaY / window.innerHeight) * 20; // Max 20 degrees
      targetY = (deltaX / window.innerWidth) * 30; // Max 30 degrees
      
      // Calculate Z depth based on mouse distance from center
      const distanceFromCenter = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight) / 2;
      targetZ = (distanceFromCenter / maxDistance) * 20; // Max 20px depth
    };

    const animate = () => {
      // Slightly faster interpolation for more responsive movement
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      currentZ += (targetZ - currentZ) * 0.08;

      // Apply the transform with perspective and Z translation
      image.style.transform = `perspective(1000px) rotateX(${currentX}deg) rotateY(${currentY}deg) translateZ(${currentZ}px)`;

      animationFrameId = requestAnimationFrame(animate);
    };

    // Start animation loop
    animate();

    // Add event listener to window
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      // Cleanup
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Draw placeholder on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.05)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Image failed to load:', e);
    setIsLoading(false);
    setImageError(true);
  };

  console.log('Current image path:', optimizedImagePath);

  return (
    <div className="main-container" role="main">
      <div className="theme-toggle">
        <button 
          onClick={toggleTheme} 
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          aria-pressed={theme === 'dark'}
        >
          {theme === 'light' ? (
            <svg className="moon-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : (
            <svg className="sun-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          )}
        </button>
      </div>

      <div className="split-layout">
        {/* Left Side */}
        <div className="left-side">
          <h1 className="name">Tomás Pablo Korenblit</h1>
          <h2 className="title">Data Scientist</h2>
          <div className="profile-image" ref={imageRef}>
            {/* <canvas ref={canvasRef} className={isLoading ? 'visible' : ''} /> */}
            <img 
              src={optimizedImagePath}
              alt="Tomás Korenblit" 
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={isLoading ? 'loading' : 'loaded'}
              draggable="false"
            />
            {imageError && (
              <div className="image-error">
                Failed to load image
              </div>
            )}
          </div>
          
          <div className="social-icons">
            <a href="https://github.com/tomaskorenblit" target="_blank" rel="noreferrer" aria-label="GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
            <a href="https://linkedin.com/in/tomaskorenblit" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
            <a href="mailto:tomaskorenblit@gmail.com" aria-label="Email">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </a>
          </div>
        </div>

        {/* Right Side */}
        <div className="right-side">
          <div className="hero-text">
            <p>Driven by curiosity, I've spent years crafting solutions to complex problems—whether it's developing apps or applying machine learning models. Now, as a data scientist, I continue to innovate and create technologies that transform ideas into results.</p>
          </div>
          
          <section className="what-i-do">
            <h2>What I Do</h2>
            <ul>
              <li>Bayesian statistical modeling with PyMC</li>
              <li>Advanced ML optimization techniques</li>
              <li>GPU-accelerated model training</li>
            </ul>
          </section>

          <section className="projects">
            <h2>My Projects</h2>
            <div className="project-grid">
              <div className="project-card">
                <a href="https://boston-crime-deploy.herokuapp.com/" target="_blank" rel="noreferrer">
                  <h3>Boston Crime Analysis</h3>
                  <p>Interactive visualizations of Boston crime report data using Pandas, Plotly and Streamlit.</p>
                  <div className="project-tags">
                    <span className="tag">Data Analysis</span>
                    <span className="tag">Visualization</span>
                    <span className="tag">Python</span>
                  </div>
                </a>
              </div>
              
              <div className="project-card">
                <a href="https://koren-rev-analysis.herokuapp.com/" target="_blank" rel="noreferrer">
                  <h3>Movie Review Sentiment Analysis</h3>
                  <p>Text classification and sentiment analysis on IMDb reviews with regex preprocessing, TfidfVectorizer, and sklearn.</p>
                  <div className="project-tags">
                    <span className="tag">NLP</span>
                    <span className="tag">Machine Learning</span>
                    <span className="tag">Python</span>
                  </div>
                </a>
              </div>
              <div className="project-card">
                <a href="https://koren-rev-analysis.herokuapp.com/" target="_blank" rel="noreferrer">
                  <h3>Movie Review Sentiment Analysis</h3>
                  <p>Text classification and sentiment analysis on IMDb reviews with regex preprocessing, TfidfVectorizer, and sklearn.</p>
                  <div className="project-tags">
                    <span className="tag">NLP</span>
                    <span className="tag">Machine Learning</span>
                    <span className="tag">Python</span>
                  </div>
                </a>
              </div>
              <div className="project-card">
                <a href="https://koren-rev-analysis.herokuapp.com/" target="_blank" rel="noreferrer">
                  <h3>Movie Review Sentiment Analysis</h3>
                  <p>Text classification and sentiment analysis on IMDb reviews with regex preprocessing, TfidfVectorizer, and sklearn.</p>
                  <div className="project-tags">
                    <span className="tag">NLP</span>
                    <span className="tag">Machine Learning</span>
                    <span className="tag">Python</span>
                  </div>
                </a>
              </div>
              <div className="project-card">
                <a href="https://koren-rev-analysis.herokuapp.com/" target="_blank" rel="noreferrer">
                  <h3>Movie Review Sentiment Analysis</h3>
                  <p>Text classification and sentiment analysis on IMDb reviews with regex preprocessing, TfidfVectorizer, and sklearn.</p>
                  <div className="project-tags">
                    <span className="tag">NLP</span>
                    <span className="tag">Machine Learning</span>
                    <span className="tag">Python</span>
                  </div>
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
