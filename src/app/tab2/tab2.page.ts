import { Component } from '@angular/core';
import { AddressbookService } from '../addressbook/addressbook.service';
import { Platform } from '@ionic/angular';

@Component({
   selector: 'app-tab2',
   templateUrl: 'tab2.page.html',
   styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

   userUuid;

   constructor(private addressbookService: AddressbookService, private platform: Platform) {
      console.info('Tab2Page constructor');

      //TODO: probably not necessary, but leave for now
      this.platform.ready().then((readySource) => {
         // Platform now ready, execute any required native code
         console.log('Platform ready from', readySource);
         addressbookService.getAllAddressbookContacts();
      });
   }

   getContacts() {
      this.addressbookService.getAllAddressbookContacts();
   }
}
