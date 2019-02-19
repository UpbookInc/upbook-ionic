import { Injectable } from '@angular/core';
import { Contacts, Contact, ContactField, ContactName, ContactFieldType } from '@ionic-native/contacts/ngx';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Injectable({
   providedIn: 'root'
})
export class AddressbookService {

   private readonly UB_ADDRESS_BOOK_CONTACTS_KEY = 'UB_ADDRESS_BOOK_CONTACTS';

   private isNative: Boolean = false; //TODO: comment out this check for production release
   constructor(private contacts: Contacts, public storage: Storage, private platform: Platform) {
      //TODO: comment out this check for production release
      this.platform.ready().then(() => {
         if (this.platform.is('cordova')) {
            // native API
            this.isNative = true;
         }
      });
   }

   isAddressBookSavedToUBDatabase(): Promise<any> {
      return this.storage.get(this.UB_ADDRESS_BOOK_CONTACTS_KEY);
   }

   updateUBContact(contactToUpdate: Contact) {
      this.storage.get(this.UB_ADDRESS_BOOK_CONTACTS_KEY).then(contactsForUpdate => {
            let filteredContactToUpdateIndex = contactsForUpdate.findIndex(contact => contact.id == contactToUpdate.id);
            if (filteredContactToUpdateIndex > -1) {
               contactsForUpdate[filteredContactToUpdateIndex] = contactToUpdate;
               this.saveContactsToStore(contactsForUpdate);
            }
         }
      );
   }

   getUBDatabaseOfContacts(): Promise<Contact[]> {
      return this.storage.get(this.UB_ADDRESS_BOOK_CONTACTS_KEY);
   }

   //TODO: only use this on initial run to get contacts.  Or maybe to refresh with UB db for differences?
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

   saveContactsToStore(contactsToSave: Contact[]) {
      this.storage.set(this.UB_ADDRESS_BOOK_CONTACTS_KEY, contactsToSave);
   }

   //TODO: comment out this check for production release
   async returnMockContacts(): Promise<Contact[]> {
      //cannot use contact create API here, won't work correctly
      let testContact = new Contact();

      let mockContact = Object.assign({}, testContact);
      mockContact.id = "1234567890";
      mockContact.rawId = null;
      mockContact.displayName = null;
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
