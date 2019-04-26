import { ContactField } from '@ionic-native/contacts/ngx';

export class Profile {

   constructor(
      public firstName?: string,
      public lastName?: string,
      public displayName?: string,
      public phoneNumbers?: ContactField[],
      public emails?: ContactField[],
      public addresses?: ContactField[],
      public organizations?: ContactField[]) {
   }
}