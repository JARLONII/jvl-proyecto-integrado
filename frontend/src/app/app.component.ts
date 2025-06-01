import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from "./components/menu/menu.component";
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MenuComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html'
})
export class AppComponent {
  mostrarMenu = false;
  mostrarFooter = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Solo muestra menú/footer si el usuario está logueado
        this.mostrarMenu = this.authService.isLoggedIn();
        this.mostrarFooter = this.authService.isLoggedIn();
      }
    });
  }
}
