import { Injectable } from '@angular/core';
import { Contact, Contacts, ContactField } from '@ionic-native/contacts/ngx';
import { DebugService } from '../debug/debug.service';
import { Platform } from '@ionic/angular';

import * as _ from 'lodash';

@Injectable({
   providedIn: 'root'
})
export class ContactsService {

   currentPlatform;

   constructor(private platform: Platform, private contacts: Contacts, private debugService: DebugService) {
      this.platform.ready().then(() => {
         if (this.platform.is('android')) {
            this.currentPlatform = 'android';
         } else if (this.platform.is('ios')) {
            this.currentPlatform = 'ios';
         } else {
            this.currentPlatform = 'unknown';
         }
      });
   }

   // TODO:
   // - finish other deltas
   // - handle other fields
   // contactFound.displayName;
   // contactFound.emails;
   // contactFound.phoneNumbers;
   // contactFound.addresses;

   buildContactWithUpdates(contactWithUpdates): Promise<Contact> {

      //TODO: eventually, if multiple contacts with same name found, will have to prompt user to select
      // This could be automated if we have the previous used phonenumber
      return this.findContactByName(contactWithUpdates.displayName).then(contactFound => {
         this.debugService.add("ContactsService.buildContactWithUpdates: Contact found");
         // this.debugService.add(contactFound);

         if (contactFound[0]) {
            let contactToUpdate = _.cloneDeep(contactFound[0]);
            contactToUpdate.deltas = {};

            //DEBUG ONLY REMOVE - change contact updates here for testing
            //contactWithUpdates.phoneNumbers.push(new ContactField('', "2222222222", false));
            //contactWithUpdates.phoneNumbers = [];
            //contactWithUpdates.phoneNumbers.push(new ContactField('', "2222222222", false));

            const getPhoneNumbersNotInSecondArray =
               (firstArrayPhoneNumbers, secondArrayPhoneNumbers) =>
                  firstArrayPhoneNumbers.filter(firstArrayNum =>
                     secondArrayPhoneNumbers.map(secondArrayNum => secondArrayNum.value).indexOf(firstArrayNum.value) === -1);

            if (contactWithUpdates.phoneNumbers && contactWithUpdates.phoneNumbers.length > 0) {
               var addedPhoneNumbers = contactWithUpdates.phoneNumbers;
               if (contactToUpdate.phoneNumbers && contactToUpdate.phoneNumbers.length > 0) {
                  addedPhoneNumbers = getPhoneNumbersNotInSecondArray(this.normalizePhoneNumberAsContactField(contactWithUpdates.phoneNumbers),
                     this.normalizePhoneNumberAsContactField(contactToUpdate.phoneNumbers));
               }
               contactToUpdate.deltas.addedPhoneNumbers = addedPhoneNumbers;
            }
            if (contactToUpdate.phoneNumbers && contactToUpdate.phoneNumbers.length > 0) {
               var phoneNumbersRemoved = getPhoneNumbersNotInSecondArray(this.normalizePhoneNumberAsContactField(contactToUpdate.phoneNumbers),
                  this.normalizePhoneNumberAsContactField(contactWithUpdates.phoneNumbers));
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

         } else {
            //TODO: contact not found on device, create new one? 
            //For now just mimic contact object and set to update not needed
            return {
               updateNeeded: false,
               _objectInstance: {
                  displayName: contactWithUpdates.displayName
               }

            };
         }
      }, (error: any) => {
         this.debugService.add("ContactsService.buildContactWithUpdates: Error finding contacts.");
         this.debugService.add(error);
         return Promise.resolve(undefined);
      });
   }

   //TODO: maybe this isn't a contact object passed in, but instead our internal data structure to house contact info
   //TODO: consider checking what needs updating first before performing update incase additional actions need performed
   updateContact(contactWithUpdates: Contact): Promise<any> {
      return this.findContactByName(contactWithUpdates.displayName).then(contactFound => {
         this.debugService.add("ContactsService.updateContact: Contact found");
         // this.debugService.add(contactFound);

         //TODO: create new contact if doesn't exist
         if (contactFound != undefined && contactFound != null && contactFound.length > 0) {

            let contactToUpdate: any = _.cloneDeep(contactFound[0]);
            contactToUpdate._objectInstance.rawId = contactToUpdate.rawId;

            //TODO: perform checks before updating. Only update if needed.
            //TODO: pull this save out into its own method so we can chain these save requests together 
            contactToUpdate.phoneNumbers = [];

            if (this.currentPlatform === 'ios') {
               contactToUpdate.phoneNumbers = this.updateContactPhoneNumbers(contactWithUpdates);
               return this.saveChangesToContact(contactToUpdate);

            } else if (this.currentPlatform === 'android') {
               return this.prepareContactForUpdatesForAndroid(contactToUpdate).then((preparedContact) => {
                  preparedContact.phoneNumbers = this.updateContactPhoneNumbers(contactWithUpdates);
                  return this.saveChangesToContact(preparedContact);
               });
            }
         }
      }, (error: any) => {
         this.debugService.add("ContactsService.updateContact: Error finding contacts.");
         this.debugService.add(error);
         return Promise.resolve(undefined);
      });
   }

   normalizePhoneNumberAsContactField(numbersToNormalize: Array<any>) {
      return numbersToNormalize.map(nubStr => {
         nubStr.value = nubStr.value.replace(/\D/g, '');
         if (nubStr.value.length === 11) {
            //remove country code 
            nubStr.value = nubStr.value.substring(1);
         }
         return nubStr;
      });
   }

   normalizePhoneNumberAsStringArray(numbersToNormalize: Array<string>) {
      return numbersToNormalize.map(nubStr => {
         nubStr = nubStr.replace(/\D/g, '');
         if (nubStr.length === 11) {
            //remove country code 
            nubStr = nubStr.substring(1);
         }
         return nubStr;
      });
   }

   updateContactPhoneNumbers(contactWithUpdates) {
      var contactNumUpdates = [];
      contactWithUpdates.phoneNumbers.map(num => {
         if (this.currentPlatform === 'ios') {
            //TODO: this needs to have the id of the specific phone number array to work.  Otherwise, it will
            //just add a new number
            contactNumUpdates.push({ id: 0, value: contactWithUpdates.phoneNumbers[0].value });
         } else if (this.currentPlatform === 'android') {
            contactNumUpdates.push(new ContactField('', num.value, false));
         }
      });
      return contactNumUpdates;
   }

   prepareContactForUpdatesForAndroid(contactToUpdate): Promise<any> {
      console.log(contactToUpdate);
      return this.executeSave(contactToUpdate, (contactAfterPhoneNumsCleared) => {
         return contactAfterPhoneNumsCleared;
      }, (error: any) => {
         this.debugService.add("ContactsService.updateContact: Contact update to clear out phone numbers failed");
         this.debugService.add(error);
         return Promise.resolve(undefined);
      });
   }

   findContactByName(nameToSearch: string): Promise<Contact[]> {
      var opts = {
         filter: nameToSearch,
         multiple: false,
         desiredFields: ['displayName', 'name', 'phoneNumbers', 'addresses', 'emails', 'organizations']
      };
      return this.performDeviceContactQuery(opts);
   }

   queryAllDeviceContacts(): Promise<Contact[]> {
      var opts = {
         multiple: true,
         desiredFields: ['displayName', 'name', 'phoneNumbers', 'addresses', 'emails', 'organizations']
      };
      return this.performDeviceContactQuery(opts);
   }

   private performDeviceContactQuery(options): Promise<Contact[]> {
      return this.contacts.find(['*'], options).then(
         (contactsFound) => {
            this.debugService.add("ContactsService.performDeviceContactQuery: contact(s) found.");
            let contactsFoundCloned = _.cloneDeep(contactsFound);
            return contactsFoundCloned;
         },
         (error: any) => {
            this.debugService.add("ContactsService.performDeviceContactQuery: Error finding contacts.");
            this.debugService.add(error);
            return Promise.resolve(undefined);
         }
      );
   }

   saveChangesToContact(contactToUpdate): Promise<any> {
      return this.executeSave(contactToUpdate, (contactAfterSave) => {
         this.debugService.add("ContactsService.updateContact: Contact updates saved.");
         return contactAfterSave;
      }, (error: any) => {
         this.debugService.add("ContactsService.updateContact: Contact updatesfailed");
         this.debugService.add(error);
         return Promise.resolve(undefined);
      });
   }

   //Note: currently only used by the debug tab, but could expand to use this for saving new contacts to address book
   saveNewContact(contactToSave, onSuccess, onError) {
      this.executeSave(contactToSave, onSuccess, onError);
   }
   private executeSave(contactToSave, onSuccess, onError) {
      return contactToSave.save().then(onSuccess, onError);
   }

}
