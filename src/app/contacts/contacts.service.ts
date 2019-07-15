import { Injectable } from '@angular/core';
import { Contact, Contacts, ContactField, ContactOrganization, ContactAddress } from '@ionic-native/contacts/ngx';
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

   async performIOSContactUpdates(contactToUpdate: Contact, contactWithUpdates): Promise<any> {
      let afterRemovedSaveContact = contactToUpdate;

      if (contactWithUpdates.deltas.phoneNumbersRemoved && contactWithUpdates.deltas.phoneNumbersRemoved.length > 0) {
         contactToUpdate.phoneNumbers = [];
         await this.executeSave(contactToUpdate);
         let foundContacts = await this.findContactById(contactToUpdate.id);
         afterRemovedSaveContact = foundContacts[0];
      }

      if (contactWithUpdates.deltas.emailsRemoved && contactWithUpdates.deltas.emailsRemoved.length > 0) {
         contactToUpdate.emails = [];
         await this.executeSave(contactToUpdate);
         let foundContacts = await this.findContactById(contactToUpdate.id);
         afterRemovedSaveContact = foundContacts[0];
      }

      if (contactWithUpdates.deltas.addressesRemoved && contactWithUpdates.deltas.addressesRemoved.length > 0) {
         contactToUpdate.addresses = [];
         await this.executeSave(contactToUpdate);
         let foundContacts = await this.findContactById(contactToUpdate.id);
         afterRemovedSaveContact = foundContacts[0];
      }

      if (contactWithUpdates.deltas.orgsRemoved && contactWithUpdates.deltas.orgsRemoved.length > 0) {
         contactToUpdate.organizations = [];
         await this.executeSave(contactToUpdate);
         let foundContacts = await this.findContactById(contactToUpdate.id);
         afterRemovedSaveContact = foundContacts[0];
      }

      afterRemovedSaveContact.phoneNumbers = this.updateContactPhoneNumbers(contactWithUpdates);
      afterRemovedSaveContact.emails = this.updateContactEmails(contactWithUpdates);
      afterRemovedSaveContact.addresses = this.updateContactAddresses(contactWithUpdates);
      afterRemovedSaveContact.organizations = this.updateContactOrganizations(contactWithUpdates);

      return await this.executeSave(afterRemovedSaveContact);
   }

   async updateContact(contactWithUpdates: Contact): Promise<any> {
      try {
         let contactFound: any = await this.findContactByNameThenNumber(contactWithUpdates);

         this.debugService.add("ContactsService.updateContact: Contact found");
         //this.debugService.add(contactFound);

         if (contactFound != undefined && contactFound != null && contactFound.length > 0) {
            // has to be type any to allow us direct access to _objectInstance
            let contactToUpdate: any = _.cloneDeep(contactFound[0]);
            contactToUpdate._objectInstance.rawId = contactToUpdate.rawId;

            if (this.currentPlatform === 'ios') {
               return this.performIOSContactUpdates(contactToUpdate, contactWithUpdates);
            }
            else if (this.currentPlatform === 'android') {
               //TODO: perform checks before updating. Only update if needed.
               //TODO: pull this save out into its own method so we can chain these save requests together 
               contactToUpdate.phoneNumbers = [];
               contactToUpdate.emails = [];
               contactToUpdate.addresses = [];
               contactToUpdate.organizations = [];

               return this.prepareContactForUpdates(contactToUpdate).then((preparedContact) => {
                  preparedContact.phoneNumbers = this.updateContactPhoneNumbers(contactWithUpdates);
                  preparedContact.emails = this.updateContactEmails(contactWithUpdates);
                  preparedContact.addresses = this.updateContactAddresses(contactWithUpdates);
                  preparedContact.organizations = this.updateContactOrganizations(contactWithUpdates);
                  return this.saveChangesToContact(preparedContact);
               });
            }
         }
      }
      catch (error) {
         this.debugService.add("ContactsService.updateContact: Error finding contacts.");
         this.debugService.add(error);
         console.log("error saving");
         console.log(error);
         return Promise.reject(undefined);
      }
   }

   updateContactPhoneNumbers(contactWithUpdates) {
      var contactNumUpdates = [];

      contactWithUpdates.phoneNumbers.map((numToAdd, index) => {
         var numToSave = this.convertPhoneNumberToStandardFormatWithCountry(numToAdd.value);
         if (this.currentPlatform === 'ios') {
            //TODO: this needs to have the id of the specific phone number array to work.  
            // Otherwise, it will just add a new number
            contactNumUpdates.push({ id: index, value: numToSave });
         } else if (this.currentPlatform === 'android') {
            contactNumUpdates.push(new ContactField('', numToSave, false));
         }
      });
      return contactNumUpdates;
   }

   updateContactEmails(contactWithUpdates) {
      var contactEmailUpdates = [];
      contactWithUpdates.emails.map((emailToAdd, index) => {
         if (this.currentPlatform === 'ios') {
            //TODO: this needs to have the id of the specific phone number array to work.  Otherwise, it will
            //just add a new number
            contactEmailUpdates.push({ id: index, value: emailToAdd.value });
         } else if (this.currentPlatform === 'android') {
            contactEmailUpdates.push(new ContactField('', emailToAdd.value, false));
         }
      });
      return contactEmailUpdates;
   }

   updateContactAddresses(contactWithUpdates) {
      let contactAddrUpdates = [];
      contactWithUpdates.addresses.map((addrToAdd, index) => {
         if (this.currentPlatform === 'ios') {
            //TODO: this needs to have the id of the specific phone number array to work.  Otherwise, it will
            //just add a new number
            // - The type here is required.
            contactAddrUpdates.push({ id: index, streetAddress: addrToAdd.streetAddress, type: 'home' });
         } else if (this.currentPlatform === 'android') {
            contactAddrUpdates.push(new ContactAddress(false, '', addrToAdd.streetAddress, addrToAdd.streetAddress));
         }
      });
      return contactAddrUpdates;
   }

   updateContactOrganizations(contactWithUpdates) {
      var contactOrgUpdates = [];
      contactWithUpdates.organizations.map((orgToAdd, index) => {
         if (this.currentPlatform === 'ios') {
            //TODO: this needs to have the id of the specific phone number array to work.  Otherwise, it will
            //just add a new number
            contactOrgUpdates.push({ id: index, name: orgToAdd.name });
         } else if (this.currentPlatform === 'android') {
            contactOrgUpdates.push(new ContactOrganization('', orgToAdd.name));
         }
      });
      return contactOrgUpdates;
   }

   async prepareContactForUpdates(contactToUpdate): Promise<any> {
      try {
         let contactAfterPhoneNumsCleared = await this.executeSave(contactToUpdate);
         return contactAfterPhoneNumsCleared;
      } catch (error) {
         this.debugService.add("ContactsService.updateContact: Contact update to clear out phone numbers failed");
         this.debugService.add(error);
         return Promise.reject(undefined);
      }
   }

   async findContactByNameThenNumber(contactWithUpdates): Promise<Contact[]> {
      let contactFound = await this.findContactByName(contactWithUpdates.displayName);
      if (!contactFound || !contactFound[0]) {
         let contactToReturn;
         // name didn't match, try phone numbers
         if (contactWithUpdates.phoneNumbers) {

            let contactsFoundFromNumber: any[] = [];
            // used a for..of loop here that each query runs in series.  The Cordova Contacts query
            // doesn't seem to work when done in parallel.  
            for (var number of contactWithUpdates.phoneNumbers) {
               let contactFromQuery = await this.findContactByNumber(number.value);
               if (contactFromQuery && contactFromQuery.length > 0) {
                  // prevent adding duplicate contacts
                  let contactExists: boolean = contactsFoundFromNumber.some(contactFoundFromNumber => {
                     return contactFoundFromNumber.id === contactFromQuery[0].id;
                  });
                  if (!contactExists) {
                     contactsFoundFromNumber.push(contactFromQuery[0]);
                  }
               }
            }

            contactToReturn = contactsFoundFromNumber.filter(contactFound => contactFound);
            return contactToReturn;
         }
      } else {
         return contactFound;
      }
   }

   private async findContactById(idToSearch: string): Promise<Contact[]> {
      var opts = {
         filter: idToSearch,
         multiple: false,
         desiredFields: ['displayName', 'name', 'phoneNumbers', 'addresses', 'emails', 'organizations', 'id']
      };
      return this.performDeviceContactQuery(opts, ['id']);
   }

   /*
    * Do not use directly, use findContactByNameThenNumber 
    */
   private async findContactByName(nameToSearch: string): Promise<Contact[]> {
      var opts = {
         filter: nameToSearch,
         multiple: false,
         desiredFields: ['displayName', 'name', 'phoneNumbers', 'addresses', 'emails', 'organizations', 'id']
      };
      return this.performDeviceContactQuery(opts, ['displayName', 'name']);
   }

   /*
    * Do not use directly, use findContactByNameThenNumber 
    */
   private async findContactByNumber(numberToSearch: string): Promise<Contact[]> {
      if (this.currentPlatform === 'ios') {
         // required format (XXX) YYY-ZZZZ
         numberToSearch = this.convertPhoneNumberToStandardFormatExcludeCountry(numberToSearch);
         console.log("ios formatted: " + numberToSearch);
      } else if (this.currentPlatform === 'android') {
         // add wildcards XXX%YYY%ZZZZ
         var numberArray = this.normalizePhoneNumberAsStringArray([numberToSearch]);
         numberToSearch = numberArray[0];
         numberToSearch = numberToSearch.slice(0, 3) + "%" + numberToSearch.slice(3, 6) + "%" + numberToSearch.slice(6);
         console.log("android formatted: " + numberToSearch);
      }

      var opts = {
         filter: numberToSearch,
         multiple: false,
         hasPhoneNumber: true,
         desiredFields: ['displayName', 'name', 'phoneNumbers', 'addresses', 'emails', 'organizations', 'id']
      };
      return this.performDeviceContactQuery(opts, ['phoneNumbers']);
   }

   async queryAllDeviceContacts(): Promise<Contact[]> {
      var opts = {
         multiple: true,
         desiredFields: ['displayName', 'name', 'phoneNumbers', 'addresses', 'emails', 'organizations', 'id']
      };
      return this.performDeviceContactQuery(opts, ['*']);
   }

   private async performDeviceContactQuery(options, queryFields): Promise<Contact[]> {
      try {
         const contactsFound = await this.contacts.find(queryFields, options);
         this.debugService.add("ContactsService.performDeviceContactQuery: contact(s) found.");
         let contactsFoundCloned = _.cloneDeep(contactsFound);
         return contactsFoundCloned;
      }
      catch (error) {
         this.debugService.add("ContactsService.performDeviceContactQuery: Error finding contacts.");
         this.debugService.add(error);
         return Promise.reject(undefined);
      }
   }

   normalizePhoneNumberAsContactField(numbersToNormalize: Array<any>) {
      return numbersToNormalize.map(numStr => {
         if (numStr.value != null && numStr != undefined) {
            numStr.value = this.stripAllNonNumberCharacters(numStr.value);
            if (numStr.value.length === 11) {
               //remove country code 
               numStr.value = numStr.value.substring(1);
            }
         }
         return numStr;
      });
   }

   normalizePhoneNumberAsStringArray(numbersToNormalize: Array<string>) {
      return numbersToNormalize.map(numStr => {
         numStr = this.stripAllNonNumberCharacters(numStr);
         if (numStr.length === 11) {
            //remove country code 
            numStr = numStr.substring(1);
         }
         return numStr;
      });
   }

   // Limitation: currently only supports US 10 digit phone numbers, removes country code and non-numeric characters
   convertPhoneNumberToStandardFormatExcludeCountry(numberToConvert: string) {
      numberToConvert = this.stripAllNonNumberCharacters(numberToConvert);
      if (numberToConvert.length === 11) {
         //remove country code 
         numberToConvert = numberToConvert.substring(1);
      }
      return "(" + numberToConvert.slice(0, 3) + ") " + numberToConvert.slice(3, 6) + "-" + numberToConvert.slice(6);
   }

   // +1 (XXX) YYY-ZZZZ
   // Limitation: currently only supports single digit country codes
   convertPhoneNumberToStandardFormatWithCountry(numberToConvert: string) {
      numberToConvert = this.stripAllNonNumberCharacters(numberToConvert);
      if (numberToConvert.length === 11) {
         numberToConvert = "+" + numberToConvert.slice(0, 1) + " (" + numberToConvert.slice(1, 4) + ") " + numberToConvert.slice(4, 7) + "-" + numberToConvert.slice(7);
      } else {
         numberToConvert = this.convertPhoneNumberToStandardFormatExcludeCountry(numberToConvert);
      }
      return numberToConvert;
   }

   stripAllNonNumberCharacters(numberToStrip: string) {
      return numberToStrip.replace(/\D/g, '');
   }

   trimContactFieldItems(itemsToNormalize: Array<any>, baseFieldName: string = 'value') {
      return itemsToNormalize.map(itemStr => {
         if (itemStr[baseFieldName] != null && itemStr != undefined) {
            itemStr[baseFieldName] = itemStr[baseFieldName].trim()
         }
         return itemStr;
      });
   }

   async saveChangesToContact(contactToUpdate): Promise<any> {
      try {
         let contactAfterSave = await this.executeSave(contactToUpdate)
         this.debugService.add("ContactsService.updateContact: Contact updates saved.");
         return contactAfterSave;
      } catch (error) {
         this.debugService.add("ContactsService.updateContact: Contact updatesfailed");
         this.debugService.add(error);
         return Promise.reject(undefined);
      }
   }

   // Note: currently only used by the debug tab, but could expand to use this for saving new contacts to address book
   // saveNewContact(contactToSave, onSuccess, onError) {
   //    this.executeSave(contactToSave);
   // }

   private async executeSave(contactToSave: Contact): Promise<Contact> {
      return contactToSave.save();
   }

}
