import { bootstrapApplication } from '@angular/platform-browser';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [provideIonicAngular({ mode: 'md' })],
}).catch((err: unknown) => console.error('Falha ao iniciar ContaCerta:', err));
