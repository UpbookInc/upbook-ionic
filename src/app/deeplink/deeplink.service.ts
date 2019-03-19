import { Injectable, NgZone } from '@angular/core';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { NavController } from '@ionic/angular';
import { DebugService } from '../debug/debug.service';
import { ModalController } from '@ionic/angular';
import { ContactUpdatePage } from '../contacts/contact-update/contact-update.page';
import { ContactsService } from '../contacts/contacts.service';
import { Contact } from '@ionic-native/contacts/ngx';

// DEBUG:
// generate base64 hash of contact object with updates:
// > btoa(JSON.stringify({"displayName":"John Bassett","phoneNumbers":[{"value":"5551110000"}]}));
// clear out phone numbers for "John Bassett" contact: 
// > adb shell am start -a android.intent.action.VIEW -d "https://fractalstack.com/upbook/intent?updates=eyJkaXNwbGF5TmFtZSI6IkpvaG4gQmFzc2V0dCIsInBob25lTnVtYmVycyI6W119"
// Send command to mimic link click: 
// > adb shell am start -a android.intent.action.VIEW -d "https://fractalstack.com/upbook/intent?updates=
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
         this.contactUpdateIntentMatch(match);
      }, nomatch => {
         console.error('Got a deeplink that didn\'t match', nomatch);
      });
   }

   // match.$route - the route we matched, which is the matched entry from the arguments to route()
   // match.$args - the args passed in the link
   // match.$link - the full link data
   contactUpdateIntentMatch(match) {
      this.debugService.add("DeeplinkService.setupDeepLinkRouting: Successfully matched route:");
      this.debugService.add(match);

      // parse raw query string into update object
      var contactUpdates = this.parseContactQueryString(match.$link.queryString);

      this.contactsService.buildContactWithUpdates(contactUpdates).then((contactWithUpdatesAndDeltas) => {
         console.log(contactWithUpdatesAndDeltas)

         this.modalController.create({
            component: ContactUpdatePage,
            componentProps: contactWithUpdatesAndDeltas
         }).then((modal) => {
            modal.present();
            this.debugService.add("DeeplinkService.setupDeepLinkRouting: Successfully navigated to route.");

            modal.onDidDismiss().then(data => {
               if (data.data.save === true) {
                  this.contactsService.updateContact(contactUpdates)
               }
            });
         });
      });
   }

   getContactFromDevice(displayName): Promise<Contact> {
      return this.contactsService.findContactByName(displayName).then(contactFound => {
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
   parseContactQueryString(queryStringWithUpdates) {
      var searchParams = new URLSearchParams(queryStringWithUpdates);
      var base64ContactUpdates = searchParams.get('updates');
      console.log(base64ContactUpdates);

      var decodedUpdate = atob(base64ContactUpdates);
      console.log(decodedUpdate);

      var decodedAndParsedContactUpdates = JSON.parse(decodedUpdate);
      //console.log(decodedAndParsedContactUpdates);
      return decodedAndParsedContactUpdates;
   }
}
