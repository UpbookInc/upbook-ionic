import { Component, OnInit } from '@angular/core';
import { ProfileService } from './service/profile.service';
import { FormsModule } from '@angular/forms';

@Component({
  	selector: 'app-profile',
  	templateUrl: './profile.page.html',
  	styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

   personalProfile = {};
  	constructor(private profileService:ProfileService) { }

  	ngOnInit() {
      this.personalProfile = this.profileService.getPersonalProfile();
  	}

}
