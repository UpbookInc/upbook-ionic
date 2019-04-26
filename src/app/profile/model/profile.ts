import { ContactField, ContactOrganization, ContactAddress } from '@ionic-native/contacts/ngx';

export const baseAddrName = 'streetAddress';
export const baseOrgName = 'name';

export class Profile {

   constructor(
      public firstName?: string,
      public lastName?: string,
      public displayName?: string,
      public phoneNumbers?: ContactField[],
      public emails?: ContactField[],
      public addresses?: ContactAddress[],
      public organizations?: ContactOrganization[]) {
   }

   
}