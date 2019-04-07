import { Injectable } from '@angular/core';
import { Contacts, Contact, ContactField, ContactName, ContactFieldType } from '@ionic-native/contacts/ngx';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { DebugService } from '../debug/debug.service';
import * as _ from 'lodash';

@Injectable({
   providedIn: 'root'
})
export class NetworkStoreService {

   private readonly UB_ADDRESS_BOOK_CONTACTS_KEY = 'UB_ADDRESS_BOOK_CONTACTS';

   private isNative: Boolean = false; //TODO: comment out this check for production release

   private allDeviceContacts;

   constructor(private contacts: Contacts, public storage: Storage, private platform: Platform, private debugService: DebugService) {
      this.platform.ready().then(() => {
         this.debugService.add("AddressbookService.constr: platform ready.");
         if (this.platform.is('cordova')) {
            // native API
            this.isNative = true;
         }
      });
   }

   getUBSelectedNetworkContacts(): Promise<any> {
      return this.getUBDatabaseOfContacts(ubContacts => {
         let inNetworkContacts = ubContacts.filter(contact => contact.inNetwork === true);
         return inNetworkContacts;
      }, errorResults => {
         console.log(errorResults);
         return Promise.resolve(undefined);
      });
   }

   updateMultipleUBContacts(contactsToUpdate: Array<Contact>) {
      this.getUBDatabaseOfContacts(contactsForUpdate => {
         contactsToUpdate.map(contactToUpdate => {
            let filteredContactToUpdateIndex = contactsForUpdate.findIndex(contact => contact.id == contactToUpdate.id);
            if (filteredContactToUpdateIndex > -1) {
               contactsForUpdate[filteredContactToUpdateIndex] = this.parseContactObjectInstanceOutIntoOwnObject(contactToUpdate);
            }
         });
         this.saveContactsToStore(contactsForUpdate);
      }, errorResults => console.log(errorResults));
   }

   getUBDatabaseOfContacts(success, error): Promise<string> {
      return this.storage.get(this.UB_ADDRESS_BOOK_CONTACTS_KEY).then(success, error);
   }

   saveContactsToStore(contactsToSave: Contact[]) {
      let parsedContactsToSave = this.parseJsonStringIntoContactsArray(JSON.stringify(contactsToSave))
      this.storage.set(this.UB_ADDRESS_BOOK_CONTACTS_KEY, parsedContactsToSave);
   }

   private parseJsonStringIntoContactsArray(contactsJsonString: string) {
      let parsedResults = JSON.parse(contactsJsonString);
      let extractedContacts = parsedResults.map(contact => {
         if (contact != null) {
            //pull out contact object from _objectInstance before saving
            if (contact["_objectInstance"] != null || contact["_objectInstance"] != undefined) {
               return contact = <Contact>contact["_objectInstance"];
            } else {
               //otherwise contact object is already parsed
               return contact;
            }
         }
      });
      return extractedContacts;
   }

   parseContactObjectInstanceOutIntoOwnObject(contactToParse: Contact) {
      if (contactToParse["_objectInstance"] != null || contactToParse["_objectInstance"] != undefined) {
         let parsedContact = contactToParse["_objectInstance"];
         //capture all UB custom fields after parse
         parsedContact.inNetwork = contactToParse.inNetwork;
         return parsedContact;
      } else {
         return contactToParse;
      }

   }

   // establishes device contacts object or returns if it's already been set
   getAllAddressbookContactsFromDevice(): Promise<Contact[]> {
      //TODO: comment out this check for production release
      if (this.isNative === true) {
         if (this.allDeviceContacts == null || this.allDeviceContacts == undefined || this.allDeviceContacts.length < 1) {
            return this.queryAllDeviceContacts().then((deviceContacts) => {
               //here we copy (using lodash) the device contacts into a service object to hold the contacts
               this.allDeviceContacts = _.cloneDeep(deviceContacts);
               return Promise.resolve(this.allDeviceContacts);
            });
         } else {
            //we already have queried and stored the device contacts, just return list
            return Promise.resolve(this.allDeviceContacts);
         }
      } else {
         return this.returnMockContacts();
      }
   }

   private queryAllDeviceContacts(): Promise<Contact[]> {
      //TODO: clean up and request actual data that we need
      var opts = {
         //filter: "M",
         multiple: true,
         //hasPhoneNumber: true,
         fields: ['displayName', 'name']
      };
      return this.contacts.find(['*'], opts).then(
         (contactsFound) => {
            //console.log('Contact found!', contactsFound)
            return contactsFound;
         },
         (error: any) => {
            //TODO: handle known error cases like denied permissions.
            console.error('Error finding contacts.', error);
            return Promise.resolve(undefined);
         }
      );
   }

   //TODO: comment out this check for production release
   async returnMockContacts(): Promise<Contact[]> {
      //cannot use contact create API here, won't work correctly

      //mock standard user
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

      //mock contact for empty name.  Tests html template.
      let testContact2 = new Contact();
      let mockContact2 = Object.assign({}, testContact2);
      mockContact2.id = "1234444444";
      mockContact2.rawId = null;
      mockContact2.displayName = null;
      // mockContact2.name = new ContactName(null, 'Joe', 'Desk');
      mockContact2.nickname = null;
      mockContact2.phoneNumbers = [new ContactField('mobile', '321-555-55555')];
      mockContact2.emails = [new ContactField('personal', 'joedesk@upbook.com')];
      mockContact2.addresses = null;
      mockContact2.ims = null;
      mockContact2.organizations = null;
      mockContact2.birthday = null;
      mockContact2.note = null;
      mockContact2.photos = null;
      mockContact2.categories = null;
      mockContact2.urls = null;

      return await [mockContact, mockContact2];
   }
}
