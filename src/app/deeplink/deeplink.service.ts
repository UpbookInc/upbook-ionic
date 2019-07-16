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
import { HTTP } from '@ionic-native/http/ngx';
import { ProfileService } from '../profile/service/profile.service';

@Injectable({
   providedIn: 'root'
})
export class DeeplinkService {

   constructor(protected deeplinks: Deeplinks, protected navController: NavController, private zone: NgZone,
      private debugService: DebugService, private modalController: ModalController, private contactsService: ContactsService,
      public toastService: ToastService, private deltaService: DeltasService, private networkStoreService: NetworkStoreService, private http: HTTP,
      private profileService: ProfileService) { }

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
      this.toastService.presentToast('Processing contact update, please wait...', 'secondary');

      // parse raw query string into update object
      var profileDataId = this.parseContactQueryString(match.$link.queryString);
      var rawProfileData = await this.requestProfileData(profileDataId)
      var contactUpdates = this.parseProfileData(rawProfileData);

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
            let contactFromUB = await this.networkStoreService.getContactFromUBNetwork(updatedContact);

            //only need to update this if we are saving them to our network
            if (contactFromUB && contactFromUB.length > 0) {
               //contact update was for one we have in our network
               if (updatedContact.phoneNumbers) {
                  // Save the first number just to capture one so we have something to display.
                  // We currently send a message to all numbers, if this changes, we'll have to move back
                  // to selecting a specific number.
                  updatedContact.contactNumber = updatedContact.phoneNumbers[0];

                  // now save changes to UB network 
                  await this.networkStoreService.updateMultipleUBContacts([updatedContact]);
               }
            }
            this.toastService.presentToast('Successfully saved updates!', 'success');
            this.networkStoreService.clearSessionDeviceContacts();
         }
      }
   }

   private async requestProfileData(profileId) {
      var dataId = { dataId: profileId };
      var profileData = await this.http.get(this.profileService.getApi(),
         dataId,
         {})
         .then((data) => {
            this.debugService.add("DeeplinkService.sendProfileToNetwork: http success");
            return data;
         }, (errorData) => {
            this.debugService.add("DeeplinkService.sendProfileToNetwork: http error");
            this.toastService.presentToast('Contact data unavailable. Have contact resend profile.', 'danger');
            return Promise.reject(undefined);
         });
      return profileData;
   }

   parseContactQueryString(queryStringWithUpdates) {
      var searchParams = new URLSearchParams(queryStringWithUpdates);
      return searchParams.get('updates');
   }

   parseProfileData(rawProfileData) {
      var dataFromRequest = rawProfileData.data;
      var jsonProfileData = JSON.parse(dataFromRequest);
      var decodedUpdate = atob(jsonProfileData.data);
      console.log(decodedUpdate);
      var decodedAndParsedContactUpdates = JSON.parse(decodedUpdate);
      return decodedAndParsedContactUpdates;
   }
}
