import { Injectable } from '@angular/core';
import { Contact, Contacts, ContactField } from '@ionic-native/contacts/ngx';
import { DebugService } from '../debug/debug.service';

@Injectable({
   providedIn: 'root'
})
export class ContactsService {

   constructor(private contacts: Contacts, private debugService: DebugService) { }

   // TODO:
   // - finish other deltas
   // - handle other fields
   // contactFound.displayName;
   // contactFound.emails;
   // contactFound.phoneNumbers;
   // contactFound.addresses;

   buildContactWithUpdates(contactWithUpdates): Promise<Contact> {

      return this.findContactByName(contactWithUpdates.displayName).then(contactFound => {
         this.debugService.add("ContactsService.buildContactWithUpdates: Contact found");
         var contactToUpdate = contactFound[0];
         contactToUpdate.deltas = {};

         //DEBUG ONLY REMOVE - change contact updates here for testing
         //contactWithUpdates.phoneNumbers.push(new ContactField('', "2222222222", false));
         //contactWithUpdates.phoneNumbers = [];
         //contactWithUpdates.phoneNumbers.push(new ContactField('', "2222222222", false));

         //TODO: phone numbers must be normalized before comparing.  Seems like they can be stored in whatever format.
         const getPhoneNumbersNotInSecondArray =
            (firstArrayPhoneNumbers, secondArrayPhoneNumbers) =>
               firstArrayPhoneNumbers.filter(firstArrayNum =>
                  secondArrayPhoneNumbers.map(secondArrayNum => secondArrayNum.value).indexOf(firstArrayNum.value) === -1);

         if (contactWithUpdates.phoneNumbers && contactWithUpdates.phoneNumbers.length > 0) {
            var addedPhoneNumbers = contactWithUpdates.phoneNumbers;
            if (contactToUpdate.phoneNumbers && contactToUpdate.phoneNumbers.length > 0) {
               addedPhoneNumbers = getPhoneNumbersNotInSecondArray(contactWithUpdates.phoneNumbers, contactToUpdate.phoneNumbers);
            }
            contactToUpdate.deltas.addedPhoneNumbers = addedPhoneNumbers;
         }
         if (contactToUpdate.phoneNumbers && contactToUpdate.phoneNumbers.length > 0) {
            var phoneNumbersRemoved = getPhoneNumbersNotInSecondArray(contactToUpdate.phoneNumbers, contactWithUpdates.phoneNumbers);
            console.log(phoneNumbersRemoved);
            contactToUpdate.deltas.phoneNumbersRemoved = phoneNumbersRemoved;
         }

         contactToUpdate.phoneNumbers = contactWithUpdates.phoneNumbers;

         //determine if an update is needed
         if ((contactToUpdate.deltas.addedPhoneNumbers && contactToUpdate.deltas.addedPhoneNumbers.length > 0)
            || (contactToUpdate.deltas.phoneNumbersRemoved && contactToUpdate.deltas.phoneNumbersRemoved.length > 0)) {
            contactToUpdate.updateNeeded = true;
         } else {
            contactToUpdate.updateNeeded = false;
         }

         return contactToUpdate;

      }, (error: any) => {
         //TODO: handle known error cases like denied permissions.
         this.debugService.add("ContactsService.buildContactWithUpdates: Error finding contacts.");
         this.debugService.add(error);
         return Promise.resolve(undefined);
      });
   }

   updateContactPhoneNumbers(contactWithUpdates) {
      var contactNumUpdates = [];
      contactWithUpdates.phoneNumbers.map(num => {
         contactNumUpdates.push(new ContactField('', num.value, false));
      });
      return contactNumUpdates;
   }

   //TODO: maybe this isn't a contact object passed in, but instead our internal data structure to house contact info
   //TODO: consider checking what needs updating first before performing update incase additional actions need performed
   updateContact(contactWithUpdates: Contact) {
      var contactToUpdate;
      this.findContactByName(contactWithUpdates.displayName).then(contactFound => {
         this.debugService.add("ContactsService.updateContact: Contact found");

         //TODO: create new contact if doesn't exist
         if (contactFound != undefined && contactFound != null && contactFound.length > 0) {

            contactToUpdate = contactFound[0]; 1
            contactToUpdate.rawId = contactToUpdate.id;
            contactToUpdate._objectInstance.rawId = contactToUpdate.id;

            contactToUpdate.phoneNumbers = [];
            //Initial save to clear out phone numbers
            this.executeSave(contactToUpdate, (contactsFound) => {
               this.debugService.add("ContactsService.updateContact: Contact update complete to clear phone numbers");
               console.log(contactsFound);

               //apply phone number changes
               contactToUpdate.phoneNumbers = this.updateContactPhoneNumbers(contactWithUpdates);

               this.executeSave(contactToUpdate, (contactsFound) => {
                  this.debugService.add("ContactsService.updateContact: Contact updates saved.");
                  console.log(contactsFound);
               }, (error: any) => {
                  this.debugService.add("ContactsService.updateContact: Contact updatesfailed");
                  this.debugService.add(error);
               });

            }, (error: any) => {
               this.debugService.add("ContactsService.updateContact: Contact update to clear out phone numbers failed");
               this.debugService.add(error);
            });
         }
      }, (error: any) => {
         //TODO: handle known error cases like denied permissions.
         this.debugService.add("ContactsService.updateContact: Error finding contacts.");
         this.debugService.add(error);
      });
   }

   private executeSave(contactToSave, onSuccess, onError) {
      return contactToSave.save().then(onSuccess, onError);
   }

   findContactByName(nameToSearch: string): Promise<Contact> {
      var opts = {
         filter: nameToSearch,
         multiple: false,
         //hasPhoneNumber: true,
         desiredFields: ['displayName', 'name', 'phoneNumbers', 'addresses', 'emails']
      };
      return this.contacts.find(['*'], opts).then(
         (contactsFound) => {
            this.debugService.add("ContactsService.findContactByName: Contact found");
            this.debugService.add(contactsFound);
            return contactsFound;
         },
         (error: any) => {
            //TODO: handle known error cases like denied permissions.
            this.debugService.add("ContactsService.findContactByName: Error finding contacts.");
            this.debugService.add(error);
            return Promise.resolve(undefined);
         }
      );
   }
}
