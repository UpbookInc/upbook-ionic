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
         let foundContacts = await this.findContactByName(contactWithUpdates.displayName);
         afterRemovedSaveContact = foundContacts[0];
      }

      if (contactWithUpdates.deltas.emailsRemoved && contactWithUpdates.deltas.emailsRemoved.length > 0) {
         contactToUpdate.emails = [];
         await this.executeSave(contactToUpdate);
         let foundContacts = await this.findContactByName(contactWithUpdates.displayName);
         afterRemovedSaveContact = foundContacts[0];
      }

      if (contactWithUpdates.deltas.addressesRemoved && contactWithUpdates.deltas.addressesRemoved.length > 0) {
         contactToUpdate.addresses = [];
         await this.executeSave(contactToUpdate);
         let foundContacts = await this.findContactByName(contactWithUpdates.displayName);
         afterRemovedSaveContact = foundContacts[0];
      }

      if (contactWithUpdates.deltas.orgsRemoved && contactWithUpdates.deltas.orgsRemoved.length > 0) {
         contactToUpdate.organizations = [];
         await this.executeSave(contactToUpdate);
         let foundContacts = await this.findContactByName(contactWithUpdates.displayName);
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
         let contactFound: any = await this.findContactByName(contactWithUpdates.displayName);
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
         if (this.currentPlatform === 'ios') {
            //TODO: this needs to have the id of the specific phone number array to work.  
            // Otherwise, it will just add a new number
            contactNumUpdates.push({ id: index, value: numToAdd.value });
         } else if (this.currentPlatform === 'android') {
            contactNumUpdates.push(new ContactField('', numToAdd.value, false));
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

   async findContactByName(nameToSearch: string): Promise<Contact[]> {
      var opts = {
         filter: nameToSearch,
         multiple: false,
         desiredFields: ['displayName', 'name', 'phoneNumbers', 'addresses', 'emails', 'organizations']
      };
      return this.performDeviceContactQuery(opts);
   }

   async queryAllDeviceContacts(): Promise<Contact[]> {
      var opts = {
         multiple: true,
         desiredFields: ['displayName', 'name', 'phoneNumbers', 'addresses', 'emails', 'organizations']
      };
      return this.performDeviceContactQuery(opts);
   }

   private async performDeviceContactQuery(options): Promise<Contact[]> {
      try {
         const contactsFound = await this.contacts.find(['*'], options);
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
            numStr.value = numStr.value.replace(/\D/g, '');
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
         numStr = numStr.replace(/\D/g, '');
         if (numStr.length === 11) {
            //remove country code 
            numStr = numStr.substring(1);
         }
         return numStr;
      });
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
