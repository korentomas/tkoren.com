import type { MetaFunction, LoaderFunction } from "@vercel/remix";
import { useTheme } from "../context/ThemeContext";
import { useEffect, useRef } from "react";
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
  const { theme, colorScheme, toggleTheme, toggleColorScheme } = useTheme();
  const imageRef = useRef<HTMLDivElement>(null);
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
      targetX = -(deltaY / window.innerHeight) * 20; // Max 20 degrees
      targetY = (deltaX / window.innerWidth) * 30; // Max 30 degrees

      // Calculate Z depth based on mouse distance from center
      const distanceFromCenter = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = Math.sqrt(window.innerWidth * window.innerWidth + window.innerHeight * window.innerHeight) / 2;
      targetZ = (distanceFromCenter / maxDistance) * 20; // Max 20px depth
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      currentZ += (targetZ - currentZ) * 0.08;

      image.style.transform = `perspective(1000px) rotateX(${currentX}deg) rotateY(${currentY}deg) translateZ(${currentZ}px)`;

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="theme-toggle flex justify-end gap-2 mb-8">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-bg-element transition-colors"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
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
              <img
                src={optimizedImagePath}
                alt="Tomás Korenblit"
                draggable="false"
              />
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

            <div className="built-with">
              <p>
                Built with{' '}
                <a href="https://remix.run" target="_blank" rel="noreferrer" className="tech-link">
                  Remix
                </a>, deployed on{' '}
                <a href="https://vercel.com" target="_blank" rel="noreferrer" className="tech-link">
                  Vercel
                </a>.
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="right-side">
            <div className="hero-text">
              <p>I'm a Data Scientist from Buenos Aires, passionate about using technology to solve real-world problems. Whether it's building telescopes to make astronomy accessible, developing AI systems, or creating data-driven solutions, I love combining technical skills with creative problem-solving. Currently pursuing my BSc in Data Science at UNSAM while working on AI data quality at Invisible Technologies.</p>
            </div>

            <div className="sections-grid">
              <section className="current-status">
                <h2>What I'm up to</h2>
                <ul>
                  <li>
                    <span className="highlight">BSc. Data Science</span> @ UNSAM
                    <span className="status">(ongoing)</span>
                  </li>
                  <li>
                    <span className="highlight">QA</span> @ Invisible Technologies
                    <span className="status">(current)</span>
                  </li>
                </ul>
              </section>

              <section className="what-i-do">
                <h2>Technical Focus</h2>
                <ul>
                  <li>LLM data quality and training workflows</li>
                  <li>Bayesian modeling and causal inference</li>
                  <li>Data pipeline automation and ETL systems</li>
                  <li>Interactive data visualization and dashboards</li>
                </ul>
              </section>
            </div>

            <section className="projects">
              <h2>Featured Projects</h2>
              <div className="project-grid">
                <div className="project-card">
                  <a href="https://easy-fix-nine.vercel.app/" target="_blank" rel="noreferrer">
                    <h3>EasyFix</h3>
                    <p>Sports fixture generation service with intelligent constraint handling for venue availability, resource optimization, and weather conditions. Built with modern web technologies and deployed on Vercel.</p>
                    <div className="project-tags">
                      <span className="tag">Optimization</span>
                      <span className="tag">Scheduling</span>
                      <span className="tag">Web App</span>
                      <span className="tag">Vercel</span>
                    </div>
                  </a>
                </div>

                <div className="project-card">
                  <a href="https://boston-crime-deploy.herokuapp.com/" target="_blank" rel="noreferrer">
                    <h3>Boston Crime Analysis</h3>
                    <p>Interactive visualization dashboard for exploring Boston crime data. Built with Pandas for data processing and Plotly with Streamlit for interactive visualization.</p>
                    <div className="project-tags">
                      <span className="tag">Data Analysis</span>
                      <span className="tag">Visualization</span>
                      <span className="tag">Python</span>
                      <span className="tag">Streamlit</span>
                    </div>
                  </a>
                </div>

                <div className="project-card">
                  <a href="https://koren-rev-analysis.herokuapp.com/" target="_blank" rel="noreferrer">
                    <h3>Movie Review Sentiment Analysis</h3>
                    <p>Text classification and sentiment analysis on IMDb reviews with regex preprocessing, TfidfVectorizer, and scikit-learn machine learning models.</p>
                    <div className="project-tags">
                      <span className="tag">NLP</span>
                      <span className="tag">Machine Learning</span>
                      <span className="tag">Python</span>
                      <span className="tag">Flask</span>
                    </div>
                  </a>
                </div>

                <div className="project-card">
                  <a href="https://drive.google.com/drive/folders/1aDnCO67zldJ9amt-db_Z7r7aldit_hnA?usp=sharing" target="_blank" rel="noreferrer">
                    <h3>UNICOPE</h3>
                    <p>3D printing low-cost telescopes to make astronomy as accessible as possible. Designed components for focusers, mounts, and mirror supports with the goal of making, selling and donating telescopes worldwide. Project includes complete design files for DIY replication.</p>
                    <div className="project-tags">
                      <span className="tag">Hardware</span>
                      <span className="tag">CAD</span>
                      <span className="tag">Open Source</span>
                      <span className="tag">3D Printing</span>
                    </div>
                  </a>
                </div>
              </div>
            </section>

            <section className="skills">
              <h2>Technical Stack</h2>
              <div className="skills-grid">
                <div className="skill-category">
                  <h3>Data Science</h3>
                  <div className="skill-tags">
                    <span className="tag">Bayesian Statistics</span>
                    <span className="tag">LLM Workflows</span>
                    <span className="tag">PyMC</span>
                    <span className="tag">Scikit-Learn</span>
                  </div>
                </div>
                <div className="skill-category">
                  <h3>Development</h3>
                  <div className="skill-tags">
                    <span className="tag">Python</span>
                    <span className="tag">SQL</span>
                    <span className="tag">Flask</span>
                    <span className="tag">Git</span>
                  </div>
                </div>
                <div className="skill-category">
                  <h3>Tools & Platforms</h3>
                  <div className="skill-tags">
                    <span className="tag">PowerBI</span>
                    <span className="tag">Google Cloud</span>
                    <span className="tag">Vercel</span>
                    <span className="tag">Docker</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
