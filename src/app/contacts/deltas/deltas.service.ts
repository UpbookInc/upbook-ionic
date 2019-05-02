import { Injectable } from '@angular/core';
import { DebugService } from 'src/app/debug/debug.service';
import { ContactsService } from '../contacts.service';
import { Contact } from '@ionic-native/contacts/ngx';
import * as _ from 'lodash';
import { baseAddrName, baseOrgName } from 'src/app/profile/model/profile';

@Injectable({
   providedIn: 'root'
})
export class DeltasService {

   constructor(private contactService: ContactsService, private debugService: DebugService) { }

   async buildContactWithDeltasAndUpdates(contactWithUpdates): Promise<Contact> {
      try {
         const contactFound = await this.contactService.findContactByName(contactWithUpdates.displayName);
         this.debugService.add("ContactsService.buildContactWithUpdates: Contact found");

         if (contactFound[0]) {
            let contactToUpdate = _.cloneDeep(contactFound[0]);
            contactToUpdate.deltas = {};

            contactToUpdate = this.determinePhoneNumberDeltas(contactWithUpdates, contactToUpdate);
            contactToUpdate = this.determineEmailDeltas(contactWithUpdates, contactToUpdate);
            contactToUpdate = this.determineAddressDeltas(contactWithUpdates, contactToUpdate);
            contactToUpdate = this.determineOrgDeltas(contactWithUpdates, contactToUpdate);

            //determine if an update is needed
            if ((contactToUpdate.deltas.addedPhoneNumbers && contactToUpdate.deltas.addedPhoneNumbers.length > 0)
               || (contactToUpdate.deltas.phoneNumbersRemoved && contactToUpdate.deltas.phoneNumbersRemoved.length > 0)) {
               contactToUpdate.updateNeeded = true;
            } else if ((contactToUpdate.deltas.addedEmails && contactToUpdate.deltas.addedEmails.length > 0)
               || (contactToUpdate.deltas.emailsRemoved && contactToUpdate.deltas.emailsRemoved.length > 0)) {
               contactToUpdate.updateNeeded = true;
            } else if ((contactToUpdate.deltas.addedAddresses && contactToUpdate.deltas.addedAddresses.length > 0)
               || (contactToUpdate.deltas.addressesRemoved && contactToUpdate.deltas.addressesRemoved.length > 0)) {
               contactToUpdate.updateNeeded = true;
            } else if ((contactToUpdate.deltas.addedOrgs && contactToUpdate.deltas.addedOrgs.length > 0)
               || (contactToUpdate.deltas.orgsRemoved && contactToUpdate.deltas.orgsRemoved.length > 0)) {
               contactToUpdate.updateNeeded = true;
            } else {
               contactToUpdate.updateNeeded = false;
            }
            return contactToUpdate;
         }
         else {
            // TODO: contact not found on device, create new one? 
            // For now just mimic contact object and set to update not needed
            const emptyContact = new Contact();
            emptyContact.displayName = contactWithUpdates.displayName;
            emptyContact.updateNeeded = false;
            return emptyContact;
         }
      }
      catch (error) {
         this.debugService.add("ContactsService.buildContactWithUpdates: Error finding contacts.");
         this.debugService.add(error);
         return Promise.reject(undefined);
      }
   }

   private determinePhoneNumberDeltas(contactWithUpdates, contactToUpdate) {
      if (contactWithUpdates.phoneNumbers && contactWithUpdates.phoneNumbers.length > 0) {
         var addedPhoneNumbers = contactWithUpdates.phoneNumbers;
         if (contactToUpdate.phoneNumbers && contactToUpdate.phoneNumbers.length > 0) {
            addedPhoneNumbers = this.getArrayItemsNotInSecondArray(this.contactService.normalizePhoneNumberAsContactField(contactWithUpdates.phoneNumbers),
               this.contactService.normalizePhoneNumberAsContactField(contactToUpdate.phoneNumbers));
         }
         contactToUpdate.deltas.addedPhoneNumbers = addedPhoneNumbers;
      }
      if (contactToUpdate.phoneNumbers && contactToUpdate.phoneNumbers.length > 0) {
         var phoneNumbersRemoved = this.getArrayItemsNotInSecondArray(this.contactService.normalizePhoneNumberAsContactField(contactToUpdate.phoneNumbers),
            this.contactService.normalizePhoneNumberAsContactField(contactWithUpdates.phoneNumbers));
         contactToUpdate.deltas.phoneNumbersRemoved = phoneNumbersRemoved;
      }
      contactToUpdate.phoneNumbers = contactWithUpdates.phoneNumbers;
      return contactToUpdate;
   }

