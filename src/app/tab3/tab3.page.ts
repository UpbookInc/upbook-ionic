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
   private readonly UB_PROFILE_KEY = 'UB_PROFILE';
   debugStatements: String;

   constructor(private storage: Storage, private debugService: DebugService, private contactService: ContactsService) { }

   deleteUBNetwork() {
      this.storage.set(this.UB_ADDRESS_BOOK_CONTACTS_KEY, undefined);
      console.log("UB network deleted");
   }

   deleteUBNProfile() {
      this.storage.set(this.UB_PROFILE_KEY, undefined);
      console.log("UB profile deleted");
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

   // createTestContacts() {
   //    let phoneNumberFirstSix = "555555";
   //    let lastFourConter = 1000;
   //    const CONTACT_COUNT_TO_CREATE = 1200;


   //    for (let x = 0; x < CONTACT_COUNT_TO_CREATE; x++) {
   //       let contactToSave = new Contact();
   //       contactToSave.name = {
   //          givenName: this.generateRandomString(Math.floor(Math.random() * (7 - 4 + 1) + 4)),
   //          familyName: this.generateRandomString(Math.floor(Math.random() * (7 - 4 + 1) + 4))
   //       };
   //       contactToSave.phoneNumbers = [{value: phoneNumberFirstSix + (lastFourConter++) }]
   //       console.log(contactToSave);
   //       this.contactService.saveNewContact(contactToSave, success => {
   //          console.log("saved successfully");
   //       }, failure => {
   //          console.log("save failed");
   //       });
   //    }
   // }

   private generateRandomString(length) {
      var text = "";
      var possible = "abcdefghijklmnopqrstuvwxyz";

      for (var i = 0; i < length; i++)
         text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
   }
}
