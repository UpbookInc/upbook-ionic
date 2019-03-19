import { Injectable, NgZone } from '@angular/core';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { NavController } from '@ionic/angular';
import { DebugService } from '../debug/debug.service';
import { ModalController } from '@ionic/angular';
import { ContactUpdatePage } from '../contacts/contact-update/contact-update.page';
import { ContactsService } from '../contacts/contacts.service';

@Injectable({
   providedIn: 'root'
})
export class DeeplinkService {

   //TODO: consider having a "manual override" option incase we can't find the contact.  Allows user to select which contact to update.
   // - this could happen in the event of a name and phone number change at the same time.
   constructor(protected deeplinks: Deeplinks, protected navController: NavController, private zone: NgZone,
      private debugService: DebugService, private modalController: ModalController, private contactsService: ContactsService) { }

   setupDeepLinkRouting() {
      this.deeplinks.route({
         '/upbook/intent': 'contact-update'
      }).subscribe(match => {
         // match.$route - the route we matched, which is the matched entry from the arguments to route()
         // match.$args - the args passed in the link
         // match.$link - the full link data
         this.debugService.add("DeeplinkService.setupDeepLinkRouting: Successfully matched route:");
         this.debugService.add(match);

         var contactUpdates;
         this.getContactFromDevice().then(contactFound => {
            if (contactFound != undefined && contactFound != null) {
               contactUpdates = this.parseContactQueryString(match.$link.queryString);

               this.modalController.create({
                  component: ContactUpdatePage,
                  componentProps: contactUpdates
               }).then((modal) => {
                  modal.present();
                  this.debugService.add("DeeplinkService.setupDeepLinkRouting: Successfully navigated to route.");
                  
                  modal.onDidDismiss().then(data => {
                     //TODO: call to save updates to contact 
                     this.contactsService.updateContact(contactUpdates)
                  });
               });
            } else {
               //TODO: maybe this is a new contact, ask to create
            }
         });
      }, nomatch => {
         // nomatch.$link - the full link data
         console.error('Got a deeplink that didn\'t match', nomatch);
      });
   }

   getContactFromDevice(): Promise<Contact> {
      return this.contactsService.findContactByName("John Bassett").then(contactFound => {
         this.debugService.add("DeeplinkService.getContactFromDevice: Contact found");
         return contactFound;
      }, (error: any) => {
         //TODO: handle known error cases like denied permissions.
         this.debugService.add("DeeplinkService.getContactFromDevice: Error finding contacts.");
         this.debugService.add(error);
         return Promise.resolve(undefined);
      });
   }

   //TODO: build a simple object with the contact fields that we are tracking
   //TODO: also build out deltas here
   parseContactQueryString(queryStringWithUpdates) {
      var searchParams = new URLSearchParams(queryStringWithUpdates);
      console.log(searchParams);
      return {
         contactUpdates: {
            displayName: "John Bassett",
            phoneNumbers: [{ value: "111-564-7897" }]
         }
      }
   }
}
