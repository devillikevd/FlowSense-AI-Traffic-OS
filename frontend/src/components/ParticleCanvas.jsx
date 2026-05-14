import { useEffect, useRef } from "react";

export default function ParticleCanvas() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let particles = [];
    const PARTICLE_COUNT = 70;
    const CONNECTION_DIST = 150;
    const MOUSE_RADIUS = 200;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      // Update CSS custom properties for cursor glow
      document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
      document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
    };
    window.addEventListener("mousemove", handleMouse);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        this.baseRadius = Math.random() * 1.8 + 0.5;
        this.radius = this.baseRadius;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.baseOpacity = this.opacity;
        // Use a richer color palette
        const colors = [230, 185, 260, 160];
        this.hue = colors[Math.floor(Math.random() * colors.length)];
        this.pulseOffset = Math.random() * Math.PI * 2;
      }
      update(time) {
        // Subtle pulse
        this.radius = this.baseRadius + Math.sin(time * 0.002 + this.pulseOffset) * 0.3;
        this.opacity = this.baseOpacity + Math.sin(time * 0.001 + this.pulseOffset) * 0.05;

        // Mouse repulsion
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const dx = this.x - mx;
        const dy = this.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (1 - dist / MOUSE_RADIUS) * 0.8;
          this.vx += (dx / dist) * force;
          this.vy += (dy / dist) * force;
        }

        // Damping
        this.vx *= 0.99;
        this.vy *= 0.99;

        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 75%, 68%, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    const animate = (time) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections with gradient
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.07;
            const grad = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            grad.addColorStop(0, `hsla(${particles[i].hue}, 70%, 65%, ${alpha})`);
            grad.addColorStop(1, `hsla(${particles[j].hue}, 70%, 65%, ${alpha})`);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw mouse connections
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      if (mx > 0) {
        for (let i = 0; i < particles.length; i++) {
          const dx = particles[i].x - mx;
          const dy = particles[i].y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS) {
            const alpha = (1 - dist / MOUSE_RADIUS) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mx, my);
            ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update(time);
        p.draw();
      });

      animId = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.55,
      }}
    />
  );
}
