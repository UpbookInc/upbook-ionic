import { Component, NgZone } from '@angular/core';

import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { Storage } from '@ionic/storage';
import { DeeplinkService } from './deeplink/deeplink.service';

@Component({
   selector: 'app-root',
   templateUrl: 'app.component.html'
})
export class AppComponent {

   constructor(
      private platform: Platform,
      private splashScreen: SplashScreen,
      private statusBar: StatusBar,
      protected deeplinks: Deeplinks,
      protected navController: NavController,
      private zone: NgZone,
      private storage: Storage,
      private deeplinkService: DeeplinkService
   ) {
      this.initializeApp();
   }

   initializeApp() {
      this.platform.ready().then(() => {
         this.statusBar.styleDefault();
         this.splashScreen.hide();
        
         this.deeplinkService.setupDeepLinkRouting();

      });
   }
}
