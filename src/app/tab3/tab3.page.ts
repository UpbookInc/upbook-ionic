import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';

@Component({
   selector: 'app-tab3',
   templateUrl: 'tab3.page.html',
   styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

   private readonly UB_ADDRESS_BOOK_CONTACTS_KEY = 'UB_ADDRESS_BOOK_CONTACTS';

   constructor(private storage: Storage) {

   }
   deleteUBNetwork() {
      this.storage.set(this.UB_ADDRESS_BOOK_CONTACTS_KEY, undefined);
      console.log("UB network deleted");
   }
}