   private determineEmailDeltas(contactWithUpdates, contactToUpdate) {
      if (contactWithUpdates.emails && contactWithUpdates.emails.length > 0) {
         var addedItems = contactWithUpdates.emails;
         if (contactToUpdate.emails && contactToUpdate.emails.length > 0) {
            addedItems = this.getArrayItemsNotInSecondArray(this.contactService.trimContactFieldItems(contactWithUpdates.emails),
               this.contactService.trimContactFieldItems(contactToUpdate.emails));
         }
         contactToUpdate.deltas.addedEmails = addedItems;
      }
      if (contactToUpdate.emails && contactToUpdate.emails.length > 0) {
         var itemsRemoved = this.getArrayItemsNotInSecondArray(this.contactService.trimContactFieldItems(contactToUpdate.emails),
            this.contactService.trimContactFieldItems(contactWithUpdates.emails));
         contactToUpdate.deltas.emailsRemoved = itemsRemoved;
      }
      contactToUpdate.emails = contactWithUpdates.emails;
      return contactToUpdate;
   }

   private determineAddressDeltas(contactWithUpdates, contactToUpdate) {
      if (contactWithUpdates.addresses && contactWithUpdates.addresses.length > 0) {
         var addedItems = contactWithUpdates.addresses;
         if (contactToUpdate.addresses && contactToUpdate.addresses.length > 0) {
            addedItems = this.getArrayItemsNotInSecondArray(this.contactService.trimContactFieldItems(contactWithUpdates.addresses, baseAddrName),
               this.contactService.trimContactFieldItems(contactToUpdate.addresses, baseAddrName), baseAddrName);
         }
         contactToUpdate.deltas.addedAddresses = addedItems;
      }
      if (contactToUpdate.addresses && contactToUpdate.addresses.length > 0) {
         var itemsRemoved = this.getArrayItemsNotInSecondArray(this.contactService.trimContactFieldItems(contactToUpdate.addresses, baseAddrName),
            this.contactService.trimContactFieldItems(contactWithUpdates.addresses, baseAddrName), baseAddrName);
         contactToUpdate.deltas.addressesRemoved = itemsRemoved;
      }
      contactToUpdate.addresses = contactWithUpdates.addresses;
      return contactToUpdate;
   }

   private determineOrgDeltas(contactWithUpdates, contactToUpdate) {
      // removes the empty organaiztion that iOS always has when none is set
      if (contactToUpdate.organizations && contactToUpdate.organizations.length === 1 
         && (!contactToUpdate.organizations[0].name || contactToUpdate.organizations[0].name == '')) {
            contactToUpdate.organizations = [];
      }

      if (contactWithUpdates.organizations && contactWithUpdates.organizations.length > 0) {
         var addedItems = contactWithUpdates.organizations;
         if (contactToUpdate.organizations && contactToUpdate.organizations.length > 0) {
            addedItems = this.getArrayItemsNotInSecondArray(this.contactService.trimContactFieldItems(contactWithUpdates.organizations, baseOrgName),
               this.contactService.trimContactFieldItems(contactToUpdate.organizations, baseOrgName), baseOrgName);
         }
         contactToUpdate.deltas.addedOrgs = addedItems;
      }
      if (contactToUpdate.organizations && contactToUpdate.organizations.length > 0) {
         var itemsRemoved = this.getArrayItemsNotInSecondArray(this.contactService.trimContactFieldItems(contactToUpdate.organizations, baseOrgName),
            this.contactService.trimContactFieldItems(contactWithUpdates.organizations, baseOrgName), baseOrgName);
         contactToUpdate.deltas.orgsRemoved = itemsRemoved;
      }
      contactToUpdate.organizations = contactWithUpdates.organizations;
      return contactToUpdate;
   }

   private getArrayItemsNotInSecondArray(firstArray, secondArray, fieldCheckName: string = 'value') {
      return firstArray.filter(firstArrayItem =>
         secondArray.map(secondArrayItem => secondArrayItem[fieldCheckName]).indexOf(firstArrayItem[fieldCheckName]) === -1)
   }
}
