import { Component, ElementRef, OnInit, OnDestroy, ViewChild, NgZone, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-network-background',
  standalone: true,
  template: `
    <canvas #canvas class="fixed inset-0 pointer-events-none z-0 opacity-30"></canvas>
  `,
  styles: [`
    :host {
      display: block;
      pointer-events: none;
    }
  `]
})
export class NetworkBackground implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  
  private ctx!: CanvasRenderingContext2D;
  private animationId!: number;
  private particles: Particle[] = [];
  private zone = inject(NgZone);
  private platformId = inject(PLATFORM_ID);
  
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initCanvas();
      this.zone.runOutsideAngular(() => {
        this.animate();
      });
      window.addEventListener('resize', this.onResize.bind(this));
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      cancelAnimationFrame(this.animationId);
      window.removeEventListener('resize', this.onResize.bind(this));
    }
  }

  private initCanvas() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.onResize();
    this.createParticles();
  }

  private onResize() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.createParticles();
  }

  private createParticles() {
    const density = 0.00005; // Adjust density
    const particleCount = Math.floor(window.innerWidth * window.innerHeight * density);
    this.particles = [];
    for (let i = 0; i < particleCount; i++) {
      this.particles.push(new Particle(window.innerWidth, window.innerHeight));
    }
  }

  private animate() {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.update(window.innerWidth, window.innerHeight);
      p.draw(this.ctx);
      
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(16, 185, 129, ${1 - distance / 150})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }
    
    this.animationId = requestAnimationFrame(this.animate.bind(this));
  }
}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;

  constructor(width: number, height: number) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = Math.random() * 2 + 1;
  }

  update(width: number, height: number) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > width) this.vx = -this.vx;
    if (this.y < 0 || this.y > height) this.vy = -this.vy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
  }
}
