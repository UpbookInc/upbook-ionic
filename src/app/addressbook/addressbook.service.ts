import { Injectable } from '@angular/core';
import { Contacts, Contact, ContactField, ContactName } from '@ionic-native/contacts/ngx';

@Injectable({
   providedIn: 'root'
})
export class AddressbookService {

   constructor(private contacts: Contacts) { }

   getAllAddressbookContacts() {
      function onSuccess(contacts) {
         console.log('Found ' + contacts.length + ' contacts.');
      };

      function onError(contactError) {
         console.log('onError!');
      };

      //TODO: clean up and request real data that we need
      // how to turn off so we don't have errors when testing locally, maybe figure way to mock data when not on device??
      var allContacts;
      var opts = {
         //filter: "M",
         multiple: true,
         //hasPhoneNumber: true,
         fields: ['displayName', 'name']
      };
      this.contacts.find(['displayName', 'name'], opts).then(
         (contactsFound) => console.log('Contact found!', contactsFound),
         (error: any) => console.error('Error finding contacts.', error)
      );
      return [];
   }

}
