import { Component, OnInit, EventEmitter, Output, HostListener } from '@angular/core';
import { ProfileService } from '../../service/profile.service';
import { Profile } from '../../model/profile';
import { DebugService } from 'src/app/debug/debug.service';
import { ToastController } from '@ionic/angular';

@Component({
   selector: 'app-profile-form',
   templateUrl: './profile-form.component.html',
   styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnInit {

   @Output() saveClicked: EventEmitter<null> = new EventEmitter<null>();
   profile: Profile = new Profile();

   constructor(private profileService: ProfileService, private debugService: DebugService, public toastController: ToastController) { }

   // this is called by the parent profile page each time the view becomes active
   async getPersonalProfile() {
      this.debugService.add("ProfileFormComponent.getPersonalProfile: getting personal profile from store.");

      const profileResponse = await this.profileService.getPersonalProfile();
      if (profileResponse != null && profileResponse != undefined && profileResponse != '') {
         this.profile = profileResponse;
         this.debugService.add("ProfileFormComponent: personal profile from UB store.");
         this.debugService.add(JSON.stringify(this.profile));
      } else {
         this.debugService.add("ProfileFormComponent.ngOnInit: profile is empty.");
      }
   }

   onSubmit() {
      this.debugService.add("ProfileFormComponent.onSubmit: Submitted, Saved personal profile.");
      this.debugService.add(JSON.stringify(this.profile));
      this.profileService.saveProfileToUBDatabase(this.profile);
      // emits event to parent profile page
      this.saveClicked.emit();
      this.presentToast('Profile Saved!', 'success');
   }

   async presentToast(message, color) {
      const toast = await this.toastController.create({
         message: message,
         duration: 3000,
         color: color
      });
      toast.present();
   }

   ngOnInit() { }
}
