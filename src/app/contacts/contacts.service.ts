import { Injectable } from '@angular/core';
import { Contact, Contacts } from '@ionic-native/contacts/ngx';
import { DebugService } from '../debug/debug.service';

@Injectable({
   providedIn: 'root'
})
export class ContactsService {

   constructor(private contacts: Contacts, private debugService: DebugService) { }

   //TODO: maybe this isn't a contact object passed in, but instead our internal data structure to house contact info
   updateContact(contactWithUpdates: Contact) {

      //TODO: check that contact exists
      var contactToUpdate;
      this.findContactByName(contactWithUpdates.displayName).then(contactFound => {
         this.debugService.add("ContactsService.updateContact: Contact found");

         //TODO: create new contact if doesn't exist
         if (contactFound != undefined && contactFound != null && contactFound.length > 0) {
            contactToUpdate = contactFound[0];
            //contactToUpdate.phoneNumbers[0] = new ContactField('mobile', '6471234567');
            //contactToUpdate.phoneNumbers.push(new ContactField("mobile", "6471234567"))
            contactToUpdate.phoneNumbers[0].value = "6668915645";
            //new ContactField('mobile', '321-475-9999')
            // contactToUpdate.phoneNumbers = [{
            //    //id: "1", TODO: May have to manually remove id so it doesn't somehow get changed
            //    pref: false,
            //    type: "mobile",
            //    value: "999-564-7897"
            // }];
            //contactToUpdate.save();
            // contactToUpdate.save()
            // .then(
            //    (contactsFound) => {
            //       this.debugService.add("ContactsService.updateContact: Contact update complete");
            //    }, (error: any) => {
            //       this.debugService.add("ContactsService.updateContact: Contact update failed");
            //       this.debugService.add(error);
            //    });
            // console.log(result)
            contactToUpdate.save(function (success) {
               this.debugService.add("ContactsService.updateContact: Contact update complete");
            }, function (error) {
               this.debugService.add("ContactsService.updateContact: Contact update failed");
               this.debugService.add(error);
            });
         }
      }, (error: any) => {
         //TODO: handle known error cases like denied permissions.
         this.debugService.add("ContactsService.updateContact: Error finding contacts.");
         this.debugService.add(error);
      });
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
