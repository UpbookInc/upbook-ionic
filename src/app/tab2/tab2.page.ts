import { Component } from '@angular/core';
import { AddressbookService } from '../addressbook/addressbook.service';
import { Platform } from '@ionic/angular';
import { Contact } from '@ionic-native/contacts/ngx';
import { ProfileService } from '../profile/service/profile.service';

@Component({
   selector: 'app-tab2',
   templateUrl: 'tab2.page.html',
   styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

   private userUuid: String;
   private allContacts: Array<Contact>;

   constructor(private addressbookService: AddressbookService, private platform: Platform, private profileService: ProfileService) {
      //TODO: probably not necessary, but leave for now
      this.platform.ready().then((readySource) => {
         // Platform now ready, execute any required native code
         console.log('Platform ready from', readySource);
         this.getUBContacts();
      });
   }

   getUBContacts() {
      this.addressbookService.getUBDatabaseOfContacts().then(
         (contactsFound) => {
            this.allContacts = contactsFound;
            console.log(this.allContacts);
            this.checkIsAddressBookSavedToUBDatabase();
         }
      );
   }

   toggleContactForNetwork(contactToToggleForNetwork: Contact) {
      console.log(contactToToggleForNetwork);
      this.addressbookService.updateUBContact(contactToToggleForNetwork);
   }

   sendProfileToNetwork() {
      // profileService
   }

   private checkIsAddressBookSavedToUBDatabase() {
      this.addressbookService.isAddressBookSavedToUBDatabase().then(result => {
         if (result == null || result == undefined || result == '') {
            console.log("UB Addressbook to be created");
            //TODO: gather and save UB address book data
            this.addressbookService.saveContactsToStore(this.allContacts);
         } else {
            console.log("UB addressbook database already exists");
         }
      });
   }
}
