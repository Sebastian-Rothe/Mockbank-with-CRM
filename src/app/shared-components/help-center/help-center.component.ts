import { Component} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [MatExpansionModule],
  templateUrl: './help-center.component.html',
  styleUrl: './help-center.component.scss'
})
export class HelpCenterComponent {
  faqItems = [
    { question: 'How do I create an account?', answer: 'Go to the signup page and enter your details.' },
    { question: 'How do I transfer money?', answer: 'Go to the transfer section and enter recipient details.' },
    { question: 'How is interest calculated?', answer: 'Interest is calculated daily based on your total balance.' },
    { question: 'What should I do if I forgot my password?', answer: 'Use the forgot password link on the login page.' }
  ];
}
