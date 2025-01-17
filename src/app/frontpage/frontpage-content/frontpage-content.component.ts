import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button'; 
import {MatToolbarModule} from '@angular/material/toolbar'; 
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-frontpage-content',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './frontpage-content.component.html',
  styleUrl: './frontpage-content.component.scss'
})
export class FrontpageContentComponent {

}
