import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-dialog-sent-money',
  standalone: true,
  imports: [   MatDialogModule,
      // MatDialogClose,
      MatFormFieldModule,
      MatOption,
      MatSelectModule,
      MatInputModule,
      MatDatepickerModule,
      MatButtonModule,
      FormsModule],
  templateUrl: './dialog-send-money.component.html',
  styleUrl: './dialog-send-money.component.scss'
})
export class DialogSendMoneyComponent {

}
