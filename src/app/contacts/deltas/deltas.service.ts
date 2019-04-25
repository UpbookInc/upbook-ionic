import { Injectable } from '@angular/core';
import { DebugService } from 'src/app/debug/debug.service';
import { ContactsService } from '../contacts.service';
import { Contact } from '@ionic-native/contacts/ngx';
import * as _ from 'lodash';

@Injectable({
   providedIn: 'root'
})
export class DeltasService {

   constructor(private contactService: ContactsService, private debugService: DebugService) { }

   // - finish other deltas
   // - handle other fields
   // contactFound.displayName;
   // contactFound.emails;
   // contactFound.phoneNumbers;
   // contactFound.addresses;
   async buildContactWithDeltasAndUpdates(contactWithUpdates): Promise<Contact> {
      try {
         const contactFound = await this.contactService.findContactByName(contactWithUpdates.displayName);
         this.debugService.add("ContactsService.buildContactWithUpdates: Contact found");
         // this.debugService.add(contactFound);
         if (contactFound[0]) {
            let contactToUpdate = _.cloneDeep(contactFound[0]);
            contactToUpdate = this.determinePhoneNumberDeltas(contactWithUpdates, contactToUpdate);
            //TODO: move this to own method and process deltas
            contactToUpdate.emails = contactWithUpdates.emails;
            //determine if an update is needed
            if ((contactToUpdate.deltas.addedPhoneNumbers && contactToUpdate.deltas.addedPhoneNumbers.length > 0)
               || (contactToUpdate.deltas.phoneNumbersRemoved && contactToUpdate.deltas.phoneNumbersRemoved.length > 0)) {
               contactToUpdate.updateNeeded = true;
            }
            else {
               contactToUpdate.updateNeeded = false;
            }
            return contactToUpdate;
         }
         else {
            //TODO: contact not found on device, create new one? 
            //For now just mimic contact object and set to update not needed
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
      contactToUpdate.deltas = {};

      const getPhoneNumbersNotInSecondArray =
         (firstArrayPhoneNumbers, secondArrayPhoneNumbers) =>
            firstArrayPhoneNumbers.filter(firstArrayNum =>
               secondArrayPhoneNumbers.map(secondArrayNum => secondArrayNum.value).indexOf(firstArrayNum.value) === -1);

      if (contactWithUpdates.phoneNumbers && contactWithUpdates.phoneNumbers.length > 0) {
         var addedPhoneNumbers = contactWithUpdates.phoneNumbers;
         if (contactToUpdate.phoneNumbers && contactToUpdate.phoneNumbers.length > 0) {
            addedPhoneNumbers = getPhoneNumbersNotInSecondArray(this.contactService.normalizePhoneNumberAsContactField(contactWithUpdates.phoneNumbers),
               this.contactService.normalizePhoneNumberAsContactField(contactToUpdate.phoneNumbers));
         }
         contactToUpdate.deltas.addedPhoneNumbers = addedPhoneNumbers;
      }
      if (contactToUpdate.phoneNumbers && contactToUpdate.phoneNumbers.length > 0) {
         var phoneNumbersRemoved = getPhoneNumbersNotInSecondArray(this.contactService.normalizePhoneNumberAsContactField(contactToUpdate.phoneNumbers),
            this.contactService.normalizePhoneNumberAsContactField(contactWithUpdates.phoneNumbers));
         console.log(phoneNumbersRemoved);
         contactToUpdate.deltas.phoneNumbersRemoved = phoneNumbersRemoved;
      }
      contactToUpdate.phoneNumbers = contactWithUpdates.phoneNumbers;
      return contactToUpdate;
   }

}
