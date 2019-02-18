import { Injectable } from '@angular/core';
import { Contacts, Contact, ContactField, ContactName, ContactFieldType } from '@ionic-native/contacts/ngx';
import { Platform } from '@ionic/angular';

@Injectable({
   providedIn: 'root'
})
export class AddressbookService {


   private isNative: Boolean = false; //TODO: comment out this check for production release
   constructor(private contacts: Contacts, private platform: Platform) {
      //TODO: comment out this check for production release
      this.platform.ready().then(() => {
         if (this.platform.is('cordova')) {
            // native API
            this.isNative = true;
         }
      });
   }

   getAllAddressbookContacts(): Promise<Contact[]> {
      //TODO: clean up and request real data that we need
      // how to turn off so we don't have errors when testing locally, maybe figure way to mock data when not on device??
      // consider ['*']
      var allContacts;
      var opts = {
         //filter: "M",
         multiple: true,
         //hasPhoneNumber: true,
         fields: ['displayName', 'name']
      };

      //TODO: comment out this check for production release
      if (this.isNative === true) {
         return this.contacts.find(['*'], opts).then(
            (contactsFound) => {
               console.log('Contact found!', contactsFound)
               return contactsFound;
            },
            (error: any) => {
               //TODO: handle known error cases like denied permissions.
               console.error('Error finding contacts.', error);
               return Promise.resolve(undefined);
            }
         );
      } else {
         return this.returnMockContacts();
      }
   }

   //TODO: comment out this check for production release
   async returnMockContacts(): Promise<Contact[]> {
      //cannot use contact create API here, won't work correctly
      let testContact = new Contact();

      let mockContact = Object.assign({}, testContact);
      mockContact.id = "1234567890";
      mockContact.rawId = null;
      mockContact.displayName = null,
         mockContact.name = new ContactName(null, 'Smith', 'Tom');
      mockContact.nickname = null;
      mockContact.phoneNumbers = [new ContactField('mobile', '321-475-9999')];
      mockContact.emails = [new ContactField('personal', 'tomsmith@upbook.com')];
      mockContact.addresses = null;
      mockContact.ims = null;
      mockContact.organizations = null;
      mockContact.birthday = null;
      mockContact.note = null;
      mockContact.photos = null;
      mockContact.categories = null;
      mockContact.urls = null;

      return await [mockContact];
   }

}
