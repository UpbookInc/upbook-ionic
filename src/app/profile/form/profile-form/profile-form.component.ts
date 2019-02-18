import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../service/profile.service';

@Component({
   selector: 'app-profile-form',
   templateUrl: './profile-form.component.html',
   styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnInit {

   private profile = {};
   constructor(private profileService: ProfileService) { }

   ngOnInit() {
      this.profile = this.profileService.getPersonalProfile();
      console.log("Starting personal profile");
      console.log(this.profile);
   }

   onSubmit() {
      console.log("Submitted");
      console.log("Saved personal profile: ");
      console.log(this.profile);
   }

}
