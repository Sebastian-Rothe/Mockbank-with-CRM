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
  selector: 'app-dialog-open-new-pocket',
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
  templateUrl: './dialog-open-new-pocket.component.html',
  styleUrl: './dialog-open-new-pocket.component.scss'
})
export class DialogOpenNewPocketComponent {

}
