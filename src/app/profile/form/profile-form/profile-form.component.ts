import { Component, EventEmitter, Output } from '@angular/core';
import { ProfileService } from '../../service/profile.service';
import { Profile, baseAddrName, baseOrgName } from '../../model/profile';
import { DebugService } from 'src/app/debug/debug.service';
import { ContactField } from '@ionic-native/contacts/ngx';
import { ToastService } from 'src/app/toast/toast.service';

@Component({
   selector: 'app-profile-form',
   templateUrl: './profile-form.component.html',
   styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent {

   @Output() saveClicked: EventEmitter<null> = new EventEmitter<null>();
   profile: Profile = new Profile();
   firstNumber;
   editMode = false;

   constructor(private profileService: ProfileService, private debugService: DebugService, public toastService: ToastService) { }

   // this is called by the parent profile page each time the view becomes active
   async getPersonalProfile() {
      this.debugService.add("ProfileFormComponent.getPersonalProfile: getting personal profile from store.");

      const profileResponse = await this.profileService.getPersonalProfile();
      if (profileResponse) {
         this.profile = profileResponse;
         this.debugService.add("ProfileFormComponent: personal profile from UB store.");
         this.debugService.add(JSON.stringify(this.profile));
      } else {
         this.debugService.add("ProfileFormComponent.ngOnInit: profile is empty.");
         this.editMode = true;
      }
      this.initEmptyProfileFields();
   }

   initEmptyProfileFields() {
      if (this.profile.phoneNumbers) {
         if (this.profile.phoneNumbers.length < 1 || !this.profile.phoneNumbers[0].value || this.profile.phoneNumbers[0].value == '') {
            this.profile.phoneNumbers = [];
         }
      } else {
         this.profile.phoneNumbers = [];
      }

      if (this.profile.emails) {
         if (this.profile.emails.length < 1 || !this.profile.emails[0].value || this.profile.emails[0].value == '') {
            this.profile.emails = [];
         }
      } else {
         this.profile.emails = [];
      }

      if (this.profile.addresses) {
         if (this.profile.addresses.length < 1 || !this.profile.addresses[0].streetAddress || this.profile.addresses[0].streetAddress == '') {
            this.profile.addresses = [];
         }
      } else {
         this.profile.addresses = [];
      }

      if (this.profile.organizations) {
         if (this.profile.organizations.length < 1 || !this.profile.organizations[0].name || this.profile.organizations[0].name == '') {
            this.profile.organizations = [];
         }
      } else {
         this.profile.organizations = [];
      }
   }

   onSubmit() {
      this.filterEmptyContactFields();
      this.editMode = false;
      this.debugService.add("ProfileFormComponent.onSubmit: Submitted, Saved personal profile.");
      this.debugService.add(JSON.stringify(this.profile));

      //let profileTest = new Profile("Joe", "Smith", "Joe Smith", ["555-111-2222"], ["juice@upbook.com"], ["123 Some Steet"], []);
      //this.profile.phoneNumbers = ["555-111-2222"];
      //this.profile.phoneNumbers = undefined;
      this.profileService.saveProfileToUBDatabase(this.profile);
      // emits event to parent profile page
      this.saveClicked.emit();
      this.toastService.presentToast('Profile Saved!', 'success');
   }

   addNewItem(profileItemArrayName, baseFieldName: string = 'value') {
      if (this.profile[profileItemArrayName].length >= 1) {
         if (this.profile[profileItemArrayName][this.profile[profileItemArrayName].length - 1][baseFieldName] != null
            && this.profile[profileItemArrayName][this.profile[profileItemArrayName].length - 1][baseFieldName] != '') {
            this.profile[profileItemArrayName].push(new ContactField());
         } else {
            this.profile[profileItemArrayName][this.profile[profileItemArrayName].length - 1] = new ContactField();
         }
      } else {
         this.profile[profileItemArrayName] = [];
         this.profile[profileItemArrayName].push(new ContactField());
      }
   }

   private filterEmptyContactFields() {
      this.profile.phoneNumbers = this.clearEmptyItems(this.profile.phoneNumbers);
      this.profile.emails = this.clearEmptyItems(this.profile.emails);
      this.profile.addresses = this.clearEmptyItems(this.profile.addresses, baseAddrName);
      this.profile.organizations = this.clearEmptyItems(this.profile.organizations, baseOrgName);
   }

   private clearEmptyItems(contactFieldsArray, baseFieldName: string = 'value') {
      if (contactFieldsArray && contactFieldsArray.length >= 1) {
         contactFieldsArray = contactFieldsArray.filter(item => item[baseFieldName] && item[baseFieldName] != '');
      }
      return contactFieldsArray;
   }

   removeItemFromArray(item, itemArray) {
      itemArray = itemArray.splice(itemArray.indexOf(item), 1);
   }

   cancel() {
      this.editMode = false;
      this.getPersonalProfile();
   }

   editProfile(isEditMode: boolean) {
      this.editMode = isEditMode;
   }

   trackByFn(index: any, item: any) {
      return index;
   }
}
