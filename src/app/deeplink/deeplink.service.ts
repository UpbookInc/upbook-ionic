import { Injectable, NgZone } from '@angular/core';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { NavController } from '@ionic/angular';
import { DebugService } from '../debug/debug.service';
import { ModalController } from '@ionic/angular';
import { ContactUpdatePage } from '../contacts/contact-update/contact-update.page';
import { ContactsService } from '../contacts/contacts.service';
import { DeltasService } from '../contacts/deltas/deltas.service';
import { ToastService } from '../toast/toast.service';
import { NetworkStoreService } from '../networkStore/networkStore.service';
import { MultiAttrPage } from '../multi-attr/multi-attr.page';

@Injectable({
   providedIn: 'root'
})
export class DeeplinkService {

   constructor(protected deeplinks: Deeplinks, protected navController: NavController, private zone: NgZone,
      private debugService: DebugService, private modalController: ModalController, private contactsService: ContactsService,
      public toastService: ToastService, private deltaService: DeltasService, private networkStoreService: NetworkStoreService) { }

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
   async contactUpdateIntentMatch(match) {
      this.debugService.add("DeeplinkService.setupDeepLinkRouting: Successfully matched route:");
      this.debugService.add(match);

      // parse raw query string into update object
      var contactUpdates = this.parseContactQueryString(match.$link.queryString);

      const contactWithUpdatesAndDeltas = await this.deltaService.buildContactWithDeltasAndUpdates(contactUpdates);
      console.log(contactWithUpdatesAndDeltas);

      const saveData = await this.modalController.create({
         component: ContactUpdatePage,
         componentProps: contactWithUpdatesAndDeltas
      }).then((modal) => {
         modal.present();
         this.debugService.add("DeeplinkService.setupDeepLinkRouting: Successfully navigated to route.");
         return modal.onDidDismiss();
      });

      if (saveData.data.save === true) {
         this.toastService.presentToast('Saving contact updates, please wait...', 'secondary');

         contactUpdates.deltas = contactWithUpdatesAndDeltas.deltas;
         let updatedContact = await this.contactsService.updateContact(contactUpdates);
         if (updatedContact == undefined) {
            this.toastService.presentToast('Failed to save contact updates, manually update', 'danger');
         } else {
            this.toastService.presentToast('Successfully saved updates!', 'success');

            let contactFromUB = await this.networkStoreService.getContactFromUBNetwork(updatedContact);

            //only need to update this if we are saving them to our network
            if (contactFromUB && contactFromUB.length > 0) {
               //contact update was for one we have in our network
               if (updatedContact.phoneNumbers) {
                  if (updatedContact.phoneNumbers.length > 1) {
                     const selectedPhoneNumber = await this.showMultiPhoneSelectionModal(updatedContact.phoneNumbers, updatedContact.name);
                     updatedContact.contactNumber = selectedPhoneNumber;
                  } else {
                     updatedContact.contactNumber = updatedContact.phoneNumbers[0];
                  }
                  // now save changes to UB network 
                  await this.networkStoreService.updateMultipleUBContacts([updatedContact]);
               }
            }

            this.networkStoreService.clearSessionDeviceContacts();
         }
      }
   }

   async showMultiPhoneSelectionModal(phoneNumbers, name) {
      const multiAttrProps = {
         multiAttrSelectMessage: 'Select phone number for sending updates',
         multiAttrName: 'phoneNumbers',
         multiAttr: phoneNumbers,
         multiAttrValueName: 'value',
         subjectName: name

      };

      return this.modalController.create({
         component: MultiAttrPage,
         componentProps: multiAttrProps
      }).then((modal) => {
         modal.present();
         return modal.onDidDismiss().then(data => {
            if (data.data.selectedAttr) {
               return data.data.selectedAttr;
            }
            return undefined;
         });
      });
   }

   parseContactQueryString(queryStringWithUpdates) {
      var searchParams = new URLSearchParams(queryStringWithUpdates);
      var base64ContactUpdates = searchParams.get('updates');
      var decodedUpdate = atob(base64ContactUpdates);
      console.log(decodedUpdate);
      var decodedAndParsedContactUpdates = JSON.parse(decodedUpdate);
      return decodedAndParsedContactUpdates;
   }
}
