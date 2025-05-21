import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  // Demo features to highlight on the homepage
  features = [
    {
      title: 'Angular Frontend',
      description: 'Modern, responsive UI built with Angular using best practices and modular architecture',
      icon: 'bi-code-slash'
    },
    {
      title: 'Spring Boot Backend',
      description: 'Powerful Java backend with RESTful API endpoints and robust error handling',
      icon: 'bi-server'
    },
    {
      title: 'Full-Stack Integration',
      description: 'Seamless integration between Angular frontend and Spring Boot backend',
      icon: 'bi-stack'
    },
    {
      title: 'Modular Architecture',
      description: 'Maintainable and scalable code organization with feature modules and separation of concerns',
      icon: 'bi-diagram-3'
    }
  ];
}
