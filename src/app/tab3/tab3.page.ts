import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { DebugService } from '../debug/debug.service';
import { Contacts, Contact, ContactField, ContactName, ContactFieldType } from '@ionic-native/contacts/ngx';
import { ContactsService } from '../contacts/contacts.service';

@Component({
   selector: 'app-tab3',
   templateUrl: 'tab3.page.html',
   styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

   private readonly UB_ADDRESS_BOOK_CONTACTS_KEY = 'UB_ADDRESS_BOOK_CONTACTS';
   debugStatements: String;
   constructor(private storage: Storage, private debugService: DebugService, private contactService: ContactsService) {

   }

   updateContact() {
      var testContact = new Contact();
      this.contactService.updateContact(testContact);
   }

   deleteUBNetwork() {
      this.storage.set(this.UB_ADDRESS_BOOK_CONTACTS_KEY, undefined);
      console.log("UB network deleted");
   }

   printUBNetwork() {
      console.log("UB network printed");
      this.storage.get(this.UB_ADDRESS_BOOK_CONTACTS_KEY).then(result => {
         console.log(result);
      });
   }

   getAllDebugStatements() {
      this.debugStatements = this.debugService.get();
   }
}
